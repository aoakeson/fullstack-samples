# A Subscription links one client to one provider and records the plan they're on.
# It's the "join model" that makes the many-to-many relationship work.
class Subscription < ApplicationRecord
  # `belongs_to` means this table holds the foreign key (provider_id, client_id).
  # Rails also requires both to be present before saving.
  belongs_to :provider
  belongs_to :client

  # `enum` limits `plan` to a fixed list of values and generates helpers:
  #   subscription.basic?    subscription.premium!    Subscription.premium (a query)
  # Each value is stored as the string itself ("basic"/"premium").
  # `validate: true` turns an invalid plan into a normal validation error
  # instead of raising an exception.
  enum :plan, { basic: "basic", premium: "premium" }, default: :basic, validate: true

  # A client can't subscribe to the same provider twice. This mirrors the
  # unique index on [provider_id, client_id] in the migration.
  validates :client_id, uniqueness: { scope: :provider_id, message: "is already subscribed to this provider" }
end
