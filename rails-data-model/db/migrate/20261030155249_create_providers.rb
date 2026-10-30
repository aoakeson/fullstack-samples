# A migration is a versioned, step-by-step change to the database schema.
# `bin/rails db:migrate` runs every migration that hasn't run yet, in timestamp
# order, and then writes the resulting schema to db/schema.rb.
#
# This one creates the `providers` table (e.g. dietitians).
class CreateProviders < ActiveRecord::Migration[8.1]
  def change
    # Rails adds an auto-incrementing `id` primary key automatically.
    create_table :providers do |t|
      # `null: false` means the database itself refuses rows without these values.
      t.string :name,  null: false
      t.string :email, null: false

      # Adds `created_at` and `updated_at`; Rails fills them in for us.
      t.timestamps
    end

    # A unique index makes duplicate emails impossible, even if two requests
    # race each other. It also makes "find provider by email" fast.
    add_index :providers, :email, unique: true
  end
end
