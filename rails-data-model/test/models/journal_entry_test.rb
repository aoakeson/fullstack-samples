require "test_helper"

class JournalEntryTest < ActiveSupport::TestCase
  test "requires a body" do
    assert_not JournalEntry.new(client: clients(:alice), body: "").valid?
  end

  test "requires a client" do
    assert_not JournalEntry.new(body: "Hello").valid?
  end

  test "newest_first sorts by created_at descending" do
    dates = JournalEntry.newest_first.pluck(:created_at)
    assert_equal dates.sort.reverse, dates
  end
end
