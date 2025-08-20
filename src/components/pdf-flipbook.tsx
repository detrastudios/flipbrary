
"use client";

import React, { useState, useCallback, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useToast } from "@/hooks/use-toast";
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { Skeleton } from './ui/skeleton';
import { FileQuestion } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfFlipbookProps {
    pdfUri: string | null;
    setTotalPages: (pages: number) => void;
    onPage: (e: any) => void;
}

const PageCover = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => {
  return (
    <div ref={ref} className="bg-background border shadow-md flex justify-center items-center">
      <div className="p-4">{children}</div>
    </div>
  );
});
PageCover.displayName = "PageCover";


const PageComponent = forwardRef<HTMLDivElement, { children: React.ReactNode; number: number }>((props, ref) => {
  return (
    <div ref={ref} className="bg-background border shadow-sm">
      <div className="p-2 flex justify-end text-xs text-muted-foreground">{props.number + 1}</div>
      {props.children}
    </div>
  );
});
PageComponent.displayName = "PageComponent";


const PdfFlipbook = forwardRef<HTMLDivElement, PdfFlipbookProps>(({ pdfUri, setTotalPages, onPage }, ref) => {
    const { toast } = useToast();
    const [numPages, setNumPages] = useState<number>(0);
    const [pageDimensions, setPageDimensions] = useState({ width: 595, height: 842 }); // Default A4 size

    const onDocumentLoadSuccess = useCallback(({ numPages: nextNumPages }: PDFDocumentProxy) => {
        setNumPages(nextNumPages);
        setTotalPages(nextNumPages);
    }, [setTotalPages]);

    const onDocumentLoadError = useCallback((error: Error) => {
        if (error.name === 'AbortException') return;
        toast({
            variant: "destructive",
            title: "Gagal memuat PDF",
            description: error.message,
        });
    }, [toast]);
    
    const onPageLoadSuccess = useCallback((page: any) => {
       setPageDimensions({ width: page.width, height: page.height });
    }, []);

    if (!pdfUri) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground h-full w-full max-w-4xl">
              <FileQuestion className="h-16 w-16" />
              <p className="text-lg text-center px-4">Memuat Ebook...</p>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <Document
                file={pdfUri}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<Skeleton className="w-[595px] h-[842px] rounded-lg" />}
            >
             <HTMLFlipBook
                width={pageDimensions.width / 2}
                height={pageDimensions.height / 2}
                size="stretch"
                minWidth={315}
                maxWidth={1000}
                minHeight={400}
                maxHeight={1500}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                onFlip={onPage}
                className="shadow-2xl"
                ref={ref as any}
             >
                <PageCover>
                    <h2 className="text-2xl font-bold">Sampul Depan</h2>
                </PageCover>

                {Array.from(new Array(numPages), (el, index) => (
                    <PageComponent key={`page_${index + 1}`} number={index + 1}>
                         <Page
                            pageNumber={index + 1}
                            renderTextLayer={true}
                            renderAnnotationLayer={false}
                            width={pageDimensions.width / 2}
                            onLoadSuccess={index === 0 ? onPageLoadSuccess : undefined}
                         />
                    </PageComponent>
                ))}

                <PageCover>
                     <h2 className="text-2xl font-bold">Sampul Belakang</h2>
                </PageCover>
            </HTMLFlipBook>
           </Document>
        </div>
    );
});
PdfFlipbook.displayName = "PdfFlipbook";

export default PdfFlipbook;
