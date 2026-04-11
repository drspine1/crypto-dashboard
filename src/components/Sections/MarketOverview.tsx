import { useDashboardStore } from '@/store/dashboardStore'
import { CryptoCard } from '@/components/Cards/CryptoCard'
import { GridSkeleton, EmptyState, ErrorAlert } from '@/components/Common'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

export const MarketOverview = () => {
  const { filteredCryptos, loading, errors, priceUpdates, resetError } = useDashboardStore()
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || loading.initial) return
    gsap.from(sectionRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
    })
  }, [loading.initial])

  if (loading.initial) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Market Overview</h2>
        <GridSkeleton count={5} />
      </div>
    )
  }

  return (
    <div ref={sectionRef} className="space-y-4 bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-xl shadow-slate-950/50">
      <h2 className="text-xl font-bold text-white">Market Overview</h2>

      {errors.crypto && (
        <ErrorAlert error={errors.crypto} onDismiss={() => resetError('crypto')} />
      )}

      {filteredCryptos.length === 0 ? (
        <EmptyState title="No crypto data available" icon="" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCryptos.map((crypto) => (
            <CryptoCard
              key={crypto.id}
              crypto={crypto}
              priceUpdate={priceUpdates.get(crypto.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
