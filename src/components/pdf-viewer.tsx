"use client";

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { ZoomIn, ZoomOut, FileQuestion, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useState, useEffect, useRef } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PdfViewerProps = {
  pdfUri: string | null;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  setZoomLevel: (zoom: number) => void;
};

export default function PdfViewer({
  pdfUri,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  totalPages,
  setTotalPages,
  setZoomLevel,
}: PdfViewerProps) {
  const { toast } = useToast();
  const [isZooming, setIsZooming] = useState(false);
  const [initialWidth, setInitialWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
        // Atur lebar awal untuk zoom responsif, dikurangi sedikit padding
        setInitialWidth(containerRef.current.clientWidth - 40);
    }
  }, []);


  useEffect(() => {
    setIsZooming(true);
    const timer = setTimeout(() => setIsZooming(false), 300); // Sesuaikan durasi jika perlu
    return () => clearTimeout(timer);
  }, [zoomLevel]);


  function onDocumentLoadSuccess({ numPages }: PDFDocumentProxy): void {
    setTotalPages(numPages);
  }

  function onDocumentLoadError(error: Error) {
    // Peringatan AbortException tidak berbahaya dan dapat diabaikan
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
       <div ref={containerRef} className="h-full overflow-auto flex items-start justify-center bg-gray-200 dark:bg-gray-800">
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
                  renderTextLayer={!isZooming} // Nonaktifkan renderTextLayer saat zoom
                  renderAnnotationLayer={false}
                  className="mb-4 shadow-lg"
                  width={initialWidth ? initialWidth : undefined}
                  onRenderSuccess={() => {
                      if (index === 0 && initialWidth) {
                          // Setelah halaman pertama dirender dengan lebar awal,
                          // nonaktifkan `width` dan biarkan `scale` yang mengontrol
                          setInitialWidth(null);
                      }
                  }}
                />
              ))}
            </Document>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground h-full">
            <FileQuestion className="h-16 w-16" />
            <p className="text-lg text-center px-4">Memuat Ebook...</p>
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
