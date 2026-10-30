# A Client is a person working with one or more providers.
# See provider.rb for a walkthrough of what each line does.
class Client < ApplicationRecord
  # One row in `subscriptions` per provider this client is signed up with.
  has_many :subscriptions, dependent: :destroy

  # Query 2: all providers for a client -> `client.providers`
  has_many :providers, through: :subscriptions

  # Query 3: a client's journal entries -> `client.journal_entries.newest_first`
  has_many :journal_entries, dependent: :destroy

  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :name, presence: true
  validates :email, presence: true,
                    uniqueness: true,
                    format: { with: URI::MailTo::EMAIL_REGEXP }
end
