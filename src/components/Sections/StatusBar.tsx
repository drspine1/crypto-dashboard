'use client'

import { useDashboardStore } from '@/store/dashboardStore'
import { formatRelativeTime } from '@/utils/formatters'

export const StatusBar = () => {
  const { lastUpdated, pollingActive, loading, errors, resetError } = useDashboardStore()
  const errorCount = (errors.crypto ? 1 : 0) + (errors.news ? 1 : 0)

  const handleResetErrors = () => {
    if (errors.crypto) resetError('crypto')
    if (errors.news) resetError('news')
  }

  return (
    <div className="bg-slate-950 border-t border-slate-700 px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between text-xs text-white gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-white">Status:</span>
          {loading.initial ? (
            <span className="text-white font-medium">Loading...</span>
          ) : pollingActive ? (
            <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          ) : (
            <span className="text-white font-medium">Ready</span>
          )}
        </div>

        {lastUpdated && (
          <div className="text-white">
            Last updated: {formatRelativeTime(lastUpdated)}
          </div>
        )}
      </div>

      {errorCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full" />
          <span className="text-xs font-medium text-yellow-400">Some data unavailable</span>
          <button
            onClick={handleResetErrors}
            className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
