# Session 1 — Rails data model

Providers (e.g. dietitians), their clients, the plan each client is on with each provider, and the journal entries clients post. Plus the four queries from the brief.

## Run it

Requires Ruby 3.4 (see `.ruby-version`). SQLite ships with the `sqlite3` gem, so no database server is needed.

```bash
cd rails-data-model
bundle install                     # install gems listed in Gemfile
bin/rails db:prepare               # create the database and run migrations
bin/rails db:seed                  # load sample data (db/seeds.rb)
bin/rails runner script/queries.rb # print the 4 queries and their SQL
bin/rails test                     # run the model tests
```

Use `bin/rails console` to explore interactively, e.g. `Provider.first.clients`.

`bin/ci` runs everything (setup, RuboCop, tests, seeds) in one go on macOS/Linux.

> **Windows notes:** `bin/ci` can't launch its steps on Windows, so run `bin/rubocop` and `bin/rails test` individually. `bin/rails db:drop` / `db:reset` can fail with "Permission denied" because SQLite holds the file open; to start over, delete `storage/*.sqlite3` and run `bin/rails db:prepare db:seed`.

## The data model

```
providers ──< subscriptions >── clients ──< journal_entries
              plan: basic | premium
```

| Table | Columns | Notes |
|---|---|---|
| `providers` | name, email | email unique |
| `clients` | name, email | email unique |
| `subscriptions` | provider_id, client_id, plan | one row per provider/client pair; unique on the pair |
| `journal_entries` | client_id, body, created_at | indexed on `(client_id, created_at)` |

**Why a `Subscription` model?** Providers have many clients and clients have many providers, so we need a join table. The plan belongs to the *pair* (Alice can be premium with Dana but basic with Nate), so the join table is where `plan` lives. Naming it after the domain concept, rather than `ProviderClient`, follows the Rails convention for `has_many :through` join models.

## The four queries

```ruby
provider.clients                       # 1. all clients for a provider
client.providers                       # 2. all providers for a client
client.journal_entries.newest_first    # 3. a client's entries, by date
provider.journal_entries.newest_first  # 4. entries across a provider's clients, by date
```

Each one is just an association declared in `app/models/*.rb`, plus one named scope (`JournalEntry.newest_first`). Query 4 is a nested `has_many :through`: provider → subscriptions → clients → journal_entries, which becomes two SQL JOINs. `script/queries.rb` prints the SQL for each.

## Where things live (a 2-minute Rails tour)

| Path | What it is |
|---|---|
| `db/migrate/` | **Migrations**: versioned changes to the database schema. Run with `bin/rails db:migrate`. |
| `db/schema.rb` | Auto-generated snapshot of the current schema. Never edit it by hand. |
| `app/models/` | **Models**: one Ruby class per table. Associations, validations and scopes. |
| `db/seeds.rb` | Sample data for development. |
| `script/queries.rb` | The four required queries, runnable with `bin/rails runner`. |
| `test/models/` | Model tests (Minitest, Rails' built-in test framework). |
| `test/fixtures/` | Sample rows loaded before each test, referenced by name, e.g. `providers(:dana)`. |

Everything else (`config/`, `bin/`, `app/controllers/`) is standard Rails scaffolding, unchanged.

## Design decisions & tradeoffs

- **Rules enforced in two places.** The database has `NOT NULL`, unique indexes and foreign keys, so bad data can't get in even through a race or a raw SQL insert. The models repeat the rules as validations so users get readable error messages.
- **Plan as a string enum** (`"basic"`/`"premium"`) instead of Rails' default integer enum. The raw data reads clearly and adding a plan doesn't depend on number ordering. The cost is slightly more storage. `validate: true` makes a bad plan a normal validation error instead of an exception.
- **Emails normalized** (`strip` + `downcase`) before saving, so uniqueness is effectively case-insensitive.
- **Indexes match the queries.** `subscriptions(provider_id, client_id)` (unique) serves query 1 and the uniqueness rule; `subscriptions(client_id)` serves query 2; `journal_entries(client_id, created_at)` serves queries 3 and 4 and their sort. Redundant single-column indexes are left out.
- **Stable sort.** `newest_first` orders by `created_at DESC, id DESC`, so entries with the same timestamp always come back in the same order.
- **Sorted by `created_at`.** The brief says "sorted by date"; if clients need to backdate entries ("what I ate yesterday"), we'd add an explicit `entry_date`/`occurred_at` column and index that instead.
- **Deletes cascade in Ruby** (`dependent: :destroy`). Deleting a client removes their subscriptions and entries. For health data we'd likely want soft deletes / retention rules instead.

## If the dataset were very large

- **Paginate** queries 3 and 4 with keyset (cursor) pagination, e.g. `where("created_at < ?", cursor).limit(50)`, rather than `OFFSET`, which gets slower the deeper you page.
- **Query 4 is the expensive one**: a provider with thousands of clients means a big join, then a sort. Options, simplest first:
  1. Keep the join with the composite index and paginate (often enough).
  2. Denormalize: a `provider_journal_entries` "feed" table written when an entry is posted (fan-out on write), so the read is a single indexed range scan. That costs extra writes and storage, and the feed has to be updated when subscriptions change.
- **Postgres in production** (SQLite here for zero setup), with partitioning of `journal_entries` by time once the table gets huge.
- **Counter caches** (e.g. `clients_count` on providers) if we need counts on list pages.
- **Avoid N+1s** with `includes`, as shown in `script/queries.rb`.

## Not built (on purpose)

No controllers, routes or JSON API: the brief asks for the data model and queries, and an endpoint is a natural thing to add together. No authentication, no extra gems (factories, RSpec, etc.).

## Ideas for the pairing session

- A validation, e.g. limit journal entry length, or a provider can't have more than N premium clients
- A query, e.g. "premium clients of a provider" (`provider.clients.merge(Subscription.premium)`) or "entries from the last 7 days"
- A model extension, e.g. an explicit `entry_date`, provider types (dietitian, coach), or soft-deleting entries
