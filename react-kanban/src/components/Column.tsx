import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { PlusIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { COLUMN_TITLES, STATUS_STYLES, type ColumnId, type Item } from '@/types'
import { Card } from './Card'

type Props = {
  id: ColumnId
  items: Item[]
  onMove: (id: string, to: ColumnId) => void
  onRemove: (id: string) => void
  onAddTask?: () => void
}

export function Column({ id, items, onMove, onRemove, onAddTask }: Props) {
  // The column body is a drop target too, so cards can land in an empty column.
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <section
      aria-label={COLUMN_TITLES[id]}
      className={cn(
        // Mobile: one column per screen in a snap-scroll row. Desktop: equal grid columns.
        'flex min-h-0 w-[85vw] shrink-0 snap-center flex-col rounded-xl bg-muted/70 md:w-auto',
        'ring-primary/40 transition-shadow',
        isOver && 'ring-2',
      )}
    >
      <header className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span className={cn('size-2 rounded-full', STATUS_STYLES[id].dot)} aria-hidden />
        <h2 className="text-sm font-semibold">{COLUMN_TITLES[id]}</h2>
        <Badge variant="secondary" className="ml-auto bg-card tabular-nums">
          {items.length}
        </Badge>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="flex min-h-full flex-col gap-2 px-2 pb-2">
            {items.map((item) => (
              <Card key={item.id} item={item} column={id} onMove={onMove} onRemove={onRemove} />
            ))}
            {items.length === 0 && (
              <div className="grid flex-1 place-items-center rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Nothing here yet.
                  <br />
                  {onAddTask ? 'Add a task or drag one over.' : 'Drag a card here.'}
                </p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>

      {onAddTask && (
        <Button variant="ghost" onClick={onAddTask} className="m-2 justify-start text-muted-foreground">
          <PlusIcon data-icon="inline-start" />
          Add task
        </Button>
      )}
    </section>
  )
}
