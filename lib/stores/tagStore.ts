import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { Tag, TagInsert, TagUpdate } from '@/types/tag'
import { useToastStore } from './toastStore'

interface TagStore {
  tags: Tag[]
  isLoading: boolean
  error: string | null

  fetchTags: () => Promise<void>
  createTag: (tag: TagInsert) => Promise<Tag | null>
  updateTag: (id: string, updates: TagUpdate) => Promise<void>
  deleteTag: (id: string) => Promise<void>
}

const PRESET_COLORS = [
  '#fecaca', // red-200
  '#fed7aa', // orange-200
  '#fde047', // yellow-300
  '#86efac', // green-300
  '#7dd3fc', // sky-300
  '#c4b5fd', // violet-300
  '#f9a8d4', // pink-300
  '#d1d5db', // gray-300
]

export const useTagStore = create<TagStore>((set, get) => ({
  tags: [],
  isLoading: false,
  error: null,

  fetchTags: async () => {
    set({ isLoading: true, error: null })
    const supabase = createClient()

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      set({ error: error.message, isLoading: false })
    } else {
      set({ tags: data || [], isLoading: false })
    }
  },

  createTag: async (tagData: TagInsert) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'User not authenticated' })
      return null
    }

    const randomColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]

    const newTag: TagInsert = {
      ...tagData,
      user_id: user.id,
      color: tagData.color || randomColor,
    }

    const tempId = `temp-${Date.now()}`
    const optimisticTag: Tag = {
      id: tempId,
      name: newTag.name,
      color: newTag.color || randomColor,
      user_id: user.id,
      created_at: new Date().toISOString(),
    }

    set({ tags: [optimisticTag, ...get().tags] })

    const { data, error } = await supabase
      .from('tags')
      .insert(newTag)
      .select()
      .single()

    if (error) {
      set({
        tags: get().tags.filter(t => t.id !== tempId),
        error: error.message
      })
      useToastStore.getState().error('Failed to create tag')
      return null
    } else {
      set({
        tags: get().tags.map(t => t.id === tempId ? data : t)
      })
      useToastStore.getState().success('Tag created successfully')
      return data
    }
  },

  updateTag: async (id: string, updates: TagUpdate) => {
    const supabase = createClient()
    const originalTags = get().tags

    set({
      tags: get().tags.map(t =>
        t.id === id ? { ...t, ...updates } : t
      )
    })

    const { error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)

    if (error) {
      set({ tags: originalTags, error: error.message })
      useToastStore.getState().error('Failed to update tag')
    } else {
      useToastStore.getState().success('Tag updated successfully')
    }
  },

  deleteTag: async (id: string) => {
    const supabase = createClient()
    const originalTags = get().tags

    set({ tags: get().tags.filter(t => t.id !== id) })

    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    if (error) {
      set({ tags: originalTags, error: error.message })
      useToastStore.getState().error('Failed to delete tag')
    } else {
      useToastStore.getState().success('Tag deleted successfully')
    }
  },
}))
