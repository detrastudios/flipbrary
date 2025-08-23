
"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight, ZoomIn, ZoomOut } from "lucide-react";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import type { CarouselApi } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

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
  const [pageInput, setPageInput] = useState("1");
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
      const newPage = carouselApi.selectedScrollSnap() + 1;
      setCurrentPage(newPage);
      setPageInput(String(newPage));
    };

    carouselApi.on("select", onSelect);
    onSelect(); // Panggil sekali untuk inisialisasi

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

  const handleGoToPage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      carouselApi?.scrollTo(pageNumber - 1);
    } else {
      toast({
        variant: "destructive",
        title: "Halaman Tidak Valid",
        description: `Silakan masukkan nomor antara 1 dan ${totalPages}.`,
      });
      // Reset input ke halaman saat ini jika tidak valid
      setPageInput(String(currentPage));
    }
  };

  const handleZoomChange = (value: number[]) => {
    setZoomLevel(value[0]);
  };


  return (
    <div className="h-[calc(100vh-57px)] w-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
       <div className="flex-1 relative flex items-center justify-center overflow-hidden">
         <PdfViewer
             pdfUri={pdfDataUri}
             setTotalPages={setTotalPages}
             setApi={setCarouselApi}
             zoomLevel={zoomLevel}
         />
       </div>

       <footer className="flex items-center justify-center p-2 border-t bg-background/80 backdrop-blur-sm z-20 shadow-sm flex-shrink-0">
           <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-48">
                    <ZoomOut className="text-muted-foreground" />
                    <Slider
                        value={[zoomLevel]}
                        min={0.2}
                        max={2}
                        step={0.1}
                        onValueChange={handleZoomChange}
                        className="w-full"
                    />
                    <ZoomIn className="text-muted-foreground" />
                    <span className="text-sm font-medium w-16 text-center">{Math.round(zoomLevel * 100)}%</span>
                </div>
               <div className="flex items-center gap-2">
                   <Button variant="outline" size="icon" onClick={handlePrevPage} disabled={!carouselApi?.canScrollPrev()}>
                       <ChevronsLeft />
                       <span className="sr-only">Halaman Sebelumnya</span>
                   </Button>
                    <form onSubmit={handleGoToPage} className="flex items-center gap-1.5">
                        <Input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            onBlur={() => { if (pageInput === '') setPageInput(String(currentPage)); }} // Revert if empty
                            className="h-8 w-16 text-center"
                            aria-label="Nomor halaman"
                            disabled={totalPages === 0}
                        />
                        <span className="text-sm text-muted-foreground">/ {totalPages}</span>
                    </form>
                   <Button variant="outline" size="icon" onClick={handleNextPage} disabled={!carouselApi?.canScrollNext()}>
                       <ChevronsRight />
                       <span className="sr-only">Halaman Berikutnya</span>
                   </Button>
               </div>
           </div>
       </footer>
     </div>
   );
}
