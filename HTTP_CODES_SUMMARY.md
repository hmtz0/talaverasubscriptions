# HTTP Status Codes - BDD Scenarios

## Project Quotas

### ✅ Scenario: Free user creates within quota
- **Endpoint**: `POST /api/projects`
- **Expected Status**: `201 Created`
- **Implementation**: `projectController.ts:21` → `res.status(201).json(project)`
- **Condition**: User has less than plan quota (Free: 3, Pro: 10)

### ✅ Scenario: Free user exceeds quota
- **Endpoint**: `POST /api/projects`
- **Expected Status**: `403 Forbidden`
- **Implementation**: `projectController.ts:27` → `res.status(403).json({ error: t('errors.quota_exceeded', lang, { limit }) })`
- **Response Key**: `"errors.quota_exceeded"`
- **Condition**: User has reached plan quota (≥3 for Free, ≥10 for Pro)

## Subscriptions

### ✅ Scenario: Start Pro subscription increases quota
- **Endpoint**: `POST /api/subscriptions`
- **Expected Status**: `201 Created`
- **Implementation**: `subscriptionController.ts:13` → `res.status(201).json({ message, subscription })`
- **Effects**:
  - Creates subscription record
  - Creates invoice record
  - User's project quota increases to 10

### Additional Endpoints

#### GET /api/projects
- **200 OK**: Returns user's projects list
- **401 Unauthorized**: No valid auth token

#### DELETE /api/projects/:id
- **204 No Content**: Project deleted successfully
- **403 Forbidden**: User doesn't own the project
- **404 Not Found**: Project doesn't exist

#### GET /api/subscriptions/current
- **200 OK**: Returns current subscription
- **404 Not Found**: No active subscription

#### DELETE /api/subscriptions/current
- **204 No Content**: Subscription cancelled successfully
- **404 Not Found**: No active subscription to cancel

## Translation Keys

### English
- `errors.quota_exceeded`: "Plan limit reached. Maximum {{limit}} projects allowed."

### Spanish
- `errors.quota_exceeded`: "Límite del plan alcanzado. Máximo {{limit}} proyectos permitidos."

## Implementation Files

- Controllers: `backend/src/controllers/projectController.ts`, `subscriptionController.ts`
- Services: `backend/src/services/projectService.ts`, `subscriptionService.ts`
- Translations: `backend/src/utils/i18n.ts`
- Routes: `backend/src/routes/projects.ts`, `subscriptions.ts`
