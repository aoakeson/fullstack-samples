import { useState, type FormEvent } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Character } from '@/types'
import { CharacterPicker } from './CharacterPicker'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (title: string, character: Character) => void
}

/** Create a task. Both a title and a character are required. */
export function NewTaskDialog({ open, onOpenChange, onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [character, setCharacter] = useState<Character | null>(null)

  const canSubmit = title.trim().length > 0 && character !== null

  function reset() {
    setTitle('')
    setCharacter(null)
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onAdd(title.trim(), character)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="contents">
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>Name it and pick who's on it.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Task</Label>
              <Input
                id="task-title"
                autoFocus
                placeholder="Fix the portal gun"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Assignee</Label>
              <CharacterPicker value={character} onChange={setCharacter} />
            </div>
          </div>

          <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              {character ? (
                <>
                  <Avatar size="sm">
                    <AvatarImage src={character.image} alt="" />
                    <AvatarFallback>{character.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{character.name}</span>
                </>
              ) : (
                'No one assigned yet'
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                Add task
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
