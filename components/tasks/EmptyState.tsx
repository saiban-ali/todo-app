interface EmptyStateProps {
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ message = 'No tasks yet', action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center">
        <svg
          className="h-8 w-8 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <p className="text-sm text-zinc-600 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-medium text-zinc-900 hover:underline"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
