
"use client";

import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { FileQuestion, LoaderCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { Skeleton } from './ui/skeleton';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const resizeObserverOptions = {};

type PdfViewerProps = {
  pdfUri: string | null;
  zoomLevel: number;
  setTotalPages: (pages: number) => void;
  setApi?: (api: CarouselApi) => void;
};

export default function PdfViewer({
  pdfUri,
  zoomLevel,
  setTotalPages: setTotalPagesProp,
  setApi,
}: PdfViewerProps) {
  const { toast } = useToast();
  const [numPages, setNumPages] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  const onResize = useCallback<any>(() => {
     if(containerRef) {
      setContainerWidth(containerRef.clientWidth);
     }
  }, [containerRef]);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);


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
  }

  return (
    <div ref={setContainerRef} className="h-full w-full">
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
                    <CarouselItem key={`page_${index + 1}`} className="h-full flex justify-center items-start overflow-y-auto">
                        <Page
                            pageNumber={index + 1}
                            renderTextLayer={true}
                            renderAnnotationLayer={false}
                            className="shadow-lg"
                            width={containerWidth ? containerWidth : undefined}
                            scale={zoomLevel}
                        />
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
