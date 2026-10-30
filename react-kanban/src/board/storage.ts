import { emptyBoard, type BoardState } from './boardReducer'

const KEY = 'kanban-board'

/** Read the saved board, or start empty if there isn't one (or it can't be read). */
export function loadBoard(): BoardState {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as BoardState) : emptyBoard
  } catch {
    return emptyBoard
  }
}

export function saveBoard(state: BoardState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage can be unavailable (private mode, quota). The board still works in memory.
  }
}
