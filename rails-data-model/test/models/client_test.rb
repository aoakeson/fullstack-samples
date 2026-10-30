require "test_helper"

class ClientTest < ActiveSupport::TestCase
  # Query 2: all providers for a given client
  test "providers returns every provider the client is subscribed to" do
    assert_equal [ "Dana Dietitian", "Nate Nutritionist" ], clients(:alice).providers.order(:name).pluck(:name)
  end

  # Query 3: all journal entries for a given client, newest first
  test "journal_entries.newest_first returns only this client's entries, newest first" do
    assert_equal [ journal_entries(:alice_new), journal_entries(:alice_old) ],
                 clients(:alice).journal_entries.newest_first.to_a
  end

  test "requires a name and a valid email" do
    assert_not Client.new(name: "", email: "x@example.test").valid?
    assert_not Client.new(name: "X", email: "nope").valid?
  end

  test "deleting a client also deletes their subscriptions and journal entries" do
    assert_difference -> { Subscription.count } => -2, -> { JournalEntry.count } => -2 do
      clients(:alice).destroy
    end
  end
end
