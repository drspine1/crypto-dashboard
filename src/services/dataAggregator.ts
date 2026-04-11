import cryptoClient from '@/api/clients/cryptoClient'
import newsClient from '@/api/clients/newsClient'
import { Crypto, News, ErrorType } from '@/types'
import { POLLING } from '@/utils/constants'
import { createError } from '@/utils/errors'

export interface AggregatedData {
  cryptos: Crypto[]
  news: News[]
  errors: {
    crypto: ErrorType | null
    news: ErrorType | null
  }
  lastUpdated: Date
}

class DataAggregator {
  async fetchAll(): Promise<AggregatedData> {
    const results = await Promise.allSettled([
      cryptoClient.fetchCryptos(),
      newsClient.fetchNews(),
    ])

    const cryptoResult = results[0]
    const newsResult = results[1]

    const cryptos: Crypto[] = cryptoResult.status === 'fulfilled' ? cryptoResult.value : []
    const cryptoError: ErrorType | null =
      cryptoResult.status === 'rejected' ? (cryptoResult.reason as ErrorType) : null

    const news: News[] = newsResult.status === 'fulfilled' ? newsResult.value : []
    const newsError: ErrorType | null =
      newsResult.status === 'rejected' ? (newsResult.reason as ErrorType) : null

    return {
      cryptos,
      news,
      errors: {
        crypto: cryptoError,
        news: newsError,
      },
      lastUpdated: new Date(),
    }
  }

  async retryWithBackoff(
    fn: () => Promise<Crypto[] | News[]>,
    maxRetries: number = POLLING.MAX_RETRIES
  ): Promise<Crypto[] | News[]> {
    let lastError: any

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        if (attempt < maxRetries - 1) {
          const backoffMs = POLLING.RETRY_BACKOFF[attempt] || 4000
          await new Promise((resolve) => setTimeout(resolve, backoffMs))
        }
      }
    }

    throw lastError
  }

  getHealthStatus(data: AggregatedData): {
    healthy: boolean
    hasErrors: boolean
    errorCount: number
  } {
    const errorCount = (data.errors.crypto ? 1 : 0) + (data.errors.news ? 1 : 0)
    return {
      healthy: errorCount === 0,
      hasErrors: errorCount > 0,
      errorCount,
    }
  }
}

export default new DataAggregator()
