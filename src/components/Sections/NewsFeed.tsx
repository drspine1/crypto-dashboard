import { useDashboardStore } from '@/store/dashboardStore'
import { NewsCard } from '@/components/Cards/NewsCard'
import { GridSkeleton, EmptyState, ErrorAlert } from '@/components/Common'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

export const NewsFeed = () => {
  const { filteredNews, loading, errors, resetError } = useDashboardStore()
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || loading.initial) return
    gsap.from(sectionRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      delay: 0.1,
    })
  }, [loading.initial])

  if (loading.initial) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Latest News</h2>
        <GridSkeleton count={4} />
      </div>
    )
  }

  return (
    <div ref={sectionRef} className="space-y-4 bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-xl shadow-slate-950/50">
      <h2 className="text-xl font-bold text-white">Latest News</h2>

      {errors.news && (
        <ErrorAlert error={errors.news} onDismiss={() => resetError('news')} />
      )}

      {filteredNews.length === 0 ? (
        <EmptyState title="No news available" icon="" />
      ) : (
        <div className="space-y-3">
          {filteredNews.map((item, index) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <NewsCard news={item} index={index} />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
