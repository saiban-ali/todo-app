'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TaskWithTags, Tag } from '@/types/task'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { TagSelector } from '@/components/tags/TagSelector'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TaskFormData, tagIds: string[]) => void
  task?: TaskWithTags | null
  isLoading?: boolean
}

export function TaskForm({ isOpen, onClose, onSubmit, task, isLoading }: TaskFormProps) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
    },
  })

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
      })
      setSelectedTags(task.tags || [])
    } else {
      reset({
        title: '',
        description: '',
      })
      setSelectedTags([])
    }
  }, [task, reset])

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit(data, selectedTags.map(t => t.id))
    reset()
    setSelectedTags([])
  }

  const handleClose = () => {
    reset()
    setSelectedTags([])
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={task ? 'Edit Task' : 'Create Task'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Title"
          placeholder="Enter task title"
          error={errors.title?.message}
          {...register('title')}
        />

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-zinc-900 mb-1.5"
          >
            Description (optional)
          </label>
          <textarea
            id="description"
            placeholder="Enter task description"
            className="flex min-h-[100px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1.5 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <TagSelector selectedTags={selectedTags} onTagsChange={setSelectedTags} />

        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {task ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
