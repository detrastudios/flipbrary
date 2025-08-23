
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, BookOpen, Trash2, FileText, LoaderCircle, Settings } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useIndexedDB, Ebook } from "@/hooks/use-indexed-db";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import SettingsPanel from "@/components/settings-panel";


export default function LibraryPage() {
  const { toast } = useToast();
  const { ebooks, addEbook, deleteEbook, loading } = useIndexedDB();
  
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newEbookName, setNewEbookName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setFileError("Silakan unggah file PDF yang valid.");
        setSelectedFile(null);
      } else {
        setFileError(null);
        setSelectedFile(file);
        if (!newEbookName) {
            setNewEbookName(file.name.replace(/\.pdf$/i, ''));
        }
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
        setFileError("Silakan pilih file PDF untuk diunggah.");
        return;
    }
    if (!newEbookName.trim()) {
        toast({
            variant: "destructive",
            title: "Nama Ebook Diperlukan",
            description: "Silakan masukkan nama untuk ebook Anda.",
        });
        return;
    }

    setIsUploading(true);

    try {
        const newEbook: Omit<Ebook, 'id' | 'thumbnailUrl'> = {
            name: newEbookName.trim(),
            data: selectedFile,
        };
        await addEbook(newEbook);
        toast({
            title: "Unggah Berhasil",
            description: `"${newEbook.name}" telah ditambahkan ke library Anda.`,
        });
        resetUploadForm();
    } catch (error) {
        console.error("Gagal menyimpan ebook atau membuat thumbnail", error);
        toast({
            variant: "destructive",
            title: "Gagal Menyimpan Ebook",
            description: "Terjadi kesalahan saat memproses atau menyimpan ebook Anda.",
        });
    } finally {
        setIsUploading(false);
    }
  };
  
  const resetUploadForm = () => {
    setIsUploadDialogOpen(false);
    setNewEbookName("");
    setSelectedFile(null);
    setFileError(null);
  };

  const handleDelete = async (idToDelete: number) => {
    try {
      await deleteEbook(idToDelete);
      toast({
        title: "Ebook Dihapus",
        description: "Ebook telah dihapus dari library Anda.",
      });
    } catch (error) {
      console.error("Gagal menghapus ebook dari IndexedDB", error);
      toast({
        variant: "destructive",
        title: "Gagal Menghapus Ebook",
        description: "Tidak dapat menghapus ebook dari library Anda.",
      });
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Memuat library Anda...</p>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
       <header className="p-4 border-b flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div>
          <h1 className="text-2xl font-bold">Flipbrary</h1>
          <p className="text-sm text-muted-foreground">by Sahijra</p>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={() => setIsUploadDialogOpen(true)} className="rounded-full">
              <Upload className="mr-2" />
              Unggah PDF Baru
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Buka Pengaturan</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Pengaturan</SheetTitle>
                  <SheetDescription>
                    Atur preferensi tampilan aplikasi Anda di sini.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <SettingsPanel />
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </header>

      <Dialog open={isUploadDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetUploadForm(); else setIsUploadDialogOpen(true); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unggah Ebook Baru</DialogTitle>
            <DialogDescription>
              Pilih file PDF dan berikan nama untuk menambahkannya ke library Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="ebook-name">
                Nama Ebook
              </Label>
              <Input
                id="ebook-name"
                value={newEbookName}
                onChange={(e) => setNewEbookName(e.target.value)}
                placeholder="Contoh: Novel Sejarah"
                disabled={isUploading}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="pdf-upload">
                File PDF
              </Label>
               <Input id="pdf-upload" type="file" onChange={handleFileChange} accept=".pdf" disabled={isUploading}/>
            </div>
             {fileError && <p className="text-sm text-red-500">{fileError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetUploadForm} disabled={isUploading}>Batal</Button>
            <Button onClick={handleUploadSubmit} disabled={!selectedFile || !newEbookName || isUploading}>
                {isUploading && <LoaderCircle className="mr-2 animate-spin" />}
                {isUploading ? "Mengunggah..." : "Simpan & Unggah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <main className="p-4 md:p-8">
        {ebooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {ebooks.map((ebook) => (
              <div key={ebook.id} className="group relative transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-lg">
                <Link href={`/viewer/${ebook.id}`} className="block text-center">
                  <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center p-1 shadow-md transition-all duration-300 group-hover:shadow-xl overflow-hidden">
                    {ebook.thumbnailUrl ? (
                      <Image 
                        src={ebook.thumbnailUrl} 
                        alt={`Cover of ${ebook.name}`} 
                        width={200}
                        height={300}
                        className="object-cover w-full h-full rounded-md"
                      />
                    ) : (
                      <BookOpen className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium truncate px-1" title={ebook.name}>
                    {ebook.name}
                  </p>
                </Link>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-3 -right-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(ebook.id)}
                  aria-label="Hapus Ebook"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-semibold">Library Anda kosong</h2>
            <p className="text-muted-foreground mt-2">Unggah ebook PDF pertama Anda untuk memulai.</p>
             <Button className="mt-4" onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="mr-2" />
                Unggah PDF
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
