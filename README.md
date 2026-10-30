# Full-stack samples

Two small, self-contained projects, each with its own README.

| Project | Folder | Status |
|---|---|---|
| Rails data model: providers, clients, plans and journal entries | [`rails-data-model/`](rails-data-model/README.md) | Done: schema, models, 4 queries, seeds, tests |
| React + TypeScript Kanban board | `react-kanban/` | In progress |

## Quick start: Rails

```bash
cd rails-data-model
bundle install
bin/rails db:prepare db:seed
bin/rails runner script/queries.rb   # prints the 4 queries + SQL
bin/rails test
```

See [`rails-data-model/README.md`](rails-data-model/README.md) for the schema, design tradeoffs and scaling notes.
