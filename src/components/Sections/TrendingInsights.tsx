'use client'

import { useDashboardStore } from '@/store/dashboardStore'
import { formatPrice, formatPercent, formatMarketCap } from '@/utils/formatters'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

export const TrendingInsights = () => {
  const { filteredCryptos, filteredNews } = useDashboardStore()
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const tween = gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power2.out' }
    )
    return () => { tween.kill() }
  }, [])

  const topGainer = filteredCryptos.reduce<typeof filteredCryptos[0] | null>((max, crypto) =>
    !max || crypto.change24h > max.change24h ? crypto : max, null
  )

  const topLoser = filteredCryptos.reduce<typeof filteredCryptos[0] | null>((min, crypto) =>
    !min || crypto.change24h < min.change24h ? crypto : min, null
  )

  const totalMarketCap = filteredCryptos.reduce((sum, crypto) => sum + crypto.marketCap, 0)

  const recentNewsCount = filteredNews.filter(
    (news) => new Date().getTime() - news.publishedAt.getTime() < 24 * 60 * 60 * 1000
  ).length

  const insights = [
    {
      title: 'Top Gainer (24h)',
      value: topGainer ? `${topGainer.name} ${formatPercent(topGainer.change24h)}` : 'N/A',
      icon: '📈',
    },
    {
      title: 'Top Loser (24h)',
      value: topLoser ? `${topLoser.name} ${formatPercent(topLoser.change24h)}` : 'N/A',
      icon: '📉',
    },
    {
      title: 'Total Market Cap',
      value: formatMarketCap(totalMarketCap),
      icon: '💰',
    },
    {
      title: 'Recent News (24h)',
      value: `${recentNewsCount} articles`,
      icon: '📰',
    },
  ]

  return (
    <div ref={sectionRef} className="space-y-4 bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-xl shadow-slate-950/50">
      <h2 className="text-xl font-bold text-white">Trending Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.title}
            className="bg-slate-800 rounded-3xl border border-slate-700 p-5 shadow-xl shadow-slate-950/20 hover:shadow-cyan-500/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{insight.icon}</span>
              <h3 className="text-sm font-semibold text-white">{insight.title}</h3>
            </div>
            <p className="text-lg font-bold text-white">{insight.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
