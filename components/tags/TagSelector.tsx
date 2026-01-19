'use client'

import { useState, useEffect } from 'react'
import { useTagStore } from '@/lib/stores/tagStore'
import { Tag } from '@/types/tag'
import { TagBadge } from './TagBadge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface TagSelectorProps {
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const { tags, fetchTags, createTag } = useTagStore()
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const handleToggleTag = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id)
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    setIsSubmitting(true)
    const newTag = await createTag({ name: newTagName.trim(), user_id: '' })
    if (newTag) {
      onTagsChange([...selectedTags, newTag])
      setNewTagName('')
      setIsCreating(false)
    }
    setIsSubmitting(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreateTag()
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-900">
        Tags
      </label>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              onRemove={() => handleToggleTag(tag)}
            />
          ))}
        </div>
      )}

      <div className="border border-zinc-300 rounded-lg p-3 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const isSelected = selectedTags.some(t => t.id === tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleToggleTag(tag)}
                className={`px-2 py-1 rounded text-xs font-medium transition-opacity ${
                  isSelected ? 'opacity-100' : 'opacity-50 hover:opacity-100'
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

        {!isCreating ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="text-zinc-600"
          >
            + Create new tag
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8 text-sm"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              onClick={handleCreateTag}
              isLoading={isSubmitting}
              disabled={!newTagName.trim()}
            >
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCreating(false)
                setNewTagName('')
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
