"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useDebounce } from "@/hooks/use-debounce";
import { improveSearchTerms } from "@/ai/flows/improve-search-terms";
import ControlPanel from "@/components/control-panel";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const PdfViewer = dynamic(() => import("@/components/pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[70vh] flex items-center justify-center">
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
        setTotalPages(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSuggestedTermClick = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <h1 className="text-2xl font-bold text-primary">PDFreeze</h1>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto grid grid-cols-1 items-start gap-8 p-4 pt-8 md:grid-cols-12">
          <div className="md:col-span-4 lg:col-span-3">
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
          </div>

          <div className="md:col-span-8 lg:col-span-9">
            <PdfViewer
              pdfUri={pdfDataUri}
              zoomLevel={zoomLevel}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              totalPages={totalPages}
              setTotalPages={setTotalPages}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
