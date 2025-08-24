
"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { FileQuestion } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PDFDocumentProxy } from 'pdfjs-dist';
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
  const [pageContainerRef, setPageContainerRef] = useState<HTMLDivElement | null>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });


  const onDocumentLoadSuccess = useCallback(({ numPages: nextNumPages }: PDFDocumentProxy): void => {
    setNumPages(nextNumPages);
    setTotalPagesProp(nextNumPages);
  }, [setTotalPagesProp]);

  function onDocumentLoadError(error: Error) {
    if (error.name === 'AbortException') return;
    toast({
      variant: "destructive",
      title: "Gagal memuat PDF",
      description: error.message,
    });
    console.error("Error loading PDF:", error);
  }
  
  const onPageRenderError = (error: Error) => {
    if (error.name === 'AbortException') return;
    toast({
        variant: "destructive",
        title: "Gagal merender halaman",
        description: error.message,
    });
    console.error("Error rendering page:", error);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel <= 1 || isMagnifierEnabled) return;
    setIsPanning(true);
    const target = e.currentTarget;
    setStartCoords({
      x: e.pageX - target.offsetLeft,
      y: e.pageY - target.offsetTop,
      scrollLeft: target.scrollLeft,
      scrollTop: target.scrollTop,
    });
    target.style.cursor = 'grabbing';
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsPanning(false);
    if (zoomLevel > 1 && !isMagnifierEnabled) {
      e.currentTarget.style.cursor = 'grab';
    } else {
      e.currentTarget.style.cursor = 'default';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      if (zoomLevel > 1 && !isMagnifierEnabled) {
        e.currentTarget.style.cursor = 'grab';
      } else {
        e.currentTarget.style.cursor = 'default';
      }
    }
    if (isMagnifierEnabled) {
      setMousePosition(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMagnifierEnabled) {
      const pageDiv = pageContainerRef;
      if (pageDiv) {
        const pageRect = pageDiv.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - pageRect.left,
          y: e.clientY - pageRect.top,
        });
      }
    }

    if (!isPanning) return;
    const target = e.currentTarget;
    const x = e.pageX - target.offsetLeft;
    const y = e.pageY - target.offsetTop;
    const walkX = (x - startCoords.x);
    const walkY = (y - startCoords.y);
    target.scrollLeft = startCoords.scrollLeft - walkX;
    target.scrollTop = startCoords.scrollTop - walkY;
  };
  

  const getCursorStyle = () => {
    if (isMagnifierEnabled) return 'none';
    if (zoomLevel > 1) return 'grab';
    return 'default';
  };

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
                                className="w-full h-full overflow-auto flex items-center justify-center"
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUp}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                style={{ cursor: getCursorStyle() }}
                            > 
                                <div 
                                  ref={setPageContainerRef}
                                  className="relative flex justify-center"
                                  style={{
                                    transform: `scale(${zoomLevel})`,
                                    transformOrigin: 'center',
                                    transition: 'transform 0.2s ease-out',
                                  }}
                                >
                                    <Page
                                        pageNumber={index + 1}
                                        renderTextLayer={true}
                                        renderAnnotationLayer={false}
                                        className="shadow-lg"
                                        onRenderError={onPageRenderError}
                                    />
                                    {isMagnifierEnabled && pageContainerRef && mousePosition && (
                                      <PdfMagnifier
                                        targetRef={pageContainerRef}
                                        mousePosition={mousePosition}
                                        zoomLevel={zoomLevel}
                                      />
                                    )}
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
