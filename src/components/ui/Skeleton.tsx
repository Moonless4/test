import { cn } from '@/lib/utils';

export function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn('skeleton h-3.5 w-full', className)} />;
}

export function SkeletonBox({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

/** اسکلت بارگذاری کارت پرواز */
export function FlightCardSkeleton() {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <SkeletonBox className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="w-32" />
          <SkeletonLine className="w-20" />
        </div>
        <SkeletonBox className="h-8 w-24 rounded-md" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <SkeletonLine className="h-6 w-16" />
        <SkeletonLine className="h-px flex-1" />
        <SkeletonLine className="h-6 w-16" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <SkeletonLine className="w-28" />
        <SkeletonBox className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

/** اسکلت بارگذاری کارت هتل */
export function HotelCardSkeleton() {
  return (
    <div className="card overflow-hidden sm:flex">
      <SkeletonBox className="h-44 w-full rounded-none sm:h-auto sm:w-64" />
      <div className="flex-1 space-y-3 p-4">
        <SkeletonLine className="w-40" />
        <SkeletonLine className="w-24" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-3/4" />
        <div className="flex items-center justify-between pt-2">
          <SkeletonLine className="w-24" />
          <SkeletonBox className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <FlightCardSkeleton key={index} />
      ))}
    </div>
  );
}
