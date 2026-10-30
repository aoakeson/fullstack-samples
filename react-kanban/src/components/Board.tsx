import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type Over,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useRef, useState, type Dispatch } from 'react'
import { findColumn, type BoardAction, type BoardState } from '@/board/boardReducer'
import { celebrate } from '@/lib/celebrate'
import { COLUMNS, type ColumnId } from '@/types'
import { CardContent } from './Card'
import { Column } from './Column'

type Props = {
  state: BoardState
  dispatch: Dispatch<BoardAction>
  onAddTask: () => void
}

export function Board({ state, dispatch, onAddTask }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  // Where the drag started, so we can tell "moved into Done" from "reordered within Done".
  const startColumn = useRef<ColumnId | null>(null)

  const sensors = useSensors(
    // Mouse: a 5px threshold keeps plain clicks from starting a drag.
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // Touch: long-press to drag, so a normal swipe still scrolls the board.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  /** Translate whatever we're hovering (a card or an empty column) into a column + index. */
  function dropTarget(over: Over): { column: ColumnId; index: number } | null {
    const overId = String(over.id)
    if (isColumnId(overId)) return { column: overId, index: state.columns[overId].length }

    const column = findColumn(state, overId)
    return column ? { column, index: state.columns[column].indexOf(overId) } : null
  }

  function move(id: string, to: ColumnId, index: number) {
    const from = findColumn(state, id)
    dispatch({ type: 'move', id, to, index })
    if (to === 'done' && from !== 'done') celebrate()
  }

  function handleDragStart({ active }: DragStartEvent) {
    const id = String(active.id)
    setActiveId(id)
    startColumn.current = findColumn(state, id) ?? null
  }

  // Fires while dragging. Moving the card into the hovered column right away
  // makes it visibly join that column instead of jumping on release.
  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const id = String(active.id)
    const target = dropTarget(over)
    if (target && target.column !== findColumn(state, id)) {
      dispatch({ type: 'move', id, to: target.column, index: target.index })
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
  const activeColumn = activeId ? findColumn(state, activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex h-full snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-3 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-4 md:pb-4">
        {COLUMNS.map((columnId) => (
          <Column
            key={columnId}
            id={columnId}
            items={state.columns[columnId].map((id) => state.items[id])}
            onMove={(id, to) => move(id, to, state.columns[to].length)}
            onRemove={(id) => dispatch({ type: 'remove', id })}
            onAddTask={columnId === 'todo' ? onAddTask : undefined}
          />
        ))}
      </div>

      {/* The card that follows the pointer. Rendering it here, outside any column,
          avoids a flicker when a card is re-parented from one column to another. */}
      <DragOverlay dropAnimation={{ duration: 180 }}>
        {activeItem && activeColumn && <CardContent item={activeItem} column={activeColumn} dragging />}
      </DragOverlay>
    </DndContext>
  )
}

function isColumnId(id: string): id is ColumnId {
  return (COLUMNS as readonly string[]).includes(id)
}
