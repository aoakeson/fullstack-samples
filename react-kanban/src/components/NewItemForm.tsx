import { useState, type FormEvent } from 'react'
import type { Character } from '../types'
import { CharacterPicker } from './CharacterPicker'

type Props = {
  onAdd: (title: string, character: Character) => void
}

/** Create a new card. Both a title and a character are required. */
export function NewItemForm({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [character, setCharacter] = useState<Character | null>(null)

  const canSubmit = title.trim().length > 0 && character !== null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onAdd(title.trim(), character)
    setTitle('')
    setCharacter(null)
  }

  return (
    <form className="new-item" onSubmit={handleSubmit}>
      <label>
        Task
        <input
          type="text"
          placeholder="What needs doing?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>

      <label>
        Assign a character
        <CharacterPicker value={character} onChange={setCharacter} />
      </label>

      <div className="new-item-footer">
        <span className="assignee">
          {character ? (
            <>
              <img src={character.image} alt="" width={24} height={24} /> {character.name}
            </>
          ) : (
            'No character selected'
          )}
        </span>
        <button type="submit" disabled={!canSubmit}>
          Add to To Do
        </button>
      </div>
    </form>
  )
}
