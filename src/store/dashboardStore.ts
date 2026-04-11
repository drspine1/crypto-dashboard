import { create } from 'zustand'
import { Crypto, News, ErrorType, FilterOptions, PriceUpdate } from '@/types'

interface DashboardState {
  cryptos: Crypto[]
  news: News[]
  filteredCryptos: Crypto[]
  filteredNews: News[]
  priceUpdates: Map<string, PriceUpdate>

  loading: {
    crypto: boolean
    news: boolean
    initial: boolean
  }

  errors: {
    crypto: ErrorType | null
    news: ErrorType | null
  }

  filters: FilterOptions
  lastUpdated: Date | null
  pollingActive: boolean

  setCryptos: (cryptos: Crypto[]) => void
  setNews: (news: News[]) => void
  setLoading: (type: 'crypto' | 'news' | 'initial', value: boolean) => void
  setError: (type: 'crypto' | 'news', error: ErrorType | null) => void
  resetError: (type: 'crypto' | 'news') => void

  setSearchQuery: (query: string) => void
  setPriceRange: (range: [number, number]) => void
  setCategory: (category: FilterOptions['category']) => void
  setSortBy: (sortBy: FilterOptions['sortBy']) => void

  recordPriceUpdate: (update: PriceUpdate) => void
  clearPriceUpdates: () => void

  setFilteredCryptos: (cryptos: Crypto[]) => void
  setFilteredNews: (news: News[]) => void
  setLastUpdated: (date: Date) => void
  setPollingActive: (active: boolean) => void

  getFilters: () => FilterOptions
  reset: () => void
}

const initialFilters: FilterOptions = {
  searchQuery: '',
  priceRange: [0, 100000],
  category: 'all',
  sortBy: 'price',
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  cryptos: [],
  news: [],
  filteredCryptos: [],
  filteredNews: [],
  priceUpdates: new Map(),

  loading: {
    crypto: false,
    news: false,
    initial: true,
  },

  errors: {
    crypto: null,
    news: null,
  },

  filters: initialFilters,
  lastUpdated: null,
  pollingActive: false,

  setCryptos: (cryptos) => set({ cryptos }),
  setNews: (news) => set({ news }),

  setLoading: (type, value) =>
    set((state) => ({
      loading: {
        ...state.loading,
        [type]: value,
      },
    })),

  setError: (type, error) =>
    set((state) => ({
      errors: {
        ...state.errors,
        [type]: error,
      },
    })),

  resetError: (type) =>
    set((state) => ({
      errors: {
        ...state.errors,
        [type]: null,
      },
    })),

  setSearchQuery: (query) =>
    set((state) => ({
      filters: {
        ...state.filters,
        searchQuery: query,
      },
    })),

  setPriceRange: (range) =>
    set((state) => ({
      filters: {
        ...state.filters,
        priceRange: range,
      },
    })),

  setCategory: (category) =>
    set((state) => ({
      filters: {
        ...state.filters,
        category,
      },
    })),

  setSortBy: (sortBy) =>
    set((state) => ({
      filters: {
        ...state.filters,
        sortBy,
      },
    })),

  recordPriceUpdate: (update) =>
    set((state) => {
      const updates = new Map(state.priceUpdates)
      updates.set(update.cryptoId, update)
      return { priceUpdates: updates }
    }),

  clearPriceUpdates: () => set({ priceUpdates: new Map() }),

  setFilteredCryptos: (cryptos) => set({ filteredCryptos: cryptos }),
  setFilteredNews: (news) => set({ filteredNews: news }),
  setLastUpdated: (date) => set({ lastUpdated: date }),
  setPollingActive: (active) => set({ pollingActive: active }),

  getFilters: () => get().filters,

  reset: () =>
    set({
      cryptos: [],
      news: [],
      filteredCryptos: [],
      filteredNews: [],
      priceUpdates: new Map(),
      loading: { crypto: false, news: false, initial: true },
      errors: { crypto: null, news: null },
      filters: initialFilters,
      lastUpdated: null,
      pollingActive: false,
    }),
}))
