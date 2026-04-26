export const API_CONFIG = {
  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    TIMEOUT: 10000,
    TOP_N: 20,
  },
  NEWS: {
    BASE_URL: 'https://newsapi.org/v2',
    TIMEOUT: 10000,
    QUERY: 'crypto',
    SORT_BY: 'publishedAt',
  },
}

export const POLLING = {
  INTERVAL: 15000,
  RETRY_BACKOFF: [1000, 2000, 4000],
  MAX_RETRIES: 3,
}

export const UI = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 0.6,
  STAGGER_DELAY: 0.1,
}

export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  RATE_LIMIT: 'API rate limit exceeded. Please wait a moment.',
  NOT_FOUND: 'Data not found.',
  UNKNOWN: 'An unexpected error occurred.',
}

export const PRICE_RANGES = {
  MIN: 0,
  MAX: 10_000_000,
  STEP: 10000,
}
