import { useEffect, useReducer, useState } from 'react'
import { boardReducer } from './board/boardReducer'
import { loadBoard, saveBoard } from './board/storage'
import { Board } from './components/Board'
import { NewTaskDialog } from './components/NewTaskDialog'
import { TopBar } from './components/TopBar'

export default function App() {
  // All board state lives in one reducer; the dialog and the board both talk to it.
  // The third argument lazily reads the saved board once, on first render.
  const [state, dispatch] = useReducer(boardReducer, undefined, loadBoard)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => saveBoard(state), [state])

  const taskCount = Object.keys(state.items).length

  return (
    <div className="flex h-dvh flex-col">
      <TopBar taskCount={taskCount} doneCount={state.columns.done.length} onNewTask={() => setDialogOpen(true)} />

      <main className="min-h-0 flex-1 pt-3 md:pt-4">
        <Board state={state} dispatch={dispatch} onAddTask={() => setDialogOpen(true)} />
      </main>

      <NewTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={(title, character) => dispatch({ type: 'add', title, character })}
      />
    </div>
  )
}
