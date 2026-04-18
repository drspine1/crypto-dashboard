'use client'

import { useState, useCallback } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { UI } from '@/utils/constants'

export const SearchBar = () => {
  const [input, setInput] = useState('')
  const { setSearchQuery } = useDashboardStore()

  const handleDebouncedSearch = useCallback(
    (() => {
      let timeoutId: ReturnType<typeof setTimeout>
      return (value: string) => {
        clearTimeout(timeoutId)
        setInput(value)
        timeoutId = setTimeout(() => {
          setSearchQuery(value)
        }, UI.DEBOUNCE_DELAY)
      }
    })(),
    [setSearchQuery]
  )

  return (
    <div className="w-full max-w-md">
      <input
        type="text"
        placeholder="Search crypto or news..."
        value={input}
        onChange={(e) => handleDebouncedSearch(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
      />
    </div>
  )
}
