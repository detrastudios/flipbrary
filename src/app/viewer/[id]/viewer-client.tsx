
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight, ZoomIn, ZoomOut, Search as MagnifyIcon, Bookmark } from "lucide-react";
import { useIndexedDB, Ebook } from "@/hooks/use-indexed-db";
import type { CarouselApi } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

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
  const { getEbookById, updateEbook } = useIndexedDB();
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | undefined>();
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isMagnifierEnabled, setIsMagnifierEnabled] = useState(false);
  const [initialZoomCalculated, setInitialZoomCalculated] = useState(false);

  useEffect(() => {
    if (id) {
        const parsedId = parseInt(id, 10);
        if (!isNaN(parsedId)) {
            getEbookById(parsedId).then(ebookData => {
                if (ebookData) {
                    setEbook(ebookData);
                    if (ebookData.data instanceof Blob) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            setPdfDataUri(e.target?.result as string);
                        };
                        reader.readAsDataURL(ebookData.data);
                    }
                } else {
                    toast({
                        variant: "destructive",
                        title: "Ebook tidak ditemukan",
                        description: "Tidak dapat menemukan ebook di library Anda.",
                    });
                }
            });
        }
    }
  }, [id, getEbookById, toast]);

  useEffect(() => {
    if (!carouselApi || !ebook) return;

    const onSelect = () => {
      const newPage = carouselApi.selectedScrollSnap() + 1;
      setCurrentPage(newPage);
      setPageInput(String(newPage));
    };

    if (ebook.bookmarkedPage && totalPages > 0) {
        carouselApi.scrollTo(ebook.bookmarkedPage - 1, true);
    }
    
    carouselApi.on("select", onSelect);
    onSelect(); 

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi, ebook, totalPages]);
  
  const handleDimensionsReady = useCallback((pageDimensions: { width: number; height: number }) => {
    if (initialZoomCalculated || !viewerContainerRef.current) return;
    
    const container = viewerContainerRef.current;
    const padding = 32; // Corresponds to p-4, 1rem = 16px. 2 * 16 = 32
    const containerWidth = container.clientWidth - padding;
    const containerHeight = container.clientHeight - padding;
    
    const widthScale = containerWidth / pageDimensions.width;
    const heightScale = containerHeight / pageDimensions.height;
    
    const newZoom = Math.min(widthScale, heightScale);
    
    setZoomLevel(newZoom);
    setInitialZoomCalculated(true);
  }, [initialZoomCalculated]);


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
      
      setPageInput(String(currentPage));
    }
  };

  const handleZoomChange = (value: number[]) => {
    setZoomLevel(value[0]);
  };
  
  const handleToggleBookmark = async () => {
    if (!ebook || !updateEbook) return;

    const newBookmarkedPage = ebook.bookmarkedPage === currentPage ? undefined : currentPage;
    
    const updatedEbook = await updateEbook(ebook.id, { bookmarkedPage: newBookmarkedPage });
    
    if (updatedEbook) {
      setEbook(updatedEbook);
      toast({
        title: newBookmarkedPage ? "Halaman ditandai" : "Tanda dihapus",
        description: newBookmarkedPage 
          ? `Halaman ${currentPage} telah ditandai.`
          : `Tanda pada halaman ${currentPage} telah dihapus.`,
      });
    }
  };


  return (
    <div className="h-[calc(100vh-57px)] w-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
       <div ref={viewerContainerRef} className="flex-1 relative flex items-center justify-center overflow-hidden">
         <PdfViewer
             pdfUri={pdfDataUri}
             setTotalPages={setTotalPages}
             setApi={setCarouselApi}
             zoomLevel={zoomLevel}
             isMagnifierEnabled={isMagnifierEnabled}
             onDimensionsReady={handleDimensionsReady}
         />
       </div>

       <footer className="flex items-center justify-between p-2 border-t bg-background/80 backdrop-blur-sm z-20 shadow-sm flex-shrink-0">
           <div className="flex items-center gap-4 w-1/3">
                {/* Placeholder */}
           </div>
           <div className="flex items-center justify-center gap-4 w-1/3">
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
                   <Button
                      variant="outline"
                      size="icon"
                      onClick={handleToggleBookmark}
                      disabled={!ebook}
                      className={cn(ebook?.bookmarkedPage === currentPage && "bg-accent text-accent-foreground")}
                    >
                      <Bookmark className={cn(ebook?.bookmarkedPage === currentPage && "fill-current")} />
                      <span className="sr-only">Tandai Halaman</span>
                   </Button>
               </div>
           </div>
            <div className="flex items-center gap-2 w-1/3 justify-end pr-2">
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
                </div>
                <span className="text-sm font-medium w-16 text-center">{Math.round(zoomLevel * 100)}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsMagnifierEnabled(prev => !prev)}
                  className={cn(isMagnifierEnabled && "bg-accent text-accent-foreground")}
                >
                  <MagnifyIcon />
                  <span className="sr-only">Aktifkan Kaca Pembesar</span>
                </Button>
           </div>
       </footer>
     </div>
   );
}
