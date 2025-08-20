
"use client";

import { useState, useEffect, useCallback } from 'react';
import { openDB, IDBPDatabase, DBSchema } from 'idb';

const DB_NAME = 'EbookLibraryDB';
const STORE_NAME = 'ebooks';
const DB_VERSION = 2;

export interface Ebook {
  id: number;
  name: string;
  data: File | Blob;
  thumbnailUrl?: string;
}

interface EbookDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: Ebook;
    indexes: { name: string };
  };
}

let dbPromise: Promise<IDBPDatabase<EbookDB>> | null = null;

const getDb = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!dbPromise) {
    dbPromise = openDB<EbookDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('name', 'name');
        }
      },
    });
  }
  return dbPromise;
};

const createPdfThumbnail = async (file: File | Blob): Promise<string> => {
  const { pdfjs } = await import('react-pdf');
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        if (!(data instanceof ArrayBuffer)) {
          return reject(new Error('Gagal membaca file PDF sebagai ArrayBuffer.'));
        }
        
        const pdf = await pdfjs.getDocument({ data }).promise;
        const page = await pdf.getPage(1);
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return reject(new Error('Gagal mendapatkan konteks canvas.'));

        const viewport = page.getViewport({ scale: 0.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        console.error("Gagal membuat thumbnail:", error);
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};


export function useIndexedDB() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);

  const getAllEbooks = useCallback(async () => {
    const db = await getDb();
    if (!db) return;
    const allEbooks = await db.getAll(STORE_NAME);
    setEbooks(allEbooks);
    setLoading(false);
  }, []);

  useEffect(() => {
    getAllEbooks();
  }, [getAllEbooks]);

  const addEbook = async (ebook: Omit<Ebook, 'id' | 'thumbnailUrl'>) => {
    const db = await getDb();
    if (!db) return;
    const thumbnailUrl = await createPdfThumbnail(ebook.data);
    const ebookWithThumbnail: Omit<Ebook, 'id'> = { ...ebook, thumbnailUrl };
    await db.add(STORE_NAME, ebookWithThumbnail as Ebook);
    await getAllEbooks(); // Refresh list
  };

  const deleteEbook = async (id: number) => {
    const db = await getDb();
    if (!db) return;
    await db.delete(STORE_NAME, id);
    await getAllEbooks(); // Refresh list
  };
  
  const getEbookById = useCallback(async (id: number) => {
    const db = await getDb();
    if (!db) return undefined;
    return db.get(STORE_NAME, id);
  }, []);

  return { ebooks, addEbook, deleteEbook, getEbookById, loading };
}
