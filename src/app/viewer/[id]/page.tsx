// app/viewer/[id]/page.tsx (ini adalah Server Component)
import ViewerPageClient from "./viewer-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import React from 'react';

export default function ViewerPage({ params }: { params: { id: string } }) {
  // Akses params.id secara langsung di Server Component
  const { id } = params;

  return (
    <Suspense fallback={<Skeleton className="w-full h-screen" />}>
      <ViewerPageClient id={id} />
    </Suspense>
  );
}
