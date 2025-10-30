Feature: Subscription Management (Tier 1)
  As a user
  I want to subscribe to different tiers
  So that I can access features based on my subscription level

  Background:
    Given a user exists with email "subscriber@example.com" and password "password123"
    And the user is logged in

  Scenario: View available subscription tiers
    When the user requests the list of available subscription tiers
    Then the response should include at least one subscription tier
    And each tier should have a name, price, and features list

  Scenario: Subscribe to a basic tier
    Given a subscription tier "Basic" exists with price 9.99
    When the user subscribes to the "Basic" tier
    Then the subscription should be created successfully
    And the user's active subscription should be "Basic"

  Scenario: View my current subscription
    Given the user has an active "Basic" subscription
    When the user requests their current subscription details
    Then the response should show tier "Basic"
    And the response should include the subscription start date
    And the response should show status "active"

  Scenario: Cancel subscription
    Given the user has an active "Basic" subscription
    When the user cancels their subscription
    Then the subscription status should change to "cancelled"
    And the subscription should remain active until the end of the billing period
