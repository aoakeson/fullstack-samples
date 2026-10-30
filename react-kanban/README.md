# React Kanban

A frontend-only Kanban board (To Do / Doing / Done). Each card is assigned a Rick and Morty character fetched from the [Rick and Morty GraphQL API](https://rickandmortyapi.com/graphql). Cards drag between columns and reorder within one; landing a card in Done fires confetti.

Built with React 19, TypeScript and Vite.

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
  types.ts                   Character, Item, ColumnId and column titles
  api/rickAndMorty.ts        one fetch() call to the GraphQL endpoint
  hooks/useCharacters.ts     debounced character search with cancellation
  board/boardReducer.ts      all board state + the add / move / remove actions
  board/boardReducer.test.ts
  components/
    NewItemForm.tsx          title + character; submit disabled until both are set
    CharacterPicker.tsx      search box + selectable results
    Board.tsx                DndContext: drag handlers, drop-target resolution, confetti
    Column.tsx               a droppable column with a SortableContext
    Card.tsx                 a sortable card (+ CardContent, reused by the drag overlay)
  App.tsx                    owns the reducer; wires form and board together
```

**State.** One `useReducer` in `App` holds `{ items: Record<id, Item>, columns: Record<ColumnId, id[]> }`. Keeping each column as an ordered array of ids makes "move to another column" and "reorder within a column" the same operation: take the id out of wherever it is, insert it at the target index. The reducer is pure, so it's unit-tested without rendering anything.

**Drag and drop** uses [dnd-kit](https://dndkit.com): accessible (keyboard works), small, and unopinionated about markup.
- Each column is a `SortableContext` for reordering *and* a `useDroppable` target so cards can be dropped into an empty column.
- `onDragOver` moves the card into the hovered column while dragging, so it visibly joins that column instead of jumping on release. `onDragEnd` sets the final index.
- A `DragOverlay` renders the card that follows the pointer. Without it, a card being re-parented between columns flickers.
- The column a drag started in is remembered in a ref, so confetti fires only when a card *enters* Done, not when it's reordered inside Done.

**Data fetching.** A single GraphQL query via `fetch`; a client library would be more than this app needs. `useCharacters` debounces typing (300 ms) and aborts the previous request when the query changes. "Loading" is derived (results don't match the current query) rather than stored, so previous results stay visible while new ones load.

## Decisions and tradeoffs

- **No persistence, no routing, no global store.** Not needed for the brief, and each is a natural thing to add together (see below).
- **Character picker is a search over the first page of results** (20 per request). Paging the API would be the next step for a long tail of names.
- **Reducer tests only.** They cover the logic most likely to break (ordering, moving, removing). Component tests would need jsdom and Testing Library; the UI was checked by hand in the browser.
- **Plain CSS with variables**, light and dark via `prefers-color-scheme`. No UI framework to keep the structure visible.

## Ideas for the pairing session

- Persist the board to `localStorage` (one `useEffect` on `state`, plus a lazy initial state)
- Filter cards by character or search text
- Edit a card's title or reassign its character
- A "clear Done" action, or a WIP limit on Doing
- Component tests with Testing Library
