# Creates the `subscriptions` table: the link between ONE provider and ONE client.
#
# Providers have many clients and clients can have many providers
# (a "many-to-many" relationship). In a relational database that's modeled with
# a join table holding one row per provider/client pair.
#
# Each pair has exactly one plan ("basic" or "premium"), so the plan lives here,
# on the pair, not on the provider or the client.
class CreateSubscriptions < ActiveRecord::Migration[8.1]
  def change
    create_table :subscriptions do |t|
      # `references` adds a `provider_id` column (and by default an index on it).
      # `foreign_key: true` makes the database check that the provider exists.
      # No separate provider_id index: the unique index below starts with
      # provider_id, so it already makes "clients for a provider" fast.
      t.references :provider, null: false, foreign_key: true, index: false
      # The client_id index makes "providers for a client" fast.
      t.references :client,   null: false, foreign_key: true

      # Stored as readable text ("basic"/"premium") rather than 0/1, so the raw
      # data makes sense when you look at it. The model limits it to those values.
      t.string :plan, null: false, default: "basic"

      t.timestamps
    end

    # A client can subscribe to the same provider only once, which is what
    # guarantees "one plan per provider/client pair".
    add_index :subscriptions, [ :provider_id, :client_id ], unique: true
  end
end
