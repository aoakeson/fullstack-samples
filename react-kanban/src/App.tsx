import { useReducer } from 'react'
import { boardReducer, emptyBoard } from './board/boardReducer'
import { Board } from './components/Board'
import { NewItemForm } from './components/NewItemForm'

export default function App() {
  // All board state lives here, in one reducer, so both the form and the
  // board read from and write to the same source of truth.
  const [state, dispatch] = useReducer(boardReducer, emptyBoard)

  return (
    <main>
      <h1>Kanban</h1>
      <NewItemForm onAdd={(title, character) => dispatch({ type: 'add', title, character })} />
      <Board state={state} dispatch={dispatch} />
    </main>
  )
}
