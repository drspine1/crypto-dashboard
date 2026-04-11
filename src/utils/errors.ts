import { ErrorType } from '@/types'
import { ERROR_MESSAGES } from './constants'

export class APIError extends Error {
  code: string
  retryable: boolean

  constructor(code: string, message?: string, retryable = false) {
    super(message || ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.UNKNOWN)
    this.code = code
    this.retryable = retryable
  }

  toErrorType(): ErrorType {
    return {
      code: this.code,
      message: this.message,
      timestamp: new Date(),
      retryable: this.retryable,
    }
  }
}

export const createError = (code: string, message?: string, retryable = false): ErrorType => {
  return {
    code,
    message: message || ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.UNKNOWN,
    timestamp: new Date(),
    retryable,
  }
}

export const isRetryableError = (error: ErrorType): boolean => {
  return error.retryable
}

export const isRateLimitError = (status: number): boolean => {
  return status === 429
}

export const isTimeoutError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.includes('timeout') || error.message.includes('ETIMEDOUT')
  }
  return false
}
