'use client'

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
    const tween = gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.1, ease: 'power2.out' }
    )
    return () => { tween.kill() }
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
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-800 border border-slate-700 px-4 py-3">
          <p className="text-sm text-slate-300">News couldn't be loaded right now. Please check back shortly.</p>
          <button
            onClick={() => resetError('news')}
            className="text-xs text-slate-400 hover:text-white transition-colors shrink-0"
          >
            Dismiss
          </button>
        </div>
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
