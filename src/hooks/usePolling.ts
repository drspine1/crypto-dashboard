'use client'

import { useEffect, useRef } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import dataAggregator from '@/services/dataAggregator'
import filterService from '@/services/filterService'
import { POLLING } from '@/utils/constants'
import { Crypto, PriceUpdate } from '@/types'

export const usePolling = () => {
  const {
    setCryptos,
    setNews,
    setLoading,
    setError,
    recordPriceUpdate,
    clearPriceUpdates,
    pollingActive,
    setPollingActive,
    setFilteredCryptos,
    setFilteredNews,
  } = useDashboardStore()

  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const pollData = async () => {
    try {
      const data = await dataAggregator.fetchAll()

      // Get current state for price change detection and fallback data
      const currentState = useDashboardStore.getState()

      // Only update crypto data if we have successful results
      if (data.cryptos.length > 0) {
        detectPriceChanges(currentState.cryptos, data.cryptos)
        setCryptos(data.cryptos)
      }

      // Only update news data if we have successful results
      if (data.news.length > 0) {
        setNews(data.news)
      }

      // Always update error states
      setError('crypto', data.errors.crypto)
      setError('news', data.errors.news)

      // Apply filters to current data (whether updated or not)
      const cryptoData = data.cryptos.length > 0 ? data.cryptos : currentState.cryptos
      const newsData = data.news.length > 0 ? data.news : currentState.news

      const filteredCryptos = filterService.filterCryptos(cryptoData, currentState.filters)
      const filteredNews = filterService.filterNews(newsData, currentState.filters)
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
