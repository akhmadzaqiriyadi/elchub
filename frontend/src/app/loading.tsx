import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fbf7f2_0%,_#f6efe6_100%)] p-6 sm:p-10">
      <section className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-5 w-2/3" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      </section>
    </main>
  );
}