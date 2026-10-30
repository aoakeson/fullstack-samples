import { useEffect, useState } from 'react'
import { fetchCharacters } from '../api/rickAndMorty'
import type { Character } from '../types'

const DEBOUNCE_MS = 300

type Result = {
  forQuery: string | null // which search these results belong to (null = nothing loaded yet)
  characters: Character[]
  error: string | null
}

/**
 * Search characters by name. Waits until the user pauses typing, then fetches,
 * cancelling any request that's still in flight.
 */
export function useCharacters(query: string) {
  const [result, setResult] = useState<Result>({ forQuery: null, characters: [], error: null })

  useEffect(() => {
    const controller = new AbortController()

    const timer = setTimeout(async () => {
      try {
        const characters = await fetchCharacters(query.trim(), controller.signal)
        setResult({ forQuery: query, characters, error: null })
      } catch (err) {
        if (controller.signal.aborted) return // superseded by a newer search
        const error = err instanceof Error ? err.message : 'Something went wrong'
        setResult({ forQuery: query, characters: [], error })
      }
    }, DEBOUNCE_MS)

    // Cleanup runs when `query` changes or the component unmounts.
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  // We're loading whenever the results we have aren't for the current query.
  // Previous results stay visible meanwhile, so the list doesn't flash empty.
  return { characters: result.characters, error: result.error, loading: result.forQuery !== query }
}
