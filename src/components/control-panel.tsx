
"use client";

import { Search, LoaderCircle, ZoomIn, ZoomOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";

type ControlPanelProps = {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestedTerms: string[];
  isSearching: boolean;
  onSuggestedTermClick: (term: string) => void;
  pdfLoaded: boolean;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export default function ControlPanel({
  searchTerm,
  onSearchChange,
  suggestedTerms,
  isSearching,
  onSuggestedTermClick,
  pdfLoaded,
  zoomLevel,
  onZoomIn,
  onZoomOut,
}: ControlPanelProps) {
  return (
    <div className="h-full flex flex-col pt-6 space-y-6">
      
      <div className="space-y-4 px-4">
         <Label>Kontrol Tampilan</Label>
         <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onZoomOut} disabled={!pdfLoaded || zoomLevel <= 0.4}>
                <ZoomOut/>
            </Button>
            <div className="text-center text-sm font-medium w-12">{Math.round(zoomLevel * 100)}%</div>
            <Button variant="outline" size="icon" onClick={onZoomIn} disabled={!pdfLoaded || zoomLevel >= 3}>
                <ZoomIn />
            </Button>
         </div>
      </div>

      <Separator />

      <div className="space-y-4 flex-1 flex flex-col px-4">
        <Label>Cari Dokumen</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari di dalam dokumen..."
            className="pl-10"
            value={searchTerm}
            onChange={onSearchChange}
            disabled={!pdfLoaded}
          />
        </div>
        <div className="flex-1 min-h-0">
          {isSearching ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              <span>Mendapatkan saran...</span>
            </div>
          ) : (
            suggestedTerms.length > 0 && (
              <ScrollArea className="h-full rounded-md border">
                <div className="p-4">
                  <h4 className="mb-2 text-sm font-medium leading-none">Istilah Terkait</h4>
                  {suggestedTerms.map((term) => (
                    <div
                      key={term}
                      className="text-sm p-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
                      onClick={() => onSuggestedTermClick(term)}
                    >
                      {term}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )
          )}
        </div>
      </div>
    </div>
  );
}
