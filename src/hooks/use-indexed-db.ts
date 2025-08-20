"use client";

import { useState, useEffect, useCallback } from 'react';
import { openDB, IDBPDatabase, DBSchema } from 'idb';

const DB_NAME = 'EbookLibraryDB';
const STORE_NAME = 'ebooks';
const DB_VERSION = 1;

export interface Ebook {
  id: number;
  name: string;
  data: File | Blob;
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
  if (!dbPromise) {
    dbPromise = openDB<EbookDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
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


export function useIndexedDB() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);

  const getAllEbooks = useCallback(async () => {
    const db = await getDb();
    const allEbooks = await db.getAll(STORE_NAME);
    setEbooks(allEbooks);
    setLoading(false);
  }, []);

  useEffect(() => {
    getAllEbooks();
  }, [getAllEbooks]);

  const addEbook = async (ebook: Omit<Ebook, 'id'>) => {
    const db = await getDb();
    await db.add(STORE_NAME, ebook as Ebook);
    await getAllEbooks(); // Refresh list
  };

  const deleteEbook = async (id: number) => {
    const db = await getDb();
    await db.delete(STORE_NAME, id);
    await getAllEbooks(); // Refresh list
  };
  
  const getEbookById = useCallback(async (id: number) => {
    const db = await getDb();
    return db.get(STORE_NAME, id);
  }, []);

  return { ebooks, addEbook, deleteEbook, getEbookById, loading };
}
