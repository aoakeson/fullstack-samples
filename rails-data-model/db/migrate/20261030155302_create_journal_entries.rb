# Creates the `journal_entries` table: freeform text a client posts.
class CreateJournalEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :journal_entries do |t|
      # Every entry belongs to a client (the author).
      # `index: false` because the composite index below already covers client_id.
      t.references :client, null: false, foreign_key: true, index: false

      # `text` (not `string`) because entries can be long.
      t.text :body, null: false

      # `created_at` is the date we sort entries by.
      t.timestamps
    end

    # Our main queries are "this client's entries, newest first". An index on
    # (client_id, created_at) lets the database find and sort them in one pass
    # without scanning the whole table. Because client_id comes first, it also
    # serves plain "entries where client_id = ?" lookups.
    add_index :journal_entries, [ :client_id, :created_at ]
  end
end
