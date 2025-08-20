"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { improveSearchTerms } from "@/ai/flows/improve-search-terms";
import { summarizePdf } from "@/ai/flows/summarize-pdf";
import ControlPanel from "@/components/control-panel";
import PdfViewer from "@/components/pdf-viewer";
import { useToast } from "@/hooks/use-toast";

// A dummy Base64 encoded PDF for demonstration purposes.
const DUMMY_PDF_DATA_URI = 'data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFIvTGFuZyhlbi1VUykgL1N0cnVjdFRyZWVSb290IDEwIDAgUi9NYXJrSW5mbzw8L01hcmtlZCB0cnVlPj4+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1sgMyAwIFJdID4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvUmVzb3VyY2VzPDwvRm9udDw8L0YxIDUgMCBSPj4vUHJvY1NldFsvUERGL1RleHQvSW1hZ2VCL0ltYWdlQy9JbWFnZUldID4+L01lZGlhQm94WzAgMCA2MTIgNzkyXS9Db250ZW50cyA0IDAgUi9Hcm91cDw8L1R5cGUvR3JvdXAvUy9UcmFuc3BhcmVuY3kvQ1MvRGV2aWNlUkdCPj4vVGFicy9TL1N0cnVjdFBhcmVudHMgMD4+CmVuZG9iago0IDAgb2JqCjw8L0ZpbHRlci9GbGF0ZURlY29kZS9MZW5ndGggNjg+PgpzdHJlYW0KeJwr5HIK4TIyUkhUNDYxNFFwSElNTjRUcE9WMlJTRgsoylZIK1EoSk3MUVIqys/iChZUCElMydLMTUxNLAIKFWECSSkKS2BgBgAATQgWZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGb250L0hlbHZldGljYS9FbmNvZGluZy9XaW5BbnNpRW5jb2Rpbmc+PgplbmRvYmoKNiAwIG9iago8PC9MZW5ndGggMTg0L04gMy9BbHQgMTQwL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nE2Qz0rCMBDG3/sVey69wYsbp55EQRBBRJdQv6DP+Q/SVJDEu6R//51NExVBEHwzOzM7wYJm73o0DqwbwYo2r4P+y8F827QXD6aKdl4YxQ4j+w9pDhbha4f50lRKYwZ71kHOFUI5w6f41UuJpODGZmZl2YBDp7lxz0N+Dxv5F7eGPnE0jJBEs4WwbFqU5hQj21kRpZW2bklGv53d9u23wP19N5Cjx7Psm++1p42GKycbx/KSr1858ZmuoLfXvE/w8q3CIMYHA6r/A3sO0VBlZWZ6C+gS+4gZRODmmGkMhUSjJbAT3kP/y3wEr2hxdVl3kCjy6EskL7rAE3WvQARZWJlbW5zdHJlYW0KZW5kb2JqCnhyZWYKMCAwCnRyYWlsZXIKPDwvU2l6ZSA3L1Jvb3QgMSAwIFIvSW5mbyA2IDAgUj4+CnN0YXJ0eHJlZgo2NDcKJSVFT0YK';

export default function Home() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestedTerms, setSuggestedTerms] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

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
    setIsSummarizing(true);
    setSummary("");
    try {
      const result = await summarizePdf({ pdfDataUri: DUMMY_PDF_DATA_URI });
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
  }, [toast]);

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
