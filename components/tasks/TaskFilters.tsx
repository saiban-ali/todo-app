'use client'

import { useEffect, useState } from 'react'
import { useFilterStore } from '@/lib/stores/filterStore'
import { useTagStore } from '@/lib/stores/tagStore'
import { Button } from '@/components/ui/Button'
import { useDebouncedCallback } from '@/lib/hooks/useDebounce'

export function TaskFilters() {
  const { searchQuery, selectedTagIds, setSearchQuery, toggleTagFilter, clearFilters } = useFilterStore()
  const { tags, fetchTags } = useTagStore()
  const [localSearch, setLocalSearch] = useState(searchQuery)

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value)
  }, 300)

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    debouncedSetSearch(value)
  }

  const hasActiveFilters = searchQuery || selectedTagIds.length > 0

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-lg border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={() => {
              clearFilters()
              setLocalSearch('')
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTagFilter(tag.id)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  isSelected
                    ? 'ring-2 ring-zinc-900 ring-offset-2'
                    : 'opacity-50 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: tag.color || '#e4e4e7',
                  color: '#18181b',
                }}
              >
                {tag.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
