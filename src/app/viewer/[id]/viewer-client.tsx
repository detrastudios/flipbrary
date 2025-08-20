
"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useDebounce } from "@/hooks/use-debounce";
import { improveSearchTerms } from "@/ai/flows/improve-search-terms";
import ControlPanel from "@/components/control-panel";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ArrowLeft, ChevronsLeft, ChevronsRight, ZoomIn, ZoomOut } from "lucide-react";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import Link from 'next/link';
import type { CarouselApi } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestedTerms, setSuggestedTerms] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [ebookId, setEbookId] = useState<number | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | undefined>();
  const [zoomLevel, setZoomLevel] = useState(1.0); // State baru: zoomLevel

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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
    if (debouncedSearchTerm) {
      setIsSearching(true);
      improveSearchTerms({ searchTerm: debouncedSearchTerm })
        .then((response) => {
          setSuggestedTerms(response.relatedTerms);
        })
        .catch((error) => {
          console.error("Gagal mendapatkan saran:", error);
          toast({
            variant: "destructive",
            title: "AI Error",
            description: "Gagal mendapatkan saran pencarian dari AI.",
          });
        })
        .finally(() => {
          setIsSearching(false);
        });
    } else {
      setSuggestedTerms([]);
    }
  }, [debouncedSearchTerm, toast]);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSuggestedTermClick = (term: string) => {
    setSearchTerm(term);
  };

  const handleNextPage = useCallback(() => {
    carouselApi?.scrollNext();
  }, [carouselApi]);

  const handlePrevPage = useCallback(() => {
    carouselApi?.scrollPrev();
  }, [carouselApi]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 0.1, 2.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
       <header className="flex items-center justify-between p-2 border-b bg-background/80 backdrop-blur-sm z-20 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
                <Link href="/">
                    <ArrowLeft />
                    <span className="sr-only">Kembali ke Library</span>
                </Link>
            </Button>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold truncate">PDF Viewer</h1>
            </div>
        </div>
        {/* Tambahkan tombol zoom di sini */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
          <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoomLevel >= 2.0}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Buka Panel Kontrol</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md z-30">
             <SheetHeader>
                <SheetTitle>Panel Kontrol</SheetTitle>
                <SheetDescription>
                    Gunakan fitur di bawah untuk berinteraksi dengan PDF Anda.
                </SheetDescription>
            </SheetHeader>
            <ControlPanel
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              suggestedTerms={suggestedTerms}
              isSearching={isSearching}
              onSuggestedTermClick={handleSuggestedTermClick}
              pdfLoaded={!!pdfDataUri}
            />
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 relative flex items-center justify-center overflow-hidden">
        <PdfViewer
            pdfUri={pdfDataUri}
            setTotalPages={setTotalPages}
            setApi={setCarouselApi}
            zoomLevel={zoomLevel} // Perbaikan: Teruskan prop zoomLevel
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
