"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, BookOpen, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useIndexedDB, Ebook } from "@/hooks/use-indexed-db";

export default function LibraryPage() {
  const { toast } = useToast();
  const { ebooks, addEbook, deleteEbook, loading } = useIndexedDB();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Jenis File Tidak Valid",
          description: "Silakan unggah file PDF yang valid.",
        });
        return;
      }

      try {
        const newEbook: Omit<Ebook, 'id'> = {
          name: file.name,
          data: file,
        };
        await addEbook(newEbook);
        toast({
          title: "Unggah Berhasil",
          description: `"${file.name}" telah ditambahkan ke library Anda.`,
        });
      } catch (error) {
        console.error("Gagal menyimpan ebook ke IndexedDB", error);
        toast({
          variant: "destructive",
          title: "Gagal Menyimpan Ebook",
          description: "Tidak dapat menyimpan ebook ke browser Anda karena kesalahan.",
        });
      }
    }
    // Reset file input
    event.target.value = "";
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
        <h1 className="text-2xl font-bold">PDFreeze Library</h1>
        <Button asChild>
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <Upload className="mr-2" />
            Unggah PDF Baru
            <input
              id="pdf-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf"
            />
          </label>
        </Button>
      </header>
      <main className="p-4 md:p-8">
        {ebooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {ebooks.map((ebook) => (
              <div key={ebook.id} className="group relative transition-all duration-300 hover:scale-105">
                <Link href={`/viewer/${ebook.id}`} className="block text-center">
                  <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center p-4 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:border-primary border-2 border-transparent">
                    <BookOpen className="w-12 h-12 text-muted-foreground" />
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
             <Button asChild className="mt-4">
              <label htmlFor="pdf-upload-empty" className="cursor-pointer">
                <Upload className="mr-2" />
                Unggah PDF
                <input
                  id="pdf-upload-empty"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf"
                />
              </label>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
