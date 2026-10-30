import { PlusIcon, SquareKanbanIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'

type Props = {
  taskCount: number
  doneCount: number
  onNewTask: () => void
}

export function TopBar({ taskCount, doneCount, onNewTask }: Props) {
  const summary =
    taskCount === 0 ? 'No tasks yet' : `${taskCount} ${taskCount === 1 ? 'task' : 'tasks'}, ${doneCount} done`

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-3 md:px-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <SquareKanbanIcon className="size-4.5" aria-hidden />
        </span>
        <div className="leading-tight">
          <h1 className="text-[15px] font-bold">Portal</h1>
          <p className="text-xs text-muted-foreground">{summary}</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <Button onClick={onNewTask}>
          <PlusIcon data-icon="inline-start" />
          New task
        </Button>
      </div>
    </header>
  )
}
