require "test_helper"

class SubscriptionTest < ActiveSupport::TestCase
  test "each provider/client pair has its own plan" do
    assert subscriptions(:dana_alice).premium?
    assert subscriptions(:nate_alice).basic?
  end

  test "plan defaults to basic" do
    subscription = Subscription.new(provider: providers(:nate), client: clients(:bob))
    assert subscription.basic?
  end

  test "plan must be basic or premium" do
    subscription = Subscription.new(provider: providers(:nate), client: clients(:bob), plan: "gold")
    assert_not subscription.valid?
    assert_includes subscription.errors[:plan], "is not included in the list"
  end

  test "a client cannot subscribe to the same provider twice" do
    duplicate = Subscription.new(provider: providers(:dana), client: clients(:alice))
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:client_id], "is already subscribed to this provider"
  end
end
