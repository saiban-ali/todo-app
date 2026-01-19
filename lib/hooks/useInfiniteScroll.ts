import { useEffect, useCallback, RefObject } from 'react'

interface UseInfiniteScrollOptions {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  threshold?: number
}

export function useInfiniteScroll(
  scrollRef: RefObject<HTMLElement | null>,
  options: UseInfiniteScrollOptions
) {
  const { onLoadMore, hasMore, isLoading, threshold = 200 } = options

  const handleScroll = useCallback(() => {
    const element = scrollRef.current
    if (!element || isLoading || !hasMore) return

    const { scrollTop, scrollHeight, clientHeight } = element
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight)

    if (distanceFromBottom < threshold) {
      onLoadMore()
    }
  }, [scrollRef, onLoadMore, hasMore, isLoading, threshold])

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    element.addEventListener('scroll', handleScroll)
    return () => element.removeEventListener('scroll', handleScroll)
  }, [scrollRef, handleScroll])

  return { handleScroll }
}
