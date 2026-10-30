import { describe, expect, it } from 'vitest'
import type { Character } from '../types'
import { boardReducer, emptyBoard, findColumn, type BoardState } from './boardReducer'

const rick: Character = { id: '1', name: 'Rick Sanchez', image: '', species: 'Human', status: 'Alive' }

/** Build a board with items a, b, c in To Do. */
function boardWith(...titles: string[]): BoardState {
  return titles.reduce((state, title) => boardReducer(state, { type: 'add', title, character: rick }), emptyBoard)
}
const ids = (state: BoardState, col: 'todo' | 'doing' | 'done') => state.columns[col].map((id) => state.items[id].title)

describe('boardReducer', () => {
  it('adds new items to the end of To Do with the chosen character', () => {
    const state = boardWith('a', 'b')
    expect(ids(state, 'todo')).toEqual(['a', 'b'])
    expect(Object.values(state.items)[0].character).toBe(rick)
  })

  it('moves an item to another column at the given index', () => {
    let state = boardWith('a', 'b', 'c')
    const [a, b] = state.columns.todo
    state = boardReducer(state, { type: 'move', id: a, to: 'done', index: 0 })
    state = boardReducer(state, { type: 'move', id: b, to: 'done', index: 0 })

    expect(ids(state, 'todo')).toEqual(['c'])
    expect(ids(state, 'done')).toEqual(['b', 'a'])
    expect(findColumn(state, a)).toBe('done')
  })

  it('reorders within a column', () => {
    let state = boardWith('a', 'b', 'c')
    const [a] = state.columns.todo
    state = boardReducer(state, { type: 'move', id: a, to: 'todo', index: 2 })
    expect(ids(state, 'todo')).toEqual(['b', 'c', 'a'])
  })

  it('returns the same state when nothing changes', () => {
    const state = boardWith('a')
    const [a] = state.columns.todo
    expect(boardReducer(state, { type: 'move', id: a, to: 'todo', index: 0 })).toBe(state)
    expect(boardReducer(state, { type: 'move', id: 'missing', to: 'done', index: 0 })).toBe(state)
  })

  it('removes an item from both the column and the items map', () => {
    let state = boardWith('a', 'b')
    const [a] = state.columns.todo
    state = boardReducer(state, { type: 'remove', id: a })
    expect(ids(state, 'todo')).toEqual(['b'])
    expect(state.items[a]).toBeUndefined()
  })
})
