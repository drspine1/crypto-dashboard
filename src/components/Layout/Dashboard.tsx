'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { SearchBar } from '@/components/Common'
import { MarketOverview, NewsFeed, StatusBar, TrendingInsights } from '@/components/Sections'
import { useAggregatedData } from '@/hooks/useAggregatedData'
import { usePolling } from '@/hooks/usePolling'

export const Dashboard = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  useAggregatedData()
  usePolling()

  useEffect(() => {
    if (!containerRef.current) return

    gsap.from(containerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power2.out',
    })
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-950 border-b border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">PulseData</h1>
            <p className="text-xs text-slate-400">Real-time API Aggregator Dashboard</p>
          </div>
          <SearchBar />
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        <MarketOverview />
        <TrendingInsights />
        <NewsFeed />
      </main>

      <StatusBar />
    </div>
  )
}
