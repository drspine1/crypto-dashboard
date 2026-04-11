import axios, { AxiosInstance } from 'axios'
import { API_CONFIG, POLLING } from '@/utils/constants'
import { APIError, isRateLimitError, isTimeoutError } from '@/utils/errors'
import { Crypto } from '@/types'

interface CoinGeckoResponse {
  id: string
  name: string
  symbol: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
}

class CryptoClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.COINGECKO.BASE_URL,
      timeout: API_CONFIG.COINGECKO.TIMEOUT,
    })

    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    )
  }

  async fetchCryptos(): Promise<Crypto[]> {
    try {
      const ids = API_CONFIG.COINGECKO.IDS.join(',')
      const response = await this.client.get<CoinGeckoResponse[]>('/coins/markets', {
        params: {
          vs_currency: 'usd',
          ids,
          order: 'market_cap_desc',
          per_page: 250,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h',
        },
      })

      return this.normalizeCryptos(response.data)
    } catch (error) {
      if (error instanceof APIError) throw error
      throw new APIError('UNKNOWN', String(error), true)
    }
  }

  private normalizeCryptos(data: Record<string, any>[]): Crypto[] {
    return API_CONFIG.COINGECKO.IDS.map((id) => {
      const item = data.find((d) => d.id === id)
      if (!item) {
        return {
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          symbol: id.substring(0, 3).toUpperCase(),
          price: 0,
          change24h: 0,
          marketCap: 0,
          icon: '',
          timestamp: new Date(),
        }
      }

      return {
        id: item.id,
        name: item.name,
        symbol: item.symbol.toUpperCase(),
        price: item.current_price || 0,
        change24h: item.price_change_percentage_24h || 0,
        marketCap: item.market_cap || 0,
        icon: item.image || '',
        timestamp: new Date(),
      }
    })
  }

  private handleError(error: any): never {
    if (error.code === 'ECONNABORTED' || isTimeoutError(error)) {
      throw new APIError('TIMEOUT', undefined, true)
    }

    if (error.response?.status === 429 || isRateLimitError(error.response?.status)) {
      throw new APIError('RATE_LIMIT', undefined, true)
    }

    if (error.response?.status >= 500) {
      throw new APIError('UNKNOWN', undefined, true)
    }

    if (error.response?.status >= 400) {
      throw new APIError('UNKNOWN', `HTTP ${error.response.status}`, false)
    }

    if (!error.response) {
      throw new APIError('NETWORK', undefined, true)
    }

    throw new APIError('UNKNOWN', String(error), true)
  }
}

export default new CryptoClient()
