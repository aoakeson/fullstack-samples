# A Provider is a health professional (e.g. a dietitian).
#
# Inheriting from ApplicationRecord makes this an "ActiveRecord model": Rails
# maps this class to the `providers` table and each instance to one row.
# Columns (id, name, email, created_at, updated_at) become methods
# automatically, so there's no need to declare them here.
class Provider < ApplicationRecord
  # --- Associations: how a provider connects to other tables ---

  # One row in `subscriptions` per client this provider works with.
  # `dependent: :destroy` deletes those rows if the provider is deleted.
  has_many :subscriptions, dependent: :destroy

  # Query 1: all clients for a provider -> `provider.clients`
  # "through" means: follow subscriptions to reach clients (a SQL JOIN).
  has_many :clients, through: :subscriptions

  # Query 4: all journal entries across all of this provider's clients
  #   -> `provider.journal_entries.newest_first`
  # Goes two hops: provider -> subscriptions -> clients -> journal_entries.
  has_many :journal_entries, through: :clients

  # --- Data clean-up and validation ---

  # Before saving, trim spaces and lowercase the email, so "Ann@X.com " and
  # "ann@x.com" are treated as the same address.
  normalizes :email, with: ->(email) { email.strip.downcase }

  # Validations run on `save`. If one fails, nothing is written and
  # `provider.errors` explains why. The database constraints in the migration
  # are the real safety net; these give friendly error messages.
  validates :name, presence: true
  validates :email, presence: true,
                    uniqueness: true,
                    format: { with: URI::MailTo::EMAIL_REGEXP }
end
