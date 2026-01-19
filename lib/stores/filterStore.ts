import { create } from 'zustand'

interface FilterStore {
  searchQuery: string
  selectedTagIds: string[]

  setSearchQuery: (query: string) => void
  setSelectedTagIds: (tagIds: string[]) => void
  clearFilters: () => void
  toggleTagFilter: (tagId: string) => void
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  searchQuery: '',
  selectedTagIds: [],

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  setSelectedTagIds: (tagIds: string[]) => set({ selectedTagIds: tagIds }),

  clearFilters: () => set({ searchQuery: '', selectedTagIds: [] }),

  toggleTagFilter: (tagId: string) => {
    const current = get().selectedTagIds
    const isSelected = current.includes(tagId)

    if (isSelected) {
      set({ selectedTagIds: current.filter(id => id !== tagId) })
    } else {
      set({ selectedTagIds: [...current, tagId] })
    }
  },
}))
