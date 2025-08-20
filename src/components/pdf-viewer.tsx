
"use client";

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { FileQuestion, LoaderCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import React from 'react';

// Solusi: Tentukan jalur untuk worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PdfViewerProps = {
  pdfUri: string | null;
  zoomLevel: number;
  setTotalPages: (pages: number) => void;
  setApi?: (api: CarouselApi) => void;
};

export default function PdfViewer({
  pdfUri,
  zoomLevel,
  setTotalPages,
  setApi,
}: PdfViewerProps) {
  const { toast } = useToast();

  function onDocumentLoadSuccess({ numPages }: PDFDocumentProxy): void {
    setTotalPages(numPages);
  }

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
    <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
      {pdfUri ? (
        <Carousel setApi={setApi} className="w-full h-full">
            <CarouselContent className="h-full">
                 <Document
                    file={pdfUri}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                        <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground">
                        <LoaderCircle className="mr-2 h-6 w-6 animate-spin" />
                        <span>Memuat PDF...</span>
                        </div>
                    }
                    error={
                        <div className="text-destructive">Gagal memuat file PDF.</div>
                    }
                 >
                    {Array.from(new Array(totalPages), (el, index) => (
                        <CarouselItem key={`page_${index + 1}`} className="h-full flex justify-center items-center overflow-auto">
                            <Page
                                pageNumber={index + 1}
                                scale={zoomLevel}
                                renderTextLayer={true}
                                renderAnnotationLayer={false}
                                className="shadow-lg"
                            />
                        </CarouselItem>
                    ))}
                </Document>
            </CarouselContent>
        </Carousel>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground h-full">
          <FileQuestion className="h-16 w-16" />
          <p className="text-lg text-center px-4">Memuat Ebook...</p>
        </div>
      )}
    </div>
  );
}
