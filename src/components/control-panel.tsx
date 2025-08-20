"use client";

import { Search, LoaderCircle, Upload, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type ControlPanelProps = {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestedTerms: string[];
  isSearching: boolean;
  onSuggestedTermClick: (term: string) => void;
};

export default function ControlPanel({
  searchTerm,
  onSearchChange,
  suggestedTerms,
  isSearching,
  onSuggestedTermClick,
}: ControlPanelProps) {
  return (
    <div className="h-full flex flex-col pt-6 space-y-6">
      <div className="space-y-4">
        <Label>Cari Dokumen</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari di dalam dokumen..."
            className="pl-10"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
        <div className="h-64">
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
