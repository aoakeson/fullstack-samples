# Portal — a React Kanban board

A frontend-only Kanban board (To Do / Doing / Done). Each task is assigned a Rick and Morty character from the [Rick and Morty GraphQL API](https://rickandmortyapi.com/graphql). Cards drag between columns and reorder within one; landing a card in Done fires confetti. Works on phones, remembers the board between visits, and has light and dark themes.

Built with React 19, TypeScript, Vite, Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com), [TanStack Query](https://tanstack.com/query) and [dnd-kit](https://dndkit.com).

## Run it

Requires Node 20+.

```bash
cd react-kanban
npm install
npm run dev        # http://localhost:5173
```

Other scripts: `npm test` (Vitest), `npm run typecheck`, `npm run lint`, `npm run build`.

## How it's put together

```
src/
  types.ts                    Character, Item, ColumnId, column titles and status colors
  api/rickAndMorty.ts         one fetch() call to the GraphQL endpoint
  hooks/useCharacters.ts      TanStack Query around that fetch (debounce, cache, cancel)
  hooks/useDebouncedValue.ts
  board/boardReducer.ts       all board state + the add / move / remove actions (unit-tested)
  board/storage.ts            load/save the board in localStorage
  lib/theme.ts, celebrate.ts  dark mode, confetti
  components/
    TopBar.tsx                app name, task summary, theme toggle, "New task"
    NewTaskDialog.tsx         Dialog: title + assignee; submit disabled until both are set
    CharacterPicker.tsx       Command (cmdk) search over the API results
    Board.tsx                 DndContext: sensors, drag handlers, drop-target resolution, overlay
    Column.tsx                droppable column with a SortableContext and an empty state
    Card.tsx                  sortable card: status-ringed avatar, title, menu (move / delete)
    ui/                       shadcn components (generated, lightly themed via tokens)
  App.tsx                     owns the reducer and the dialog; wires everything together
```

See [DESIGN.md](DESIGN.md) for the design system: tokens, type, spacing, layout rules and voice.

**State.** Two kinds, handled differently:
- *Server state* (characters) goes through TanStack Query. It gives us caching (re-typing a name is instant), request cancellation, and loading/error flags for free. `keepPreviousData` keeps the last results visible while a new search loads.
- *Board state* is local and small, so it lives in one `useReducer`: `{ items: Record<id, Item>, columns: Record<ColumnId, id[]> }`. Each column is an ordered array of ids, which makes "move to another column" and "reorder within a column" the same operation. The reducer is pure and unit-tested. A `useEffect` saves it to localStorage on every change.

There's no router: the app is a single view. TanStack Router would be the pick if one were needed (e.g. `/boards/:id`).

**Drag and drop** with dnd-kit:
- Each column is a `SortableContext` for reordering *and* a `useDroppable` target so cards can land in an empty column.
- `onDragOver` moves the card into the hovered column while dragging, so it visibly joins that column instead of jumping on release. `onDragEnd` sets the final index.
- A `DragOverlay` renders the card that follows the pointer; without it a card re-parented between columns flickers.
- Mouse drags start after 5px, touch drags after a 200ms press (so a swipe still scrolls), and the keyboard sensor makes it accessible. The card menu offers "Move to …" as a non-drag path.
- The column a drag started in is kept in a ref, so confetti fires only when a card *enters* Done.

**Mobile.** Below 768px the three columns become 85vw panels in a horizontal snap-scroll row; the next column peeks in from the edge. The card menu is always visible where there's no hover.

## Decisions and tradeoffs

- **shadcn over a component library package.** Components are copied into `src/components/ui/`, so they're ours to read and change, and the theme is just CSS variables in `index.css`.
- **Native scrolling in columns** instead of shadcn's `ScrollArea`, which wraps content in a `display: table` element and breaks the full-height empty state.
- **The character picker searches the first page (20) of results.** Paging would be the next step for the long tail of names.
- **Reducer tests only.** They cover the logic most likely to break (ordering, moving, removing). The UI was checked by hand on desktop and phone widths, in light and dark.
- **Persistence is a plain `useEffect`,** not a sync layer. Fine for one browser; a backend would replace `storage.ts` with TanStack Query mutations.

## Ideas for the pairing session

- Filter cards by character or search text
- Edit a card's title or reassign its character
- A WIP limit on Doing, or a "clear Done" action
- Component tests with Testing Library
- Pagination or infinite scroll in the character picker
