import type { Character } from '../types'

const ENDPOINT = 'https://rickandmortyapi.com/graphql'

// One query is all we need, so a plain `fetch` keeps things simple
// (no Apollo / urql client to configure).
const CHARACTERS_QUERY = `
  query Characters($name: String) {
    characters(page: 1, filter: { name: $name }) {
      results { id name image species status }
    }
  }
`

type CharactersResponse = {
  data?: { characters: { results: Character[] } | null }
  errors?: { message: string }[]
}

/**
 * Fetch the first page (20) of characters whose name matches `name`.
 * An empty name returns the first 20 characters overall.
 * Pass an AbortSignal so a stale request can be cancelled when the user keeps typing.
 */
export async function fetchCharacters(name: string, signal?: AbortSignal): Promise<Character[]> {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: CHARACTERS_QUERY, variables: { name } }),
    signal,
  })
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)

  const json: CharactersResponse = await response.json()
  // The API reports "no matches" as a GraphQL error rather than an empty list.
  if (json.errors?.length && !json.data?.characters) return []

  return json.data?.characters?.results ?? []
}
