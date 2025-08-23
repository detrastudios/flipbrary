"use client";

import { useState } from 'react';
import { summarizePdf } from '@/ai/flows/summarize-pdf';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Search, Sparkles } from "lucide-react";
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";


type ControlPanelProps = {
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    suggestedTerms: string[];
    isSearching: boolean;
    onSuggestedTermClick: (term: string) => void;
    pdfLoaded: boolean;
    pdfDataUri: string | null;
};

export default function ControlPanel({
    searchTerm,
    onSearchChange,
    suggestedTerms,
    isSearching,
    onSuggestedTermClick,
    pdfLoaded,
    pdfDataUri,
}: ControlPanelProps) {
    const { toast } = useToast();
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summary, setSummary] = useState('');

    const handleSummarize = async () => {
        if (!pdfDataUri) {
            toast({
                variant: "destructive",
                title: "PDF belum dimuat",
                description: "Harap tunggu hingga PDF selesai dimuat sebelum meringkas.",
            });
            return;
        }

        setIsSummarizing(true);
        setSummary('');
        try {
            const result = await summarizePdf({ pdfDataUri });
            setSummary(result.summary);
            toast({
                title: "Ringkasan Selesai",
                description: "Ringkasan PDF telah berhasil dibuat.",
            });
        } catch (error) {
            console.error("Gagal meringkas PDF:", error);
            toast({
                variant: "destructive",
                title: "Gagal Meringkas",
                description: "Terjadi kesalahan saat membuat ringkasan PDF.",
            });
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <ScrollArea className="h-full w-full py-4 pr-4">
            <div className="space-y-6">
                <Accordion type="single" collapsible defaultValue="item-1">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            <h3 className="text-base font-medium flex items-center gap-2">
                                <Search className="h-4 w-4" /> Cari Dokumen
                            </h3>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <div className="relative">
                                <Input
                                    type="search"
                                    placeholder="Cari dalam PDF..."
                                    value={searchTerm}
                                    onChange={onSearchChange}
                                    disabled={!pdfLoaded}
                                    className="pl-8"
                                />
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                            {isSearching && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <LoaderCircle className="animate-spin h-4 w-4" />
                                    <span>Mencari saran...</span>
                                </div>
                            )}
                            {suggestedTerms.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Saran Pencarian AI:</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestedTerms.map((term, i) => (
                                            <Badge
                                                key={i}
                                                variant="secondary"
                                                onClick={() => onSuggestedTermClick(term)}
                                                className="cursor-pointer hover:bg-primary/20"
                                            >
                                                {term}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>
                            <h3 className="text-base font-medium flex items-center gap-2">
                                <Sparkles className="h-4 w-4" /> Ringkas Dengan AI
                            </h3>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <Button onClick={handleSummarize} disabled={!pdfLoaded || isSummarizing} className="w-full">
                                {isSummarizing && <LoaderCircle className="animate-spin mr-2" />}
                                {isSummarizing ? "Meringkas..." : "Buat Ringkasan"}
                            </Button>
                            {summary && (
                                <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
                                    <h4 className="font-semibold">Hasil Ringkasan:</h4>
                                    <p className="whitespace-pre-wrap">{summary}</p>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </ScrollArea>
    );
}