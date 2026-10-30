# Sample data for local development. Load it with: bin/rails db:seed
#
# `find_or_create_by!` looks for a matching row and creates it only if missing,
# so running this file twice won't create duplicates. The `!` raises an error
# if a validation fails, instead of silently doing nothing.

# --- Providers ---
dana  = Provider.find_or_create_by!(email: "dana@wellness.example")  { |p| p.name = "Dana Dietitian" }
nate  = Provider.find_or_create_by!(email: "nate@wellness.example")  { |p| p.name = "Nate Nutritionist" }

# --- Clients ---
alice = Client.find_or_create_by!(email: "alice@example.test") { |c| c.name = "Alice" }
bob   = Client.find_or_create_by!(email: "bob@example.test")   { |c| c.name = "Bob" }
cara  = Client.find_or_create_by!(email: "cara@example.test")  { |c| c.name = "Cara" }

# --- Subscriptions: who sees whom, and on which plan ---
# Alice sees both providers, on a different plan with each.
Subscription.find_or_create_by!(provider: dana, client: alice) { |s| s.plan = :premium }
Subscription.find_or_create_by!(provider: nate, client: alice) { |s| s.plan = :basic }
Subscription.find_or_create_by!(provider: dana, client: bob)   { |s| s.plan = :basic }
Subscription.find_or_create_by!(provider: nate, client: cara)  { |s| s.plan = :premium }

# --- Journal entries ---
# `created_at` is set explicitly so the entries span several days and the
# "sorted by date" queries have something to show.
{
  alice => [ [ 3, "Oatmeal and berries for breakfast." ], [ 1, "Walked 5k, felt great." ] ],
  bob   => [ [ 2, "Skipped lunch, snacked on almonds." ] ],
  cara  => [ [ 4, "Tried a new lentil soup recipe." ], [ 0, "Slept 8 hours!" ] ]
}.each do |client, entries|
  next if client.journal_entries.exists? # already seeded

  entries.each do |days_ago, body|
    client.journal_entries.create!(body: body, created_at: days_ago.days.ago)
  end
end

puts "Seeded #{Provider.count} providers, #{Client.count} clients, " \
     "#{Subscription.count} subscriptions, #{JournalEntry.count} journal entries."
