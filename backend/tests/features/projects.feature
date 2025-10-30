Feature: Project quotas by plan
  As a user on different subscription plans
  I want project creation limits enforced
  So that quotas are respected

  Background:
    Given the database is seeded with plans

  Scenario: Free user creates project within quota
    Given a signed-in user on the "Free" plan with 2 projects
    When the user creates a project named "Alpha"
    Then the response status is 201
    And the response contains a project with name "Alpha"
    And "Alpha" appears in the user's project list

  Scenario: Free user exceeds quota
    Given a signed-in user on the "Free" plan with 3 projects
    When the user creates a project named "OverQuota"
    Then the response status is 403
    And the response contains the localized key "errors.quota_exceeded"

  Scenario: Pro user creates project within quota
    Given a signed-in user on the "Pro" plan with 9 projects
    When the user creates a project named "Beta"
    Then the response status is 201
    And the response contains a project with name "Beta"

  Scenario: Pro user exceeds quota
    Given a signed-in user on the "Pro" plan with 10 projects
    When the user creates a project named "ExceedsPro"
    Then the response status is 403
    And the response contains the localized key "errors.quota_exceeded"
