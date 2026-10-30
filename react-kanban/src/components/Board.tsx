import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type Over,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import confetti from 'canvas-confetti'
import { useRef, useState, type Dispatch } from 'react'
import { findColumn, type BoardAction, type BoardState } from '../board/boardReducer'
import { COLUMNS, type ColumnId } from '../types'
import { CardContent } from './Card'
import { Column } from './Column'

type Props = {
  state: BoardState
  dispatch: Dispatch<BoardAction>
}

export function Board({ state, dispatch }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  // Remember where the drag started so we can tell "moved into Done" from "reordered within Done".
  const startColumn = useRef<ColumnId | null>(null)

  const sensors = useSensors(
    // A 5px threshold keeps plain clicks (e.g. the remove button) from starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  /** Translate whatever we're hovering (a card or an empty column) into a column + index. */
  function dropTarget(over: Over): { column: ColumnId; index: number } | null {
    const overId = String(over.id)
    if (isColumnId(overId)) return { column: overId, index: state.columns[overId].length }

    const column = findColumn(state, overId)
    return column ? { column, index: state.columns[column].indexOf(overId) } : null
  }

  function handleDragStart({ active }: DragStartEvent) {
    const id = String(active.id)
    setActiveId(id)
    startColumn.current = findColumn(state, id) ?? null
  }

  // Fires while dragging. Moving the card into the hovered column right away
  // makes it visibly "join" that column instead of jumping on drop.
  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const id = String(active.id)
    const target = dropTarget(over)
    if (target && target.column !== findColumn(state, id)) {
      dispatch({ type: 'move', id, to: target.column, ...target })
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    const id = String(active.id)
    const target = over ? dropTarget(over) : null
    if (target) dispatch({ type: 'move', id, to: target.column, index: target.index })

    const endColumn = target?.column ?? findColumn(state, id)
    if (endColumn === 'done' && startColumn.current !== 'done') celebrate()
  }

  const activeItem = activeId ? state.items[activeId] : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="board">
        {COLUMNS.map((columnId) => (
          <Column
            key={columnId}
            id={columnId}
            items={state.columns[columnId].map((id) => state.items[id])}
            onRemove={(id) => dispatch({ type: 'remove', id })}
          />
        ))}
      </div>

      {/* The card that follows the pointer. Rendering it here, outside any column,
          avoids a flicker when a card is re-parented from one column to another. */}
      <DragOverlay>{activeItem && <div className="card overlay"><CardContent item={activeItem} /></div>}</DragOverlay>
    </DndContext>
  )
}

function isColumnId(id: string): id is ColumnId {
  return (COLUMNS as readonly string[]).includes(id)
}

function celebrate() {
  confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } })
}
