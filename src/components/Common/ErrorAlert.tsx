import { ErrorType } from '@/types'

interface ErrorAlertProps {
  error: ErrorType | null
  onRetry?: () => void
  onDismiss?: () => void
}

export const ErrorAlert = ({ error, onRetry, onDismiss }: ErrorAlertProps) => {
  if (!error) return null

  return (
    <div className="rounded-lg bg-rose-950 border border-rose-700 p-4 flex items-start justify-between gap-4 animate-slide-in">
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{error.message}</p>
        <p className="text-xs text-white mt-1">Error Code: {error.code}</p>
      </div>

      <div className="flex items-center gap-2">
        {error.retryable && onRetry && (
          <button
            onClick={onRetry}
            className="text-xs px-3 py-1 rounded bg-danger-600 text-white hover:bg-danger-700 transition-colors"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-xs px-3 py-1 rounded bg-danger-500 text-white hover:bg-danger-700 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  )
}

export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}
