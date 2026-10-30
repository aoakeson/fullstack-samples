import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchCharacters } from '@/api/rickAndMorty'
import { useDebouncedValue } from './useDebouncedValue'

/**
 * Search characters by name.
 *
 * TanStack Query handles caching (typing "rick", then "ric", then "rick" again
 * hits the cache), request cancellation via the signal it passes in, and the
 * loading/error states. `keepPreviousData` keeps the last results on screen
 * while a new search is in flight, so the list never flashes empty.
 */
export function useCharacters(search: string) {
  const name = useDebouncedValue(search.trim(), 300)

  return useQuery({
    queryKey: ['characters', name],
    queryFn: ({ signal }) => fetchCharacters(name, signal),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // character data doesn't change; don't refetch for 5 minutes
  })
}
