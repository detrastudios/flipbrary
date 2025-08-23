// app/viewer/[id]/page.tsx (ini adalah Server Component)
import ViewerPageClient from "./viewer-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import React from 'react';

export default function ViewerPage({ params }: { params: { id: string } }) {
  // Perbaikan: Menggunakan React.use() untuk mengekstrak nilai dari params dengan aman.
  const { id } = React.use(params);

  return (
    <Suspense fallback={<Skeleton className="w-full h-screen" />}>
      <ViewerPageClient id={id} />
    </Suspense>
  );
}
