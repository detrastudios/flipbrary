"use client";

import Image from "next/image";
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type PdfViewerProps = {
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export default function PdfViewer({
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
          <div
            className="transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <Image
              key={currentPage} // Re-render image on page change
              src={`https://placehold.co/800x1131.png?text=Page+${currentPage}`}
              alt={`PDF Page ${currentPage}`}
              width={800}
              height={1131}
              className="shadow-lg"
              data-ai-hint="document page"
              priority
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-center p-2 bg-background/80 backdrop-blur-sm border-t">
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onZoomOut} disabled={zoomLevel <= 0.5}>
                <ZoomOut className="h-4 w-4" />
                <span className="sr-only">Zoom Out</span>
            </Button>
            <span className="text-sm text-muted-foreground w-16 text-center">
                {Math.round(zoomLevel * 100)}%
            </span>
            <Button variant="outline" size="icon" onClick={onZoomIn} disabled={zoomLevel >= 2}>
                <ZoomIn className="h-4 w-4" />
                <span className="sr-only">Zoom In</span>
            </Button>
        </div>
        <div className="flex-1 h-px bg-border mx-4"></div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onPrevPage} disabled={currentPage <= 1}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
            </Button>
            <span className="text-sm font-medium w-24 text-center">
                Page {currentPage} of {totalPages}
            </span>
            <Button variant="outline" size="icon" onClick={onNextPage} disabled={currentPage >= totalPages}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
