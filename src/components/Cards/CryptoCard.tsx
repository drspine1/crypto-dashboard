import { Crypto, PriceUpdate } from '@/types'
import { formatPrice, formatPercent, formatMarketCap } from '@/utils/formatters'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface CryptoCardProps {
  crypto: Crypto
  priceUpdate?: PriceUpdate
}

export const CryptoCard = ({ crypto, priceUpdate }: CryptoCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const priceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.5,
    })
  }, [])

  useEffect(() => {
    if (!priceUpdate || !priceRef.current) return

    const isPositive = priceUpdate.changePercent > 0

    gsap.to(priceRef.current, {
      backgroundColor: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      duration: 0.3,
      onComplete: () => {
        gsap.to(priceRef.current, {
          backgroundColor: 'transparent',
          duration: 0.6,
          delay: 0.5,
        })
      },
    })
  }, [priceUpdate])

  const isPositiveChange = crypto.change24h >= 0

  return (
    <div
      ref={cardRef}
      className="bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-xl shadow-slate-950/30 hover:shadow-sky-500/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {crypto.icon && (
            <img src={crypto.icon} alt={crypto.name} className="w-10 h-10 rounded-full" />
          )}
          <div>
            <h3 className="font-semibold text-white">{crypto.name}</h3>
            <p className="text-xs text-slate-300 uppercase tracking-[0.2em]">{crypto.symbol}</p>
          </div>
        </div>
      </div>

      <div ref={priceRef} className="space-y-3">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">Price</p>
          <p className="text-2xl font-bold text-white">{formatPrice(crypto.price)}</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">24h Change</p>
            <p className={`text-lg font-semibold ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercent(crypto.change24h)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">Market Cap</p>
            <p className="text-lg font-semibold text-white">{formatMarketCap(crypto.marketCap)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
