
"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BookMarked, Settings, Upload, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import SettingsPanel from "@/components/settings-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIndexedDB, Ebook } from '@/hooks/use-indexed-db';
import { Skeleton } from './ui/skeleton';

export default function Header() {
  const pathname = usePathname();
  const { getEbookById } = useIndexedDB();
  
  const [ebook, setEbook] = useState<Ebook | null | undefined>(undefined);
  const [isViewerPage, setIsViewerPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const viewerRegex = /^\/viewer\/(\d+)/;
    const match = pathname.match(viewerRegex);
    
    setIsViewerPage(!!match);

    if (match) {
      const ebookId = parseInt(match[1], 10);
      if (!isNaN(ebookId)) {
        setIsLoading(true);
        getEbookById(ebookId).then(data => {
          setEbook(data);
          setIsLoading(false);
        });
      }
    } else {
        setIsLoading(false);
    }
  }, [pathname, getEbookById]);


  const renderSettings = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Buka Pengaturan</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Pengaturan</SheetTitle>
          <SheetDescription>
            Atur preferensi tampilan aplikasi Anda di sini.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="py-4 flex-1 -mx-6 px-6">
          <SettingsPanel />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="p-4 border-b flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-10 h-[57px]">
      {isViewerPage ? (
        <>
          <div className="flex items-center gap-2 w-full overflow-hidden">
            <Button variant="outline" size="icon" asChild>
              <Link href="/">
                <ArrowLeft />
                <span className="sr-only">Kembali ke Library</span>
              </Link>
            </Button>
            {isLoading ? (
                <Skeleton className="h-6 w-48 rounded-md" />
            ) : (
                <h1 className="text-lg font-semibold truncate" title={ebook?.name}>
                    {ebook?.name || "Flipbrary viewer"}
                </h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            {renderSettings()}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <BookMarked className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Flipbrary</h1>
              <p className="text-sm text-muted-foreground">by Sahijra</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/?upload=true">
                <Upload className="mr-2" />
                PDF
              </Link>
            </Button>
            {renderSettings()}
          </div>
        </>
      )}
    </header>
  );
}
