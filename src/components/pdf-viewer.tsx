
"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { FileQuestion } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Skeleton } from './ui/skeleton';
import PdfMagnifier from './pdf-magnifier';
import { cn } from "@/lib/utils";

// Mengatur workerSrc untuk react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Tambahkan CSS untuk menyembunyikan scrollbar
const SCROLLBAR_STYLES = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

type PdfViewerProps = {
  pdfUri: string | null;
  setTotalPages: (pages: number) => void;
  setApi?: (api: CarouselApi) => void;
  zoomLevel: number;
  isMagnifierEnabled: boolean;
  onDimensionsReady?: (dimensions: { width: number; height: number }) => void;
};

export default function PdfViewer({
  pdfUri,
  setTotalPages: setTotalPagesProp,
  setApi,
  zoomLevel,
  isMagnifierEnabled,
  onDimensionsReady,
}: PdfViewerProps) {
  const { toast } = useToast();
  const [numPages, setNumPages] = useState(0);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages: nextNumPages }: PDFDocumentProxy): void => {
    setNumPages(nextNumPages);
    setTotalPagesProp(nextNumPages);
  }, [setTotalPagesProp]);

  const onPageLoadSuccess = useCallback((page: PDFPageProxy) => {
    if (onDimensionsReady) {
      const viewport = page.getViewport({ scale: 1 });
      onDimensionsReady({ width: viewport.width, height: viewport.height });
    }
  }, [onDimensionsReady]);

  function onDocumentLoadError(error: Error) {
    if (error.name === 'AbortException') return; // Ignore abort errors
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
  
  const onTextLayerRenderError = useCallback((error: Error) => {
    // This error happens when quickly zooming or navigating. It's safe to ignore.
    if (error.name === 'AbortException') return;
     console.error("Error rendering text layer:", error);
  }, []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (isMagnifierEnabled) {
          const pageRect = pageContainerRef.current?.getBoundingClientRect();
          if (pageRect) {
              setMousePosition({
                  x: e.clientX - pageRect.left,
                  y: e.clientY - pageRect.top,
              });
          }
      }
  }, [isMagnifierEnabled]);
  
  return (
    <>
      <style>{SCROLLBAR_STYLES}</style>
      <div 
        className={cn(
          "h-full w-full overflow-auto hide-scrollbar",
           zoomLevel > 1 && "cursor-grab",
           "flex items-start justify-center" // Selalu mulai dari atas
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePosition(null)}
      >
        {pdfUri ? (
          <Document
            file={pdfUri}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<Skeleton className="w-full h-full" />}
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
                  <CarouselItem key={`page_${index + 1}`} className="flex items-center justify-center">
                    <div
                      ref={pageContainerRef}
                      className="relative"
                      style={{ cursor: isMagnifierEnabled ? 'none' : 'default' }}
                    >
                      <Page
                        pageNumber={index + 1}
                        renderTextLayer={{
                              onRenderError: onTextLayerRenderError,
                          }}
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
    </>
  );
}
