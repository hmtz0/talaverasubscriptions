Feature: Subscription Management
  As a user
  I want to subscribe to different plans
  So that I can access features and increased quotas based on my subscription

  Background:
    Given the database is seeded with plans
    And a user exists with email "subscriber@example.com" and password "password123"
    And the user is logged in

  Scenario: View available subscription plans
    When the user requests the list of available plans
    Then the response status is 200
    And the response should include a plan named "Free" with quota 3
    And the response should include a plan named "Pro" with quota 10

  Scenario: Subscribe to Pro plan
    Given the user is on the "Free" plan
    When the user subscribes to the "Pro" plan
    Then the response status is 201
    And the subscription should be created successfully
    And an invoice is recorded with the plan price
    And the user's active subscription should be "Pro"
    And the user's project quota should be 10

  Scenario: View current subscription
    Given the user has an active "Pro" subscription
    When the user requests their current subscription details
    Then the response status is 200
    And the response should show plan "Pro"
    And the response should include the subscription start date
    And the response should show status "active"

  Scenario: Cancel subscription
    Given the user has an active "Pro" subscription
    When the user cancels their subscription
    Then the response status is 204
    And the subscription status should change to "cancelled"

  Scenario: User without subscription has Free plan
    Given the user has no active subscription
    When the user requests their current subscription details
    Then the response status is 404
    And the user should be treated as "Free" plan with quota 3
