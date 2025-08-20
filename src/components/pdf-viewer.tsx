"use client";

import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type PdfViewerProps = {
  pdfUri: string | null;
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export default function PdfViewer({
  pdfUri,
  currentPage,
  totalPages,
  zoomLevel,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
}: PdfViewerProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 bg-muted/20">
        <div className="overflow-auto h-[70vh] rounded-md flex items-center justify-center bg-gray-200 dark:bg-gray-800">
          {pdfUri ? (
            <div
              className="transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* This is a simplified viewer. A real implementation would use a library like react-pdf */}
              <iframe
                src={`${pdfUri}#page=${currentPage}&toolbar=0&navpanes=0`}
                width={800}
                height={1131}
                className="shadow-lg border-0"
                title="Penampil PDF"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <FileQuestion className="h-16 w-16" />
              <p className="text-lg">Silakan unggah file PDF untuk melihatnya.</p>
            </div>
          )}
        </div>
      </CardContent>
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
                Halaman {pdfUri ? currentPage : "-"} dari {pdfUri ? totalPages : "-"}
            </span>
            <Button variant="outline" size="icon" onClick={onNextPage} disabled={!pdfUri || currentPage >= totalPages}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Halaman Berikutnya</span>
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
