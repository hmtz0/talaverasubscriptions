Feature: Task Management
  As an authenticated user
  I want to manage my tasks
  So that I can organize my work

  Background:
    Given a user exists with email "alice@example.com" and password "password123"
    And the user is logged in

  Scenario: Create a new task
    When the user creates a task with title "Buy groceries"
    Then the task should be created successfully
    And the task should appear in the user's task list

  Scenario: List all tasks
    Given the user has created a task with title "Buy groceries"
    And the user has created a task with title "Call dentist"
    When the user lists all their tasks
    Then the response should contain 2 tasks
    And the tasks should include "Buy groceries" and "Call dentist"

  Scenario: Mark task as done
    Given the user has created a task with title "Buy groceries"
    When the user marks the task "Buy groceries" as done
    Then the task status should be "completed"

  Scenario: Delete a task
    Given the user has created a task with title "Buy groceries"
    When the user deletes the task "Buy groceries"
    Then the task should be removed from the user's task list
