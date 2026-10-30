import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  closestCenter,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useCallback, useRef, useState, type Dispatch } from 'react'
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
  // The last valid drop target. Dropping in a gap between columns reuses it
  // instead of snapping the card back.
  const lastOverId = useRef<UniqueIdentifier | null>(null)

  const sensors = useSensors(
    // Mouse: a 5px threshold keeps plain clicks from starting a drag.
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // Touch: a short press to drag, so a normal swipe still scrolls the board.
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  /**
   * Two-step collision detection (the pattern from dnd-kit's multi-container example):
   * 1. Find the column under the pointer. Columns are droppables, so this is a
   *    plain hit test, with a rect-overlap fallback when the pointer is off the edge.
   * 2. Inside that column, pick the card closest to the dragged card's center,
   *    or the column itself when it's empty.
   * Deciding by column first stops the big column rect from fighting with the
   * small card rects, which is what made the card jump around.
   */
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const pointerHits = pointerWithin(args)
      const hits = pointerHits.length > 0 ? pointerHits : rectIntersection(args)
      let overId = getFirstCollision(hits, 'id')

      if (overId == null) {
        return lastOverId.current ? [{ id: lastOverId.current }] : []
      }

      if (isColumnId(overId)) {
        const cardIds = state.columns[overId]
        if (cardIds.length > 0) {
          const closestCard = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter((c) => cardIds.includes(String(c.id))),
          })
          overId = getFirstCollision(closestCard, 'id') ?? overId
        }
      }

      lastOverId.current = overId
      return [{ id: overId }]
    },
    [state.columns],
  )

  function handleDragStart({ active }: DragStartEvent) {
    const id = String(active.id)
    setActiveId(id)
    startColumn.current = findColumn(state, id) ?? null
    lastOverId.current = null
  }

  // Fires while dragging. Moving the card into the hovered column right away
  // makes it visibly join that column instead of jumping on release.
  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const id = String(active.id)
    const overId = String(over.id)
    const from = findColumn(state, id)
    const to = isColumnId(overId) ? overId : findColumn(state, overId)
    if (!from || !to || from === to) return

    // Over an empty column: go to the end. Over a card: slot in above or below it,
    // depending on whether the dragged card's center is past the card's midpoint.
    let index = state.columns[to].length
    if (!isColumnId(overId)) {
      const overIndex = state.columns[to].indexOf(overId)
      const dragged = active.rect.current.translated
      const isBelow = dragged ? dragged.top + dragged.height / 2 > over.rect.top + over.rect.height / 2 : false
      index = overIndex + (isBelow ? 1 : 0)
    }
    dispatch({ type: 'move', id, to, index })
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    const id = String(active.id)
    const from = findColumn(state, id)

    if (over && from) {
      const overId = String(over.id)
      // By now the card is already in the right column (handleDragOver did that);
      // all that's left is its final position within it.
      const to = isColumnId(overId) ? overId : (findColumn(state, overId) ?? from)
      const index = isColumnId(overId) ? state.columns[to].length : state.columns[to].indexOf(overId)
      dispatch({ type: 'move', id, to, index })
    }

    const endColumn = findColumn(state, id)
    if (endColumn === 'done' && startColumn.current !== 'done') celebrate()
  }

  /** Move via the card menu: append to the target column. */
  function moveToColumn(id: string, to: ColumnId) {
    const from = findColumn(state, id)
    dispatch({ type: 'move', id, to, index: state.columns[to].length })
    if (to === 'done' && from !== 'done') celebrate()
  }

  const activeItem = activeId ? state.items[activeId] : null
  const activeColumn = activeId ? findColumn(state, activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      // Re-measure drop zones during the drag: cards change columns mid-drag,
      // so positions measured at drag start would be stale.
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
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
            onMove={moveToColumn}
            onRemove={(id) => dispatch({ type: 'remove', id })}
            onAddTask={columnId === 'todo' ? onAddTask : undefined}
          />
        ))}
      </div>

      {/* The card that follows the pointer. Rendering it here, outside any column,
          avoids a flicker when a card is re-parented from one column to another. */}
      <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}>
        {activeItem && activeColumn && <CardContent item={activeItem} column={activeColumn} dragging />}
      </DragOverlay>
    </DndContext>
  )
}

function isColumnId(id: UniqueIdentifier): id is ColumnId {
  return (COLUMNS as readonly string[]).includes(String(id))
}
