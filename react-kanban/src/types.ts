/** A Rick and Morty character, as returned by the GraphQL API. */
export type Character = {
  id: string
  name: string
  image: string
  species: string
  status: string
}

export const COLUMNS = ['todo', 'doing', 'done'] as const
export type ColumnId = (typeof COLUMNS)[number]

export const COLUMN_TITLES: Record<ColumnId, string> = {
  todo: 'To Do',
  doing: 'Doing',
  done: 'Done',
}

/**
 * Status color per column (tokens in index.css). Written out in full so
 * Tailwind can see the class names at build time.
 */
export const STATUS_STYLES: Record<ColumnId, { ring: string; dot: string; text: string }> = {
  todo: { ring: 'ring-status-todo', dot: 'bg-status-todo', text: 'text-status-todo' },
  doing: { ring: 'ring-status-doing', dot: 'bg-status-doing', text: 'text-status-doing' },
  done: { ring: 'ring-status-done', dot: 'bg-status-done', text: 'text-status-done' },
}

/** One card on the board. Every item must have a character assigned. */
export type Item = {
  id: string
  title: string
  character: Character
}
