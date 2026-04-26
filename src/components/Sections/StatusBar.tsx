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
            <>
              <span className="inline-block w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              <span className="text-white font-medium">Live</span>
            </>
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
          <span className="text-xs font-medium text-red-400">{errorCount} API error(s)</span>
          <button
            onClick={handleResetErrors}
            className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
