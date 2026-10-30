import { arrayMove } from '@dnd-kit/sortable'
import type { Character, ColumnId, Item } from '../types'

/**
 * Board state: items by id, plus each column's ordered list of item ids.
 * Keeping order as an array per column makes "move" and "reorder" the same
 * operation: remove the id from wherever it is, insert it at the target index.
 */
export type BoardState = {
  items: Record<string, Item>
  columns: Record<ColumnId, string[]>
}

export type BoardAction =
  | { type: 'add'; title: string; character: Character }
  | { type: 'move'; id: string; to: ColumnId; index: number }
  | { type: 'remove'; id: string }

export const emptyBoard: BoardState = {
  items: {},
  columns: { todo: [], doing: [], done: [] },
}

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'add': {
      const item: Item = { id: crypto.randomUUID(), title: action.title, character: action.character }
      return {
        items: { ...state.items, [item.id]: item },
        columns: { ...state.columns, todo: [...state.columns.todo, item.id] },
      }
    }

    case 'move': {
      const from = findColumn(state, action.id)
      if (!from) return state

      if (from === action.to) {
        const fromIndex = state.columns[from].indexOf(action.id)
        if (fromIndex === action.index) return state
        return {
          ...state,
          columns: { ...state.columns, [from]: arrayMove(state.columns[from], fromIndex, action.index) },
        }
      }

      const target = [...state.columns[action.to]]
      target.splice(action.index, 0, action.id)
      return {
        ...state,
        columns: {
          ...state.columns,
          [from]: state.columns[from].filter((id) => id !== action.id),
          [action.to]: target,
        },
      }
    }

    case 'remove': {
      const from = findColumn(state, action.id)
      if (!from) return state
      const { [action.id]: _removed, ...items } = state.items
      return {
        items,
        columns: { ...state.columns, [from]: state.columns[from].filter((id) => id !== action.id) },
      }
    }
  }
}

/** Which column holds this item? */
export function findColumn(state: BoardState, itemId: string): ColumnId | undefined {
  return (Object.keys(state.columns) as ColumnId[]).find((col) => state.columns[col].includes(itemId))
}
