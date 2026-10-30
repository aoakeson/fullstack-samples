import { useState } from 'react'
import { useCharacters } from '../hooks/useCharacters'
import type { Character } from '../types'

type Props = {
  value: Character | null
  onChange: (character: Character) => void
}

/** Search the Rick and Morty API and pick one character. */
export function CharacterPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState('')
  const { characters, loading, error } = useCharacters(query)

  return (
    <div className="picker">
      <input
        type="search"
        placeholder="Search characters…"
        aria-label="Search characters"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="picker-results" role="listbox" aria-label="Characters">
        {error && <p className="picker-status error">Couldn't load characters: {error}</p>}
        {!error && loading && characters.length === 0 && <p className="picker-status">Loading…</p>}
        {!error && !loading && characters.length === 0 && <p className="picker-status">No matches</p>}

        {characters.map((character) => {
          const selected = value?.id === character.id
          return (
            <button
              key={character.id}
              type="button"
              role="option"
              aria-selected={selected}
              className={`picker-option${selected ? ' selected' : ''}`}
              onClick={() => onChange(character)}
            >
              <img src={character.image} alt="" width={32} height={32} />
              <span>
                {character.name}
                <small>
                  {character.species} · {character.status}
                </small>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
