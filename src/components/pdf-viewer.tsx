"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { FileQuestion } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Skeleton } from './ui/skeleton';
import PdfMagnifier from './pdf-magnifier';
import { cn } from '@/lib/utils';

// Mengatur workerSrc untuk react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PdfViewerProps = {
  pdfUri: string | null;
  setTotalPages: (pages: number) => void;
  setApi?: (api: CarouselApi) => void;
  zoomLevel: number;
  isMagnifierEnabled: boolean;
};

export default function PdfViewer({
  pdfUri,
  setTotalPages: setTotalPagesProp,
  setApi,
  zoomLevel,
  isMagnifierEnabled,
}: PdfViewerProps) {
  const { toast } = useToast();
  const [numPages, setNumPages] = useState(0);

  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages: nextNumPages }: PDFDocumentProxy): void => {
    setNumPages(nextNumPages);
    setTotalPagesProp(nextNumPages);
  }, [setTotalPagesProp]);

  const onPageLoadSuccess = useCallback((page: PDFPageProxy) => {
    if (!pageDimensions) {
      const viewport = page.getViewport({ scale: 1 });
      setPageDimensions({ width: viewport.width, height: viewport.height });
    }
  }, [pageDimensions]);

  function onDocumentLoadError(error: Error) {
    if (error.name === 'AbortException') return;
    toast({
      variant: "destructive",
      title: "Gagal memuat PDF",
      description: error.message,
    });
    console.error("Error loading PDF:", error);
  }

  const onPageRenderError = useCallback((error: Error) => {
    if (error.name === 'AbortException') return;
    toast({
      variant: "destructive",
      title: "Gagal merender halaman",
      description: error.message,
    });
    console.error("Error rendering page:", error);
  }, [toast]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMagnifierEnabled) return;
    e.preventDefault();
    setIsPanning(true);
    const container = e.currentTarget;
    setStartCoords({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    });
    container.style.cursor = 'grabbing';
  }, [isMagnifierEnabled]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsPanning(false);
    const container = e.currentTarget;
    container.style.cursor = isMagnifierEnabled ? 'none' : 'grab';
  }, [isMagnifierEnabled]);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      const container = e.currentTarget;
      container.style.cursor = isMagnifierEnabled ? 'none' : 'grab';
    }
    if (isMagnifierEnabled) {
      setMousePosition(null);
    }
  }, [isPanning, isMagnifierEnabled]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (isMagnifierEnabled) {
      const pageRect = pageContainerRef.current?.getBoundingClientRect();
      if (pageRect) {
        setMousePosition({
          x: e.clientX - pageRect.left,
          y: e.clientY - pageRect.top,
        });
      }
    }

    if (!isPanning || !container) return;
    const dx = e.clientX - startCoords.x;
    const dy = e.clientY - startCoords.y;
    container.scrollLeft = startCoords.scrollLeft - dx;
    container.scrollTop = startCoords.scrollTop - dy;
  }, [isPanning, startCoords, isMagnifierEnabled]);


  const getCursorStyle = useCallback(() => {
    if (isMagnifierEnabled) return 'none';
    return isPanning ? 'grabbing' : 'grab';
  }, [isMagnifierEnabled, isPanning]);

  return (
    <div className="h-full w-full flex items-center justify-center">
      {pdfUri ? (
        <Document
          file={pdfUri}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <Skeleton className="w-full h-full" />
            </div>
          }
          error={
            <div className="w-full h-full flex flex-col items-center justify-center text-destructive">
              Gagal memuat file PDF.
            </div>
          }
          onRenderError={onPageRenderError}
        >
          <Carousel setApi={setApi} className="w-full h-full">
            <CarouselContent className="h-full">
              {Array.from(new Array(numPages), (el, index) => (
                <CarouselItem key={`page_${index + 1}`} className="h-full w-full">
                  <div
                    className={cn("w-full h-full overflow-auto", zoomLevel > 1 && "custom-scrollbar")}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: getCursorStyle() }}
                  >
                    <div
                      className="flex items-start justify-center p-4"
                      style={{
                        width: pageDimensions ? `${pageDimensions.width * zoomLevel}px` : '100%',
                        height: pageDimensions ? `${pageDimensions.height * zoomLevel}px` : '100%',
                        margin: 'auto'
                      }}
                    >
                       <div
                          ref={pageContainerRef}
                          className="relative"
                       >
                          <Page
                            pageNumber={index + 1}
                            renderTextLayer={true}
                            renderAnnotationLayer={false}
                            className="shadow-lg"
                            onRenderError={onPageRenderError}
                            onLoadSuccess={onPageLoadSuccess}
                            scale={zoomLevel}
                          />
                          {isMagnifierEnabled && pageContainerRef.current && mousePosition && (
                            <PdfMagnifier
                              targetRef={pageContainerRef.current}
                              mousePosition={mousePosition}
                              zoomLevel={zoomLevel}
                            />
                          )}
                       </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </Document>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground h-full">
          <FileQuestion className="h-16 w-16" />
          <p className="text-lg text-center px-4">Memuat Ebook...</p>
        </div>
      )}
    </div>
  );
}
