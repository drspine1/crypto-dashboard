import { Crypto, News, FilterOptions } from '@/types'
import { sanitizeSearchQuery } from '@/utils/validators'

class FilterService {
  filterCryptos(cryptos: Crypto[], options: FilterOptions): Crypto[] {
    let filtered = [...cryptos]

    if (options.searchQuery) {
      const query = sanitizeSearchQuery(options.searchQuery)
      filtered = filtered.filter(
        (crypto) =>
          crypto.name.toLowerCase().includes(query) ||
          crypto.symbol.toLowerCase().includes(query)
      )
    }

    const [minPrice, maxPrice] = options.priceRange
    filtered = filtered.filter((crypto) => crypto.price >= minPrice && crypto.price <= maxPrice)

    return this.sortCryptos(filtered, options.sortBy)
  }

  filterNews(news: News[], options: FilterOptions): News[] {
    let filtered = [...news]

    if (options.searchQuery) {
      const query = sanitizeSearchQuery(options.searchQuery)
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.source.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      )
    }

    return this.sortNews(filtered, options.sortBy)
  }

  searchAll(
    cryptos: Crypto[],
    news: News[],
    query: string
  ): { cryptos: Crypto[]; news: News[] } {
    const sanitized = sanitizeSearchQuery(query)
    const lowerQuery = sanitized.toLowerCase()

    return {
      cryptos: cryptos.filter(
        (c) =>
          c.name.toLowerCase().includes(lowerQuery) || c.symbol.toLowerCase().includes(lowerQuery)
      ),
      news: news.filter(
        (n) =>
          n.title.toLowerCase().includes(lowerQuery) ||
          n.source.toLowerCase().includes(lowerQuery) ||
          n.description?.toLowerCase().includes(lowerQuery)
      ),
    }
  }

  private sortCryptos(cryptos: Crypto[], sortBy: string): Crypto[] {
    const sorted = [...cryptos]

    switch (sortBy) {
      case 'price':
        return sorted.sort((a, b) => b.price - a.price)
      case 'change':
        return sorted.sort((a, b) => b.change24h - a.change24h)
      default:
        return sorted
    }
  }

  private sortNews(news: News[], sortBy: string): News[] {
    const sorted = [...news]

    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      default:
        return sorted
    }
  }
}

export default new FilterService()
