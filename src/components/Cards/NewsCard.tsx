'use client'

import { News } from '@/types'
import { formatDate, formatTime } from '@/utils/formatters'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface NewsCardProps {
  news: News
  index?: number
}

export const NewsCard = ({ news, index = 0 }: NewsCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)

  // Staggered entrance — fromTo guarantees opacity ends at 1 even if interrupted
  useEffect(() => {
    if (!cardRef.current) return
    const tween = gsap.fromTo(
      cardRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5, delay: index * 0.08, ease: 'power2.out' }
    )
    return () => { tween.kill() }
  }, [index])

  return (
    <div
      ref={cardRef}
      className="bg-slate-800 shadow-xl shadow-slate-950/30 rounded-3xl border border-slate-700 p-5 hover:border-sky-400 hover:shadow-sky-500/20 transition-all duration-300 cursor-pointer"
    >
      {news.image && (
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-40 object-cover rounded-3xl mb-4"
        />
      )}

      <h3 className="font-bold text-white text-base mb-2 leading-snug">
        {news.title}
      </h3>

      {news.description && (
        <p className="text-sm text-slate-300 mb-4 leading-relaxed line-clamp-2">
          {news.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-700">
        <span className="text-xs font-semibold text-sky-300">{news.source}</span>
        <span className="text-xs text-slate-400">{formatDate(news.publishedAt)}, {formatTime(news.publishedAt)}</span>
      </div>
    </div>
  )
}
