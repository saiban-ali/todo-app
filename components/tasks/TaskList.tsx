'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useTaskStore } from '@/lib/stores/taskStore'
import { useFilterStore } from '@/lib/stores/filterStore'
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll'
import { TaskWithTags } from '@/types/task'
import { TaskItem } from './TaskItem'
import { TaskForm } from './TaskForm'
import { TaskFilters } from './TaskFilters'
import { EmptyState } from './EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { TaskSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { TagManager } from '@/components/tags/TagManager'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useVirtualizer } from '@tanstack/react-virtual'
import { AnimatePresence } from 'framer-motion'

export function TaskList() {
  const { tasks, isLoading, isLoadingMore, hasMore, fetchTasks, loadMoreTasks, createTask, updateTask, deleteTask, reorderTasks } = useTaskStore()
  const { searchQuery, selectedTagIds } = useFilterStore()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithTags | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const parentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTasks(true)
  }, [])

  useInfiniteScroll(parentRef, {
    onLoadMore: loadMoreTasks,
    hasMore,
    isLoading: isLoadingMore,
    threshold: 300,
  })

  const filteredTasks = useMemo(() => {
    let filtered = tasks

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      )
    }

    if (selectedTagIds.length > 0) {
      filtered = filtered.filter(task =>
        task.tags?.some(tag => selectedTagIds.includes(tag.id))
      )
    }

    return filtered
  }, [tasks, searchQuery, selectedTagIds])

  const virtualizer = useVirtualizer({
    count: filteredTasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  })

  const handleCreate = useCallback(async (data: { title: string; description?: string }, tagIds: string[]) => {
    setIsSubmitting(true)
    await createTask({
      title: data.title,
      description: data.description || null,
      user_id: '', // Will be set in the store
    }, tagIds)
    setIsSubmitting(false)
    setIsFormOpen(false)
  }, [createTask])

  const handleUpdate = useCallback(async (data: { title: string; description?: string }, tagIds: string[]) => {
    if (!editingTask) return
    setIsSubmitting(true)
    await updateTask(editingTask.id, {
      title: data.title,
      description: data.description || null,
    }, tagIds)
    setIsSubmitting(false)
    setEditingTask(null)
  }, [editingTask, updateTask])

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id)
    }
  }, [deleteTask])

  const handleEdit = useCallback((task: TaskWithTags) => {
    setEditingTask(task)
  }, [])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)

    if (!over || active.id === over.id) return

    const hasActiveFilters = searchQuery || selectedTagIds.length > 0
    if (hasActiveFilters) {
      return
    }

    const oldIndex = tasks.findIndex(t => t.id === active.id)
    const newIndex = tasks.findIndex(t => t.id === over.id)

    if (oldIndex !== newIndex) {
      await reorderTasks(active.id as string, newIndex)
    }
  }, [searchQuery, selectedTagIds, tasks, reorderTasks])

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  if (isLoading && tasks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-zinc-900">Tasks</h2>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-900">
          Tasks ({filteredTasks.length}{tasks.length !== filteredTasks.length && ` of ${tasks.length}`})
        </h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsTagManagerOpen(true)}>
            Manage Tags
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            Create Task
          </Button>
        </div>
      </div>

      <TaskFilters />

      {tasks.length === 0 ? (
        <EmptyState
          message="No tasks yet. Create your first task to get started!"
          action={{
            label: 'Create your first task',
            onClick: () => setIsFormOpen(true),
          }}
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          message="No tasks match your filters"
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div
              ref={parentRef}
              className="overflow-auto max-h-[calc(100vh-300px)]"
            >
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                <AnimatePresence>
                  {virtualizer.getVirtualItems().map((virtualItem) => {
                    const task = filteredTasks[virtualItem.index]
                    return (
                      <div
                        key={task.id}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <div className="pb-3">
                          <TaskItem
                            task={task}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        </div>
                      </div>
                    )
                  })}
                </AnimatePresence>
              </div>
              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="flex justify-center items-center py-4">
                  <Spinner />
                  <span className="ml-2 text-sm text-zinc-600">Loading more tasks...</span>
                </div>
              )}
              {/* No more tasks indicator */}
              {!hasMore && tasks.length > 0 && !isLoadingMore && (
                <div className="text-center py-4 text-sm text-zinc-500">
                  No more tasks to load
                </div>
              )}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeTask && (
              <div className="opacity-90 rotate-3 scale-105">
                <TaskItem
                  task={activeTask}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreate}
        isLoading={isSubmitting}
      />

      <TaskForm
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdate}
        task={editingTask}
        isLoading={isSubmitting}
      />

      <TagManager
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
      />
    </div>
  )
}
