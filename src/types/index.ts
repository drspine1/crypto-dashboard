export interface Crypto {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
  marketCap: number
  icon: string
  timestamp: Date
}

export interface News {
  id: string
  title: string
  source: string
  url: string
  image?: string
  publishedAt: Date
  description?: string
  category: 'crypto' | 'technology' | 'business'
}

export interface PriceUpdate {
  cryptoId: string
  oldPrice: number
  newPrice: number
  changePercent: number
}

export interface ErrorType {
  code: string
  message: string
  timestamp: Date
  retryable: boolean
}

export interface FilterOptions {
  searchQuery: string
  priceRange: [number, number]
  category: 'all' | 'crypto' | 'news'
  sortBy: 'price' | 'change' | 'recent'
}
