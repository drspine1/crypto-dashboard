export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 rounded ${className}`}
  />
)

export const CardSkeleton = () => (
  <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 space-y-4 animate-pulse">
    <Skeleton className="h-6 w-32" />
    <Skeleton className="h-8 w-24" />
    <Skeleton className="h-4 w-20" />
  </div>
)

export const GridSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
)
