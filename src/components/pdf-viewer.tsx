
"use client";

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileQuestion, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { PDFDocumentProxy } from 'pdfjs-dist';

// Solusi: Tentukan jalur untuk worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PdfViewerProps = {
  pdfUri: string | null;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  currentPage: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
};

export default function PdfViewer({
  pdfUri,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  currentPage,
  onPrevPage,
  onNextPage,
  totalPages,
  setTotalPages
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
    <Card className="overflow-hidden w-full max-w-4xl">
      <CardContent className="p-4 bg-muted/20">
        <div className="overflow-auto h-[70vh] rounded-md flex items-start justify-center bg-gray-200 dark:bg-gray-800">
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
              <Page
                key={`page_${currentPage}`}
                pageNumber={currentPage}
                scale={zoomLevel}
                renderTextLayer={true}
                renderAnnotationLayer={false}
                className="mb-4 shadow-lg"
              />
            </Document>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground h-full">
              <FileQuestion className="h-16 w-16" />
              <p className="text-lg text-center px-4">Memuat Ebook...</p>
            </div>
          )}
        </div>
      </CardContent>
      {pdfUri && (
        <CardFooter className="flex items-center justify-center p-2 bg-background/80 backdrop-blur-sm border-t">
          <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={onZoomOut} disabled={!pdfUri || zoomLevel <= 0.5}>
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
          </div>
          <div className="flex-1 h-px bg-border mx-4"></div>
          <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={onPrevPage} disabled={!pdfUri || currentPage <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Halaman Sebelumnya</span>
              </Button>
              <span className="text-sm font-medium w-24 text-center">
                  Halaman {currentPage} dari {totalPages}
              </span>
              <Button variant="outline" size="icon" onClick={onNextPage} disabled={!pdfUri || currentPage >= totalPages}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Halaman Berikutnya</span>
              </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
