# Design system

A small, opinionated system for the Kanban app. Tokens live in `src/index.css`; components come from [shadcn/ui](https://ui.shadcn.com) (Radix primitives, Tailwind v4) and live in `src/components/ui/`.

## Idea

Every task is "assigned" to a Rick and Morty character, so the **character portrait is the hero of each card**: a large round avatar with a thin ring in the task's status color. Everything around it stays quiet, so the board reads as a row of faces that change color as work moves right.

## Color

Defined in oklch so light and dark stay perceptually matched.

| Token | Light | Dark | Role |
|---|---|---|---|
| `background` | cool near-white `oklch(0.975 0.003 240)` | ink `oklch(0.18 0.008 250)` | page |
| `card` | white | `oklch(0.23 0.01 250)` | cards, dialogs |
| `foreground` | `oklch(0.21 0.012 250)` | `oklch(0.95 0.005 240)` | text |
| `muted` / `muted-foreground` | `0.945` / `0.52` | `0.28` / `0.70` | column panels, secondary text |
| `primary` | teal `oklch(0.51 0.09 185)` | `oklch(0.74 0.1 180)` | the one accent: buttons, focus, "Done" |
| `status-todo` | slate `oklch(0.56 0.03 255)` | `0.70` | To Do ring and count |
| `status-doing` | amber `oklch(0.68 0.16 65)` | `0.80` | Doing ring and count |
| `status-done` | = `primary` | = `primary` | Done ring and count |

Rules: one accent. Status colors appear only on avatar rings, column counts and the column header dot, never as backgrounds. `destructive` is reserved for delete.

## Type

One family, [Manrope](https://fonts.google.com/specimen/Manrope) (variable), with system-ui fallback.

| Use | Size / weight |
|---|---|
| App name | 15px / 700 |
| Column title | 14px / 600 |
| Card title | 14px / 600, up to 2 lines |
| Card meta, counts, helper text | 12px / 500, `muted-foreground` |
| Dialog title | 18px / 600 |

Sentence case everywhere. No all-caps labels, no letter-spacing tricks.

## Space and shape

- 4px grid. Card padding 12px, column padding 8px, gaps 8px between cards and 16px between columns.
- `--radius: 0.75rem`. Cards and inputs use `radius-lg` (12px), the dialog `radius-xl`, avatars are circles.
- Columns are flat `muted` panels with no border; cards are `card` with a 1px `border` and a faint shadow. Elevation is reserved for the card being dragged.

## Layout

```
┌──────────────────────────────────────────────┐
│ ◉ Board            3 tasks · 1 done   [+ New] │  top bar, 56px, sticky
├──────────────┬───────────────┬───────────────┤
│ ● To Do   2  │ ● Doing    1  │ ● Done     1  │  column headers
│ ┌──────────┐ │ ┌───────────┐ │ ┌───────────┐ │
│ │ (◯) Title│ │ │ (◯) Title │ │ │ (◯) Title │ │  cards, each column scrolls
│ └──────────┘ │ └───────────┘ │ └───────────┘ │
│  + Add task  │               │               │
└──────────────┴───────────────┴───────────────┘
```

- ≥ 768px: three equal columns fill the viewport height; each column body scrolls independently.
- < 768px: columns become 85vw panels in a horizontal snap-scroll row, one column per screen; the next column peeks in from the edge, which is the cue to swipe. Cards stay the same component, and long-press starts a drag so a normal swipe still scrolls.
- Left aligned throughout; the top bar is the only place with right-aligned content.

## Motion

Only in response to user action: cards settle into place with dnd-kit's default 200ms transition, the dialog uses shadcn's enter/exit, and confetti fires once when a card enters Done. `prefers-reduced-motion` turns transitions off.

## Components (shadcn)

| Component | Where |
|---|---|
| `Button` | top bar "New task", column "Add task", dialog actions |
| `Dialog` | creating a task |
| `Input`, `Label` | task title |
| `Command` | character search and selection (cmdk) |
| `Avatar` | character portraits |
| `Badge` | column counts |
| `DropdownMenu` | card menu: move to column, delete (also the non-drag path on touch) |

Column bodies use native `overflow-y: auto` rather than shadcn's `ScrollArea`: Radix wraps the viewport's children in a `display: table` element, which stops the empty state from filling the column.

## Voice

Plain verbs, sentence case. Buttons say what happens: "Add task", "Delete". Empty columns invite action ("Nothing here yet. Drag a card over or add a task."). Errors say what went wrong and what to do.
