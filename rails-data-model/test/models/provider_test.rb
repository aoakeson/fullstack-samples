require "test_helper"

# Run just this file with: bin/rails test test/models/provider_test.rb
class ProviderTest < ActiveSupport::TestCase
  # Query 1: all clients for a given provider
  test "clients returns every client subscribed to the provider" do
    assert_equal [ "Alice", "Bob" ], providers(:dana).clients.order(:name).pluck(:name)
  end

  # Query 4: all journal entries across all clients of a provider, newest first
  test "journal_entries returns entries from all of the provider's clients, newest first" do
    entries = providers(:dana).journal_entries.newest_first

    assert_equal [ journal_entries(:alice_new), journal_entries(:bob_mid), journal_entries(:alice_old) ],
                 entries.to_a
  end

  test "journal_entries excludes entries from other providers' clients" do
    # Cara only sees Nate, so Dana must not see Cara's entry.
    refute_includes providers(:dana).journal_entries, journal_entries(:cara_recent)
  end

  test "journal_entries does not repeat an entry when the client also sees another provider" do
    # Alice sees both Dana and Nate; each of her entries should appear once for Nate.
    assert_equal 2, providers(:nate).journal_entries.where(client: clients(:alice)).count
  end

  test "email is normalized to lowercase without surrounding spaces" do
    provider = Provider.create!(name: "Pat", email: "  Pat@Example.TEST ")
    assert_equal "pat@example.test", provider.email
  end

  test "requires a name and a valid, unique email" do
    assert_not Provider.new(name: "", email: "x@example.test").valid?
    assert_not Provider.new(name: "X", email: "not-an-email").valid?
    assert_not Provider.new(name: "X", email: "DANA@wellness.example").valid?, "duplicate (case-insensitive)"
  end
end
