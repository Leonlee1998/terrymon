import { Skeleton } from '@/components/ui/skeleton'

export default function SkeletonCard({ lines = 3, showAvatar = false }: { lines?: number; showAvatar?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-border-t p-4 space-y-3">
      {showAvatar && (
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === 0 ? 'w-3/4' : i % 2 === 0 ? 'w-full' : 'w-5/6'}`} />
      ))}
    </div>
  )
}
