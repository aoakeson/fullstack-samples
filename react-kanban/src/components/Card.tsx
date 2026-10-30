import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowRightIcon, MoreHorizontalIcon, Trash2Icon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { COLUMN_TITLES, COLUMNS, STATUS_STYLES, type ColumnId, type Item } from '@/types'

type Props = {
  item: Item
  column: ColumnId
  onMove: (id: string, to: ColumnId) => void
  onRemove: (id: string) => void
}

/** A draggable card. `useSortable` wires it into its column's SortableContext. */
export function Card({ item, column, onMove, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  // Keep a press on the menu from starting a drag (mouse, touch and pointer sensors).
  const stop = { onPointerDown: swallow, onMouseDown: swallow, onTouchStart: swallow, onKeyDown: swallow }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn('group relative', isDragging && 'opacity-40')}
      {...attributes}
      {...listeners}
    >
      <CardContent item={item} column={column} />

      <div className="absolute top-2 right-2" {...stop}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Options for ${item.title}`}
              className="text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100 [@media(hover:none)]:opacity-100"
            >
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            {COLUMNS.filter((c) => c !== column).map((to) => (
              <DropdownMenuItem key={to} onSelect={() => onMove(item.id, to)}>
                <ArrowRightIcon />
                Move to {COLUMN_TITLES[to]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => onRemove(item.id)}>
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

/** The visual card, shared with the drag overlay (the "ghost" that follows the pointer). */
export function CardContent({ item, column, dragging = false }: { item: Item; column: ColumnId; dragging?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border bg-card p-3 pr-10 shadow-xs',
        dragging && 'rotate-1 shadow-lg ring-1 ring-ring/40',
      )}
    >
      <Avatar size="lg" className={cn('ring-2 ring-offset-2 ring-offset-card', STATUS_STYLES[column].ring)}>
        <AvatarImage src={item.character.image} alt="" />
        <AvatarFallback>{item.character.name[0]}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="line-clamp-2 text-sm leading-snug font-semibold">{item.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.character.name}</p>
      </div>
    </div>
  )
}

function swallow(e: { stopPropagation: () => void }) {
  e.stopPropagation()
}
