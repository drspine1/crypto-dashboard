import { useEffect, useRef } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import dataAggregator from '@/services/dataAggregator'
import filterService from '@/services/filterService'
import { POLLING } from '@/utils/constants'
import { Crypto, PriceUpdate } from '@/types'

export const usePolling = () => {
  const {
    cryptos: currentCryptos,
    setCryptos,
    setNews,
    setLoading,
    setError,
    recordPriceUpdate,
    clearPriceUpdates,
    filters,
    pollingActive,
    setPollingActive,
    setFilteredCryptos,
    setFilteredNews,
  } = useDashboardStore()

  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const pollData = async () => {
    try {
      const data = await dataAggregator.fetchAll()

      if (data.cryptos.length > 0) {
        detectPriceChanges(currentCryptos, data.cryptos)
        setCryptos(data.cryptos)
      }

      if (data.news.length > 0) {
        setNews(data.news)
      }

      if (data.errors.crypto) {
        setError('crypto', data.errors.crypto)
      } else {
        setError('crypto', null)
      }

      if (data.errors.news) {
        setError('news', data.errors.news)
      } else {
        setError('news', null)
      }

      const filteredCryptos = filterService.filterCryptos(data.cryptos, filters)
      const filteredNews = filterService.filterNews(data.news, filters)
      setFilteredCryptos(filteredCryptos)
      setFilteredNews(filteredNews)
    } catch (error) {
      console.error('Polling error:', error)
    } finally {
      setLoading('initial', false)
    }
  }

  const detectPriceChanges = (oldCryptos: Crypto[], newCryptos: Crypto[]) => {
    clearPriceUpdates()
    newCryptos.forEach((newCrypto) => {
      const oldCrypto = oldCryptos.find((c) => c.id === newCrypto.id)
      if (oldCrypto && oldCrypto.price !== newCrypto.price) {
        const priceUpdate: PriceUpdate = {
          cryptoId: newCrypto.id,
          oldPrice: oldCrypto.price,
          newPrice: newCrypto.price,
          changePercent: ((newCrypto.price - oldCrypto.price) / oldCrypto.price) * 100,
        }
        recordPriceUpdate(priceUpdate)
      }
    })
  }

  const startPolling = () => {
    if (pollingActive) return

    setPollingActive(true)
    pollingInterval.current = setInterval(pollData, POLLING.INTERVAL)
  }

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current)
      pollingInterval.current = null
    }
    setPollingActive(false)
  }

  useEffect(() => {
    startPolling()

    return () => {
      stopPolling()
    }
  }, [])

  return { startPolling, stopPolling }
}
