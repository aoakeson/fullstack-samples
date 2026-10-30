# Runs the four queries from the interview brief and prints the results.
#
# Usage (after `bin/rails db:seed`):
#   bin/rails runner script/queries.rb
#
# `bin/rails runner` boots the app (so all models are available) and then
# runs this file. It's like pasting these lines into `bin/rails console`.

dana  = Provider.find_by!(email: "dana@wellness.example")
alice = Client.find_by!(email: "alice@example.test")

# Prints a heading, the SQL that ActiveRecord generated, and each row.
# `.to_sql` shows the query without running it, which is handy for learning.
def show(title, relation)
  puts "\n== #{title}"
  puts "SQL: #{relation.to_sql}"
  relation.each { |record| puts "  - #{yield(record)}" }
end

# 1. All clients for a given provider
show("Clients of #{dana.name}", dana.clients) { |c| "#{c.name} <#{c.email}>" }

# 2. All providers for a given client
show("Providers of #{alice.name}", alice.providers) { |p| "#{p.name} <#{p.email}>" }

# 3. All journal entries for a given client, sorted by date (newest first)
show("Journal entries by #{alice.name}", alice.journal_entries.newest_first) do |e|
  "#{e.created_at.to_date} #{e.body}"
end

# 4. All journal entries across all clients of a given provider, sorted by date.
#    `includes(:client)` loads each entry's client up front in one extra query,
#    instead of one query per entry when we print `e.client.name` (the "N+1" problem).
show("Journal entries from #{dana.name}'s clients",
     dana.journal_entries.newest_first.includes(:client)) do |e|
  "#{e.created_at.to_date} #{e.client.name}: #{e.body}"
end

# Bonus: the plan lives on the subscription (the provider/client pair).
puts "\n== Plans for #{alice.name}"
alice.subscriptions.includes(:provider).each do |s|
  puts "  - #{s.provider.name}: #{s.plan}"
end
