import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { COLUMN_TITLES, type ColumnId, type Item } from '../types'
import { Card } from './Card'

type Props = {
  id: ColumnId
  items: Item[]
  onRemove: (id: string) => void
}

export function Column({ id, items, onRemove }: Props) {
  // The column itself is a drop target too, so cards can be dropped into an empty column.
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <section className={`column${isOver ? ' over' : ''}`} aria-label={COLUMN_TITLES[id]}>
      <header>
        <h2>{COLUMN_TITLES[id]}</h2>
        <span className="count">{items.length}</span>
      </header>

      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="column-body">
          {items.map((item) => (
            <Card key={item.id} item={item} onRemove={onRemove} />
          ))}
          {items.length === 0 && <p className="empty">Drop cards here</p>}
        </div>
      </SortableContext>
    </section>
  )
}
