import { CheckIcon } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useCharacters } from '@/hooks/useCharacters'
import { cn } from '@/lib/utils'
import type { Character } from '@/types'

type Props = {
  value: Character | null
  onChange: (character: Character) => void
}

/** Search the Rick and Morty API and pick one character. */
export function CharacterPicker({ value, onChange }: Props) {
  const [search, setSearch] = useState('')
  const { data: characters = [], isPending, isError, isFetching } = useCharacters(search)

  return (
    // The API already filters by name, so cmdk's own filtering is turned off.
    <Command shouldFilter={false} className="rounded-lg border bg-card">
      <CommandInput placeholder="Search characters" value={search} onValueChange={setSearch} />

      <CommandList
        className={cn('max-h-52 transition-opacity', isFetching && 'opacity-60')}
        aria-busy={isFetching}
      >
        {isError && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Couldn't reach the character list. Check your connection and try again.
          </p>
        )}
        {!isError && isPending && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading characters…</p>
        )}
        {!isError && !isPending && <CommandEmpty>No characters match “{search.trim()}”.</CommandEmpty>}

        <CommandGroup>
          {characters.map((character) => {
            const selected = value?.id === character.id
            return (
              <CommandItem
                key={character.id}
                value={character.id}
                onSelect={() => onChange(character)}
                className="gap-3"
                aria-selected={selected}
              >
                <Avatar size="sm">
                  <AvatarImage src={character.image} alt="" />
                  <AvatarFallback>{character.name[0]}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate font-medium">{character.name}</span>
                <span className="text-xs text-muted-foreground">{character.species}</span>
                {selected && <CheckIcon className="size-4 text-primary" />}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
