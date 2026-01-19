import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { Task, TaskInsert, TaskUpdate, TaskWithTags, Tag } from '@/types/task'
import { useToastStore } from './toastStore'

interface TaskStore {
  tasks: TaskWithTags[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  page: number
  pageSize: number
  hasMore: boolean

  fetchTasks: (reset?: boolean) => Promise<void>
  loadMoreTasks: () => Promise<void>
  createTask: (task: TaskInsert, tagIds?: string[]) => Promise<void>
  updateTask: (id: string, updates: TaskUpdate, tagIds?: string[]) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  reorderTasks: (taskId: string, newPriority: number) => Promise<void>
  updateTaskTags: (taskId: string, tagIds: string[]) => Promise<void>
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  page: 0,
  pageSize: 50,
  hasMore: true,

  fetchTasks: async (reset = true) => {
    if (reset) {
      set({ isLoading: true, error: null, page: 0, hasMore: true, tasks: [] })
    } else {
      set({ isLoadingMore: true, error: null })
    }

    const supabase = createClient()
    const currentPage = reset ? 0 : get().page
    const pageSize = get().pageSize
    const from = currentPage * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('tasks')
      .select(`
        *,
        task_tags (
          tag_id,
          tags (*)
        )
      `, { count: 'exact' })
      .order('priority', { ascending: false })
      .range(from, to)

    if (error) {
      set({ error: error.message, isLoading: false, isLoadingMore: false })
    } else {
      const tasksWithTags: TaskWithTags[] = data.map((task) => ({
        ...task,
        tags: task.task_tags?.map((tt) => tt.tags) || [],
      }))

      const existingTasks = reset ? [] : get().tasks
      const allTasks = [...existingTasks, ...tasksWithTags]
      const hasMore = count ? allTasks.length < count : false

      set({
        tasks: allTasks,
        isLoading: false,
        isLoadingMore: false,
        page: currentPage + 1,
        hasMore,
      })
    }
  },

  loadMoreTasks: async () => {
    const { hasMore, isLoadingMore, isLoading } = get()
    if (!hasMore || isLoadingMore || isLoading) return

    await get().fetchTasks(false)
  },

  createTask: async (taskData: TaskInsert, tagIds?: string[]) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'User not authenticated' })
      return
    }

    const newTask: TaskInsert = {
      ...taskData,
      user_id: user.id,
      priority: get().tasks.length,
    }

    const tempId = `temp-${Date.now()}`
    const optimisticTask: TaskWithTags = {
      id: tempId,
      ...newTask,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      priority: newTask.priority || 0,
      description: newTask.description || null,
      user_id: user.id,
      tags: [],
    }

    set({ tasks: [optimisticTask, ...get().tasks] })

    const { data, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single()

    if (error) {
      set({
        tasks: get().tasks.filter(t => t.id !== tempId),
        error: error.message
      })
      useToastStore.getState().error('Failed to create task')
    } else {
      if (tagIds && tagIds.length > 0) {
        const taskTagInserts = tagIds.map(tagId => ({
          task_id: data.id,
          tag_id: tagId,
        }))
        await supabase.from('task_tags').insert(taskTagInserts)
      }

      await get().fetchTasks(true)
      useToastStore.getState().success('Task created successfully')
    }
  },

  updateTask: async (id: string, updates: TaskUpdate, tagIds?: string[]) => {
    const supabase = createClient()
    const originalTasks = get().tasks

    set({
      tasks: get().tasks.map(t =>
        t.id === id ? { ...t, ...updates } : t
      )
    })

    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)

    if (error) {
      set({ tasks: originalTasks, error: error.message })
      useToastStore.getState().error('Failed to update task')
    } else if (tagIds !== undefined) {
      await get().updateTaskTags(id, tagIds)
      useToastStore.getState().success('Task updated successfully')
    } else {
      await get().fetchTasks(true)
      useToastStore.getState().success('Task updated successfully')
    }
  },

  updateTaskTags: async (taskId: string, tagIds: string[]) => {
    const supabase = createClient()

    await supabase.from('task_tags').delete().eq('task_id', taskId)

    if (tagIds.length > 0) {
      const taskTagInserts = tagIds.map(tagId => ({
        task_id: taskId,
        tag_id: tagId,
      }))
      await supabase.from('task_tags').insert(taskTagInserts)
    }

    await get().fetchTasks(true)
  },

  deleteTask: async (id: string) => {
    const supabase = createClient()
    const originalTasks = get().tasks

    set({ tasks: get().tasks.filter(t => t.id !== id) })

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      set({ tasks: originalTasks, error: error.message })
      useToastStore.getState().error('Failed to delete task')
    } else {
      useToastStore.getState().success('Task deleted successfully')
    }
  },

  reorderTasks: async (taskId: string, newPriority: number) => {
    const supabase = createClient()
    const originalTasks = get().tasks

    const reorderedTasks = [...get().tasks]
    const taskIndex = reorderedTasks.findIndex(t => t.id === taskId)
    const [task] = reorderedTasks.splice(taskIndex, 1)
    reorderedTasks.splice(newPriority, 0, task)

    const updatedTasks = reorderedTasks.map((t, index) => ({
      ...t,
      priority: reorderedTasks.length - index - 1,
    }))

    set({ tasks: updatedTasks })

    const updates = updatedTasks.map(t =>
      supabase
        .from('tasks')
        .update({ priority: t.priority })
        .eq('id', t.id)
    )

    const results = await Promise.all(updates)
    const errors = results.filter(r => r.error)

    if (errors.length > 0) {
      set({ tasks: originalTasks, error: 'Failed to reorder tasks' })
    }
  },
}))
