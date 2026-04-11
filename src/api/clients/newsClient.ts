import axios, { AxiosInstance } from 'axios'
import { API_CONFIG } from '@/utils/constants'
import { APIError, isRateLimitError, isTimeoutError } from '@/utils/errors'
import { News } from '@/types'

interface NewsAPIResponse {
  status: string
  articles: NewsArticle[]
}

interface NewsArticle {
  title: string
  source: {
    id: string | null
    name: string
  }
  url: string
  urlToImage?: string
  publishedAt: string
  description?: string
}

class NewsClient {
  private client: AxiosInstance
  private apiKey: string

  constructor() {
    const keyFromEnv = import.meta.env.VITE_NEWS_API_KEY
    this.apiKey = keyFromEnv || 'demo'
    
    // Warn if using demo key
    if (this.apiKey === 'demo' && typeof window !== 'undefined') {
      console.warn('⚠️ NewsAPI using demo key. News section will not return data. Get a real key at https://newsapi.org/')
    }

    this.client = axios.create({
      baseURL: API_CONFIG.NEWS.BASE_URL,
      timeout: API_CONFIG.NEWS.TIMEOUT,
    })

    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    )
  }

  async fetchNews(): Promise<News[]> {
    try {
      const response = await this.client.get<NewsAPIResponse>('/everything', {
        params: {
          q: API_CONFIG.NEWS.QUERY,
          sortBy: API_CONFIG.NEWS.SORT_BY,
          language: 'en',
          pageSize: 20,
          apiKey: this.apiKey,
        },
      })

      return this.normalizeNews(response.data.articles)
    } catch (error) {
      if (error instanceof APIError) throw error
      throw new APIError('UNKNOWN', String(error), true)
    }
  }

  private normalizeNews(articles: NewsArticle[]): News[] {
    return articles.map((article, index) => ({
      id: `news-${index}-${Date.now()}`,
      title: article.title,
      source: article.source.name,
      url: article.url,
      image: article.urlToImage,
      description: article.description,
      publishedAt: new Date(article.publishedAt),
      category: 'crypto' as const,
    }))
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

export default new NewsClient()
