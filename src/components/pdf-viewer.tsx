
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { FileQuestion } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Skeleton } from './ui/skeleton';
import PdfMagnifier from './pdf-magnifier';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [pageContainerRef, setPageContainerRef] = useState<HTMLDivElement | null>(null);


  const onDocumentLoadSuccess = useCallback(({ numPages: nextNumPages }: PDFDocumentProxy): void => {
    setNumPages(nextNumPages);
    setTotalPagesProp(nextNumPages);
  }, [setTotalPagesProp]);

  function onDocumentLoadError(error: Error) {
    if (error.name === 'AbortException') {
      return;
    }
    toast({
      variant: "destructive",
      title: "Gagal memuat PDF",
      description: error.message,
    });
    console.error("Error loading PDF:", error);
  }
  
  const onPageRenderSuccess = useCallback((page: PDFPageProxy) => {
    // This is now handled by the ref on the div wrapper
  }, []);

  const onPageRenderError = (error: Error) => {
    if (error.name === 'AbortException') return;
    toast({
        variant: "destructive",
        title: "Gagal merender halaman",
        description: error.message,
    });
    console.error("Error rendering page:", error);
  };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePosition(null);
  };


  return (
    <div ref={containerRef} className="h-full w-full flex items-center justify-center">
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
        >
            <Carousel setApi={setApi} className="w-full h-full">
                <CarouselContent className="h-full">
                    {Array.from(new Array(numPages), (el, index) => (
                        <CarouselItem key={`page_${index + 1}`} className="h-full flex justify-center items-start overflow-auto">
                            <div 
                                ref={setPageContainerRef}
                                className="p-4 relative" 
                                style={{ cursor: isMagnifierEnabled ? 'none' : 'default' }}
                                onMouseMove={isMagnifierEnabled ? handleMouseMove : undefined}
                                onMouseLeave={isMagnifierEnabled ? handleMouseLeave : undefined}
                            > 
                                <Page
                                    pageNumber={index + 1}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={false}
                                    className="shadow-lg mx-auto"
                                    width={(containerWidth > 0 ? (containerWidth - 32) : containerWidth)}
                                    scale={zoomLevel}
                                    onRenderError={onPageRenderError}
                                    onRenderSuccess={onPageRenderSuccess}
                                />
                                {isMagnifierEnabled && pageContainerRef && mousePosition && (
                                  <PdfMagnifier
                                    targetRef={pageContainerRef}
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
  );
}
