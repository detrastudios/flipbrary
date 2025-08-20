"use client";

import { Search, LoaderCircle, Upload, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

type ControlPanelProps = {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestedTerms: string[];
  isSearching: boolean;
  onSuggestedTermClick: (term: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pdfFileName: string | null;
  isPdfUploaded: boolean;
};

export default function ControlPanel({
  searchTerm,
  onSearchChange,
  suggestedTerms,
  isSearching,
  onSuggestedTermClick,
  onFileChange,
  pdfFileName,
  isPdfUploaded,
}: ControlPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kontrol</CardTitle>
        <CardDescription>Unggah PDF dan cari di dalam dokumen.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="pdf-upload">Unggah PDF</Label>
          <div className="relative">
            <Input id="pdf-upload" type="file" className="w-full pr-12" onChange={onFileChange} accept=".pdf" />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {isPdfUploaded ? (
                 <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                 <Upload className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
          {pdfFileName && <p className="text-xs text-muted-foreground mt-1 truncate">File: {pdfFileName}</p>}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari dokumen..."
            className="pl-10"
            value={searchTerm}
            onChange={onSearchChange}
            disabled={!isPdfUploaded}
          />
        </div>
        <div className="h-40">
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
      </CardContent>
    </Card>
  );
}
