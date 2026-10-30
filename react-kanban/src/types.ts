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

/** One card on the board. Every item must have a character assigned. */
export type Item = {
  id: string
  title: string
  character: Character
}
