"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { improveSearchTerms } from "@/ai/flows/improve-search-terms";
import { summarizePdf } from "@/ai/flows/summarize-pdf";
import ControlPanel from "@/components/control-panel";
import PdfViewer from "@/components/pdf-viewer";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestedTerms, setSuggestedTerms] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);

  const totalPages = 10; // Mock total pages

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

  const handleSummarize = useCallback(async () => {
    if (!pdfDataUri) {
      toast({
        variant: "destructive",
        title: "No PDF Selected",
        description: "Please upload a PDF file to summarize.",
      });
      return;
    }
    setIsSummarizing(true);
    setSummary("");
    try {
      const result = await summarizePdf({ pdfDataUri });
      setSummary(result.summary);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Summarization Error",
        description: "Failed to summarize the document. Please try again.",
      });
      setSummary("Could not generate a summary.");
    } finally {
      setIsSummarizing(false);
    }
  }, [pdfDataUri, toast]);
  
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
        setSummary(""); // Clear previous summary
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
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
              onSummarize={handleSummarize}
              summary={summary}
              isSummarizing={isSummarizing}
              onFileChange={handleFileChange}
              pdfFileName={pdfFileName}
              isPdfUploaded={!!pdfDataUri}
            />
          </div>

          <div className="md:col-span-8 lg:col-span-9">
            <PdfViewer
              currentPage={currentPage}
              totalPages={totalPages}
              zoomLevel={zoomLevel}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
