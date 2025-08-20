"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useDebounce } from "@/hooks/use-debounce";
import { improveSearchTerms } from "@/ai/flows/improve-search-terms";
import ControlPanel from "@/components/control-panel";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";

const PdfViewer = dynamic(() => import("@/components/pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <Skeleton className="w-full h-full" />
    </div>
  ),
});

export default function Home() {
  const { toast } = useToast();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestedTerms, setSuggestedTerms] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsSearching(true);
      setSuggestedTerms([]);
      improveSearchTerms({ searchTerm: debouncedSearchTerm })
        .then((result) => {
          setSuggestedTerms(result.relatedTerms);
        })
        .catch(() => {
          toast({
            variant: "destructive",
            title: "Search Error",
            description: "Could not fetch suggested search terms.",
          });
        })
        .finally(() => {
          setIsSearching(false);
        });
    } else {
      setSuggestedTerms([]);
    }
  }, [debouncedSearchTerm, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a valid PDF file.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setPdfDataUri(dataUri);
        setPdfFileName(file.name);
        setTotalPages(0); // Reset pages when new file is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

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
    <div className="min-h-screen w-full bg-background relative">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="absolute top-4 left-4 z-20">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Buka Panel Kontrol</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
           <ControlPanel
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              suggestedTerms={suggestedTerms}
              isSearching={isSearching}
              onSuggestedTermClick={handleSuggestedTermClick}
              onFileChange={handleFileChange}
              pdfFileName={pdfFileName}
              isPdfUploaded={!!pdfDataUri}
            />
        </SheetContent>
      </Sheet>

      <PdfViewer
        pdfUri={pdfDataUri}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        totalPages={totalPages}
        setTotalPages={setTotalPages}
      />
    </div>
  );
}
