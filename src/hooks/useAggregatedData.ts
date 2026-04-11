import { useEffect } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import dataAggregator from '@/services/dataAggregator'
import filterService from '@/services/filterService'

export const useAggregatedData = () => {
  const {
    setCryptos,
    setNews,
    setLoading,
    setError,
    setFilteredCryptos,
    setFilteredNews,
    setLastUpdated,
    filters,
    cryptos,
    news,
  } = useDashboardStore()

  const fetchData = async () => {
    try {
      setLoading('initial', true)
      const data = await dataAggregator.fetchAll()

      if (data.cryptos.length > 0) {
        setCryptos(data.cryptos)
        setError('crypto', null) // Clear any previous crypto errors
      }
      if (data.errors.crypto) {
        setError('crypto', data.errors.crypto)
      }

      if (data.news.length > 0) {
        setNews(data.news)
        setError('news', null) // Clear any previous news errors
      }
      if (data.errors.news) {
        setError('news', data.errors.news)
      }

      setLastUpdated(data.lastUpdated)
      applyFilters(data.cryptos, data.news)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading('initial', false)
    }
  }

  const applyFilters = (cryptoData: any[], newsData: any[]) => {
    const filteredCryptos = filterService.filterCryptos(cryptoData, filters)
    const filteredNews = filterService.filterNews(newsData, filters)

    setFilteredCryptos(filteredCryptos)
    setFilteredNews(filteredNews)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters(cryptos, news)
  }, [filters, cryptos, news])

  return { fetchData }
}
