Feature: User Authentication
  As a user
  I want to register and login
  So that I can access the subscription system

  Scenario: User registration
    When a new user registers with email "user@example.com" and password "SecurePass123!"
    Then the registration should succeed
    And the user should receive an access token

  Scenario: User login with valid credentials
    Given a user exists with email "alice@example.com" and password "password123"
    When the user logs in with email "alice@example.com" and password "password123"
    Then the login should succeed
    And the user should receive an access token

  Scenario: User login with invalid credentials
    Given a user exists with email "alice@example.com" and password "password123"
    When the user logs in with email "alice@example.com" and password "wrongpassword"
    Then the login should fail with status 401
    And no access token should be provided
