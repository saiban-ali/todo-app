'use client'

import { useEffect, useState } from 'react'
import { useTagStore } from '@/lib/stores/tagStore'
import { Tag } from '@/types/tag'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

interface TagManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function TagManager({ isOpen, onClose }: TagManagerProps) {
  const { tags, fetchTags, createTag, updateTag, deleteTag } = useTagStore()
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [editName, setEditName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchTags()
    }
  }, [isOpen, fetchTags])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    setIsSubmitting(true)
    await createTag({ name: newTagName.trim(), user_id: '' })
    setNewTagName('')
    setIsSubmitting(false)
  }

  const handleUpdate = async (tag: Tag) => {
    if (!editName.trim() || editName === tag.name) {
      setEditingTag(null)
      return
    }

    await updateTag(tag.id, { name: editName.trim() })
    setEditingTag(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this tag? It will be removed from all tasks.')) {
      await deleteTag(id)
    }
  }

  const startEdit = (tag: Tag) => {
    setEditingTag(tag)
    setEditName(tag.name)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Tags">
      <div className="space-y-4">
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            type="text"
            placeholder="New tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!newTagName.trim()}
          >
            Create
          </Button>
        </form>

        <div className="border-t border-zinc-200 pt-4 space-y-2">
          {tags.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">
              No tags yet. Create your first tag above.
            </p>
          ) : (
            tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50"
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: tag.color || '#e4e4e7' }}
                />
                {editingTag?.id === tag.id ? (
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleUpdate(tag)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(tag)
                      if (e.key === 'Escape') setEditingTag(null)
                    }}
                    className="h-8 text-sm flex-1"
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 text-sm font-medium text-zinc-900">
                    {tag.name}
                  </span>
                )}
                <div className="flex gap-1">
                  {editingTag?.id !== tag.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(tag)}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(tag.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}
