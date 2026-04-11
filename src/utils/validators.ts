export const isValidPrice = (price: unknown): price is number => {
  return typeof price === 'number' && isFinite(price) && price >= 0
}

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const isEmptyString = (str: unknown): boolean => {
  return typeof str === 'string' && str.trim().length === 0
}

export const sanitizeSearchQuery = (query: string): string => {
  return query.trim().toLowerCase().substring(0, 100)
}

export const isPriceChange = (oldPrice: number, newPrice: number): boolean => {
  return Math.abs(newPrice - oldPrice) > 0.01
}
