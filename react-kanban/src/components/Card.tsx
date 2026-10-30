import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Item } from '../types'

type Props = {
  item: Item
  onRemove?: (id: string) => void
}

/** A draggable card. `useSortable` wires it into its column's SortableContext. */
export function Card({ item, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  return (
    <div
      ref={setNodeRef}
      className={`card${isDragging ? ' dragging' : ''}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <CardContent item={item} />
      {onRemove && (
        <button
          type="button"
          className="card-remove"
          aria-label={`Remove ${item.title}`}
          // Stop the press from starting a drag.
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onRemove(item.id)}
        >
          ×
        </button>
      )}
    </div>
  )
}

/** The visual part of a card, shared with the drag overlay (the "ghost" that follows the pointer). */
export function CardContent({ item }: { item: Item }) {
  return (
    <>
      <img src={item.character.image} alt="" width={36} height={36} />
      <span>
        {item.title}
        <small>{item.character.name}</small>
      </span>
    </>
  )
}
