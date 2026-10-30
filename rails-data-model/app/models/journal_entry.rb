# A JournalEntry is a piece of freeform text a client posts (meals, mood, etc.).
class JournalEntry < ApplicationRecord
  belongs_to :client

  validates :body, presence: true

  # A scope is a named, reusable query. It can be chained onto any query
  # that returns journal entries:
  #   client.journal_entries.newest_first
  #   provider.journal_entries.newest_first
  #
  # Sort newest first by date. `id` breaks ties when two entries share the
  # same timestamp, so the order is always the same.
  scope :newest_first, -> { order(created_at: :desc, id: :desc) }
end
