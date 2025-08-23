
"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronsLeft, ChevronsRight, ZoomIn, ZoomOut, Settings, Library } from "lucide-react";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import Link from 'next/link';
import type { CarouselApi } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import SettingsPanel from "@/components/settings-panel";
import { useResizeObserver } from "@wojtekmaj/react-hooks";

const PdfViewer = dynamic(() => import("@/components/pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-800">
        <Skeleton className="w-full h-full" />
    </div>
  ),
});

type ViewerPageProps = {
    id: string;
}

export default function ViewerPageClient({ id }: ViewerPageProps) {
  const { toast } = useToast();
  const { getEbookById } = useIndexedDB();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [ebookId, setEbookId] = useState<number | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | undefined>();
  const [zoomLevel, setZoomLevel] = useState(1.0); 

  useEffect(() => {
    if (id) {
        const parsedId = parseInt(id, 10);
        if (!isNaN(parsedId)) {
            setEbookId(parsedId);
        }
    }
  }, [id]);

  useEffect(() => {
    if (ebookId !== null) {
        getEbookById(ebookId).then(ebook => {
            if (ebook && ebook.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPdfDataUri(e.target?.result as string);
                };
                reader.readAsDataURL(ebook.data);
            } else if (!ebook) {
                 toast({
                    variant: "destructive",
                    title: "Ebook tidak ditemukan",
                    description: "Tidak dapat menemukan ebook di library Anda.",
                });
            }
        });
    }
  }, [ebookId, getEbookById, toast]);


  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentPage(carouselApi.selectedScrollSnap() + 1);
    };

    carouselApi.on("select", onSelect);
    onSelect(); 

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);


  const handleNextPage = useCallback(() => {
    carouselApi?.scrollNext();
  }, [carouselApi]);

  const handlePrevPage = useCallback(() => {
    carouselApi?.scrollPrev();
  }, [carouselApi]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 0.2, 2.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.2, 0.4));
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
       <header className="flex items-center justify-between p-2 border-b bg-background/80 backdrop-blur-sm z-20 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild>
                <Link href="/">
                    <ArrowLeft />
                    <span className="sr-only">Kembali ke Library</span>
                </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Library className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold truncate">Flipbrary</h1>
            </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoomLevel <= 0.4}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
          <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoomLevel >= 2.0}>
            <ZoomIn className="h-4 w-4" />
          </Button>
           <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Buka Pengaturan</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Pengaturan</SheetTitle>
                  <SheetDescription>
                    Atur preferensi tampilan aplikasi Anda di sini.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <SettingsPanel />
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center overflow-hidden">
        <PdfViewer
            pdfUri={pdfDataUri}
            setTotalPages={setTotalPages}
            setApi={setCarouselApi}
            zoomLevel={zoomLevel}
        />
      </main>

      <footer className="flex items-center justify-center p-2 border-t bg-background/80 backdrop-blur-sm z-20 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={handlePrevPage} disabled={!carouselApi?.canScrollPrev()}>
                  <ChevronsLeft />
                  <span className="sr-only">Halaman Sebelumnya</span>
              </Button>
              <p className="text-sm text-muted-foreground">
                  Halaman {currentPage} dari {totalPages}
              </p>
              <Button variant="outline" size="icon" onClick={handleNextPage} disabled={!carouselApi?.canScrollNext()}>
                  <ChevronsRight />
                  <span className="sr-only">Halaman Berikutnya</span>
              </Button>
          </div>
      </footer>
    </div>
  );
}
