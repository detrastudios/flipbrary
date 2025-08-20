"use client";

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { ZoomIn, ZoomOut, FileQuestion, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useState, useEffect } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PdfViewerProps = {
  pdfUri: string | null;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
};

export default function PdfViewer({
  pdfUri,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  totalPages,
  setTotalPages
}: PdfViewerProps) {
  const { toast } = useToast();
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    setIsZooming(true);
    const timer = setTimeout(() => setIsZooming(false), 300); // Debounce text layer rendering
    return () => clearTimeout(timer);
  }, [zoomLevel]);


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
    <div className="h-screen w-full group">
       <div className="h-full overflow-auto flex items-start justify-center bg-gray-200 dark:bg-gray-800">
        {pdfUri ? (
            <Document
              file={pdfUri}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <LoaderCircle className="mr-2 h-6 w-6 animate-spin" />
                  <span>Memuat PDF...</span>
                </div>
              }
              error={
                <div className="text-destructive">Gagal memuat file PDF.</div>
              }
            >
              {Array.from(new Array(totalPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  scale={zoomLevel}
                  renderTextLayer={!isZooming}
                  renderAnnotationLayer={false}
                  className="mb-4 shadow-lg"
                />
              ))}
            </Document>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground h-full">
            <FileQuestion className="h-16 w-16" />
            <p className="text-lg text-center px-4">Silakan unggah file PDF untuk melihatnya.</p>
          </div>
        )}
      </div>

      {pdfUri && (
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
                <Button variant="outline" size="icon" onClick={onZoomOut} disabled={!pdfUri || zoomLevel <= 0.4}>
                    <ZoomOut className="h-4 w-4" />
                    <span className="sr-only">Perkecil</span>
                </Button>
                <span className="text-sm text-muted-foreground w-16 text-center">
                    {Math.round(zoomLevel * 100)}%
                </span>
                <Button variant="outline" size="icon" onClick={onZoomIn} disabled={!pdfUri || zoomLevel >= 2}>
                    <ZoomIn className="h-4 w-4" />
                    <span className="sr-only">Perbesar</span>
                </Button>
                <div className="h-6 w-px bg-border mx-2"></div>
                <span className="text-sm font-medium w-24 text-center">
                    Total Halaman: {totalPages}
                </span>
            </div>
        </div>
      )}
    </div>
  );
}
