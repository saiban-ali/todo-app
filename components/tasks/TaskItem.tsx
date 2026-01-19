'use client'

import { memo } from 'react'
import { TaskWithTags } from '@/types/task'
import { Button } from '@/components/ui/Button'
import { formatDistanceToNow } from 'date-fns'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'

interface TaskItemProps {
  task: TaskWithTags
  onEdit: (task: TaskWithTags) => void
  onDelete: (id: string) => void
}

export const TaskItem = memo(function TaskItem({ task, onEdit, onDelete }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'default',
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="group p-4 rounded-lg border border-zinc-200 bg-white hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-3">
        <button
          className="mt-1 cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-100 rounded transition-colors"
          {...attributes}
          {...listeners}
        >
          <svg
            className="h-5 w-5 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-zinc-900 mb-1">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-zinc-600 mb-2 line-clamp-2">
              {task.description}
            </p>
          )}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {task.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: tag.color || '#e4e4e7',
                    color: '#18181b',
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-zinc-500">
            {task.updated_at && formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(task)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      </div>
    </motion.div>
  )
})
