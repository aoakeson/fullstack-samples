# Full-stack samples

Two small, self-contained projects, each with its own README.

| Project | Folder | Stack |
|---|---|---|
| Data model: providers, clients, plans and journal entries | [`rails-data-model/`](rails-data-model/README.md) | Ruby on Rails 8, SQLite, Minitest |
| Kanban board with Rick and Morty characters | [`react-kanban/`](react-kanban/README.md) | React 19, TypeScript, Vite, dnd-kit, Vitest |

## Quick start

**Rails** (needs Ruby 3.4)

```bash
cd rails-data-model
bundle install
bin/rails db:prepare db:seed
bin/rails runner script/queries.rb   # prints the 4 queries + their SQL
bin/rails test
```

**React** (needs Node 20+)

```bash
cd react-kanban
npm install
npm run dev                           # http://localhost:5173
npm test
```

Each README covers the design, the tradeoffs, and what could be built next.
