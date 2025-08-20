"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useDebounce } from "@/hooks/use-debounce";
import { improveSearchTerms } from "@/ai/flows/improve-search-terms";
import ControlPanel from "@/components/control-panel";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowLeft } from "lucide-react";
import { useIndexedDB, Ebook } from "@/hooks/use-indexed-db";
import Link from 'next/link';

const PdfViewer = dynamic(() => import("@/components/pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-800">
      <Skeleton className="h-[80vh] w-[80%]" />
    </div>
  ),
});

type ViewerPageProps = {
    params: { id: string }
}

export default function ViewerPage({ params }: ViewerPageProps) {
  const { toast } = useToast();
  const { getEbookById } = useIndexedDB();

  const [zoomLevel, setZoomLevel] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestedTerms, setSuggestedTerms] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const ebookId = parseInt(params.id, 10);
    if (!isNaN(ebookId)) {
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
  }, [params.id, getEbookById, toast]);

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


  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.4));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSuggestedTermClick = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900">
       <header className="flex items-center justify-between p-2 border-b bg-background shadow-sm">
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
                <Link href="/">
                    <ArrowLeft />
                    <span className="sr-only">Kembali ke Library</span>
                </Link>
            </Button>
            <h1 className="text-lg font-semibold truncate">PDF Viewer</h1>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Buka Panel Kontrol</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
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
            />
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 relative">
        <PdfViewer
            pdfUri={pdfDataUri}
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            totalPages={totalPages}
            setTotalPages={setTotalPages}
        />
      </main>
    </div>
  );
}
