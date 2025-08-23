
import { Suspense } from 'react';
import LibraryClient from '@/components/library-client';
import { Skeleton } from '@/components/ui/skeleton';

export default function LibraryPage() {
  return (
    <Suspense fallback={<LibrarySkeleton />}>
      <LibraryClient />
    </Suspense>
  );
}

function LibrarySkeleton() {
    return (
        <div className="p-4 md:p-8">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    )
}
