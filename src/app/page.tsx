"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, BookOpen } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

type Ebook = {
  id: string;
  name: string;
  dataUri: string;
};

export default function LibraryPage() {
  const { toast } = useToast();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);

  useEffect(() => {
    try {
      const storedEbooks = localStorage.getItem("ebook-library");
      if (storedEbooks) {
        setEbooks(JSON.parse(storedEbooks));
      }
    } catch (error) {
      console.error("Gagal memuat ebook dari localStorage", error);
      toast({
        variant: "destructive",
        title: "Gagal Memuat Library",
        description: "Tidak dapat memuat data ebook dari browser Anda.",
      });
    }
  }, [toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        const newEbook: Ebook = {
          id: `${Date.now()}-${file.name.replace(/\s/g, "-")}`,
          name: file.name,
          dataUri,
        };
        
        setEbooks((prevEbooks) => {
          const updatedEbooks = [...prevEbooks, newEbook];
          try {
            localStorage.setItem("ebook-library", JSON.stringify(updatedEbooks));
            toast({
              title: "Unggah Berhasil",
              description: `"${file.name}" telah ditambahkan ke library Anda.`,
            });
          } catch (error) {
            console.error("Gagal menyimpan ebook ke localStorage", error);
            toast({
              variant: "destructive",
              title: "Gagal Menyimpan Ebook",
              description: "Tidak dapat menyimpan ebook ke browser Anda.",
            });
          }
          return updatedEbooks;
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    event.target.value = "";
  };

  const handleDelete = (idToDelete: string) => {
    setEbooks((prevEbooks) => {
      const updatedEbooks = prevEbooks.filter(ebook => ebook.id !== idToDelete);
      localStorage.setItem('ebook-library', JSON.stringify(updatedEbooks));
      toast({
        title: "Ebook Dihapus",
        description: "Ebook telah dihapus dari library Anda.",
      });
      return updatedEbooks;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Library Ebook Saya</h1>
        <Button asChild>
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <Upload className="mr-2" />
            Unggah Ebook Baru
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {ebooks.map((ebook) => (
              <div key={ebook.id} className="group relative">
                <Link href={`/viewer/${ebook.id}`} className="block">
                  <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center p-4 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                    <BookOpen className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-sm font-medium truncate" title={ebook.name}>
                    {ebook.name}
                  </p>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(ebook.id)}
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold">Library Anda kosong</h2>
            <p className="text-muted-foreground mt-2">Unggah ebook PDF pertama Anda untuk memulai.</p>
          </div>
        )}
      </main>
    </div>
  );
}
