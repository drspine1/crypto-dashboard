import { News } from '@/types'
import { APIError } from '@/utils/errors'

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

interface NewsAPIResponse {
  articles: NewsArticle[]
}

class NewsClient {
  async fetchNews(): Promise<News[]> {
    try {
      // Use internal API route — avoids NewsAPI's localhost-only restriction in production
      const baseUrl =
        typeof window !== 'undefined'
          ? '' // browser: relative URL
          : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' // server: absolute URL

      const response = await fetch(`${baseUrl}/api/news`, {
        next: { revalidate: 300 },
      })

      if (!response.ok) {
        throw new APIError('UNKNOWN', `HTTP ${response.status}`, true)
      }

      const data: NewsAPIResponse = await response.json()
      return this.normalizeNews(data.articles || [])
    } catch (error) {
      if (error instanceof APIError) throw error
      throw new APIError('NETWORK', undefined, true)
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
}

export default new NewsClient()
