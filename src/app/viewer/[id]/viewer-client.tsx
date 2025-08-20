
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useDebounce } from "@/hooks/use-debounce";
import { improveSearchTerms } from "@/ai/flows/improve-search-terms";
import ControlPanel from "@/components/control-panel";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ArrowLeft, BookOpen, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import Link from 'next/link';
import type { IFlipSetting } from "react-pageflip";

const PdfFlipbook = dynamic(() => import("@/components/pdf-flipbook"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-800">
        <BookOpen className="w-24 h-24 text-muted-foreground animate-pulse" />
        <p className="mt-4 text-lg text-muted-foreground">Mempersiapkan buku...</p>
    </div>
  ),
});

type ViewerPageProps = {
    id: string;
}

export default function ViewerPageClient({ id }: ViewerPageProps) {
  const { toast } = useToast();
  const { getEbookById } = useIndexedDB();
  const flipBookRef = useRef<any>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestedTerms, setSuggestedTerms] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [ebookId, setEbookId] = useState<number | null>(null);
  

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

  const onPage = (e: any) => {
    setCurrentPage(e.data);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSuggestedTermClick = (term: string) => {
    setSearchTerm(term);
  };

  const handleNextPage = () => {
    flipBookRef.current?.pageFlip()?.flipNext();
  };

  const handlePrevPage = () => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  };


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

      <main className="flex-1 relative flex items-center justify-center overflow-hidden p-4 md:p-8">
        <PdfFlipbook
            ref={flipBookRef}
            pdfUri={pdfDataUri}
            setTotalPages={setTotalPages}
            onPage={onPage}
        />
      </main>

      <footer className="flex items-center justify-center p-2 border-t bg-background/80 backdrop-blur-sm z-20 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={handlePrevPage} disabled={currentPage === 0}>
                  <ChevronsLeft />
                  <span className="sr-only">Halaman Sebelumnya</span>
              </Button>
              <p className="text-sm text-muted-foreground">
                  Halaman {currentPage + 1} dari {totalPages}
              </p>
              <Button variant="outline" size="icon" onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>
                  <ChevronsRight />
                  <span className="sr-only">Halaman Berikutnya</span>
              </Button>
          </div>
      </footer>
    </div>
  );
}
