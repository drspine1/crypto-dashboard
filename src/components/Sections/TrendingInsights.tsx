'use client'

import { useDashboardStore } from '@/store/dashboardStore'
import { formatPrice, formatPercent } from '@/utils/formatters'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

export const TrendingInsights = () => {
  const { filteredCryptos, filteredNews } = useDashboardStore()
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    gsap.from(sectionRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      delay: 0.2,
    })
  }, [])

  // Calculate insights
  const topGainer = filteredCryptos.reduce((max, crypto) =>
    crypto.change24h > (max?.change24h || -Infinity) ? crypto : max, null as any
  )

  const topLoser = filteredCryptos.reduce((min, crypto) =>
    crypto.change24h < (min?.change24h || Infinity) ? crypto : min, null as any
  )

  const totalMarketCap = filteredCryptos.reduce((sum, crypto) => sum + crypto.marketCap, 0)
  const recentNewsCount = filteredNews.filter(news =>
    new Date().getTime() - news.publishedAt.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
  ).length

  const insights = [
    {
      title: 'Top Gainer (24h)',
      value: topGainer ? `${topGainer.name} ${formatPercent(topGainer.change24h)}` : 'N/A',
      color: 'text-white',
      icon: '📈'
    },
    {
      title: 'Top Loser (24h)',
      value: topLoser ? `${topLoser.name} ${formatPercent(topLoser.change24h)}` : 'N/A',
      color: 'text-white',
      icon: '📉'
    },
    {
      title: 'Total Market Cap',
      value: formatPrice(totalMarketCap),
      color: 'text-white',
      icon: '💰'
    },
    {
      title: 'Recent News (24h)',
      value: `${recentNewsCount} articles`,
      color: 'text-white',
      icon: '📰'
    }
  ]

  return (
    <div ref={sectionRef} className="space-y-4 bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-xl shadow-slate-950/50">
      <h2 className="text-xl font-bold text-white">Trending Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <div
            key={insight.title}
            className="bg-slate-800 rounded-3xl border border-slate-700 p-5 shadow-xl shadow-slate-950/20 hover:shadow-cyan-500/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{insight.icon}</span>
              <h3 className="text-sm font-semibold text-white">{insight.title}</h3>
            </div>
            <p className={`text-lg font-bold ${insight.color}`}>{insight.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}