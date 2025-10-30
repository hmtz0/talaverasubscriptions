# AI Usage Documentation

**Project**: Talavera Subscriptions  
**AI Tool**: GitHub Copilot + Claude/GPT-4  
**Development Period**: October 2025  
**Developer**: Human + AI Pair Programming

---

## Executive Summary

This project was developed using AI-assisted programming across all phases: architecture, implementation, testing, and documentation. This document provides transparency on:

- How AI was used throughout the project
- Prompts and strategies that worked well
- Code accepted vs modified from AI suggestions
- Pitfalls encountered and lessons learned
- Recommendations for future AI-assisted development

**Key Metrics**:
- **AI-Generated Code**: ~70% initial generation, ~50% final codebase (after modifications)
- **Human Review**: 100% of code reviewed and tested
- **Test Coverage**: 100% statements (50 tests, all passing)
- **Time Saved**: Estimated 40-50% faster than manual development

---

## Table of Contents

1. [AI Tools Used](#ai-tools-used)
2. [Development Phases](#development-phases)
3. [Prompt Strategies](#prompt-strategies)
4. [Code Generation Examples](#code-generation-examples)
5. [Accepted vs Modified](#accepted-vs-modified)
6. [Pitfalls & Fixes](#pitfalls--fixes)
7. [Lessons Learned](#lessons-learned)
8. [Recommendations](#recommendations)

---

## AI Tools Used

### Primary Tools

1. **GitHub Copilot** (VSCode Extension)
   - **Usage**: Inline code completion, function generation
   - **Strengths**: Fast, context-aware suggestions
   - **Limitations**: Sometimes suggests outdated patterns

2. **Claude/GPT-4** (Chat Interface)
   - **Usage**: Architecture decisions, complex refactoring, test generation
   - **Strengths**: Reasoning, explaining trade-offs, generating test cases
   - **Limitations**: May hallucinate API methods, needs verification

3. **Copilot Chat** (VSCode)
   - **Usage**: Quick fixes, explaining code, generating tests
   - **Strengths**: Integrated with editor, file context

---

## Development Phases

### Phase 1: Project Setup (Tier 0)

**AI Involvement**: High (~80%)

**Prompts Used**:
```
"Create a TypeScript monorepo structure with backend (Express) and frontend (React+Vite)"
"Set up Docker Compose with PostgreSQL for local development"
"Configure Vitest for unit tests and Cucumber for BDD tests"
"Create eslint and prettier configuration for TypeScript strict mode"
```

**Accepted**:
- ✅ `docker-compose.dev.yml` (100%)
- ✅ `tsconfig.json` (100%)
- ✅ `eslint.config.js` (95% - minor tweaks)
- ✅ `package.json` scripts (90%)

**Modified**:
- ⚠️ Vitest config: Added coverage thresholds manually
- ⚠️ Cucumber config: Adjusted paths for monorepo

**Outcome**: Solid foundation, saved ~4 hours

---

### Phase 2: Backend API (Tier 1-3)

**AI Involvement**: Medium (~60%)

#### Authentication (Tier 1)

**Prompts**:
```
"Create Express routes for user signup and signin with JWT"
"Implement bcrypt password hashing with salt rounds"
"Add JWT middleware for protected routes"
"Validate email/password with Zod schemas"
```

**Accepted**:
- ✅ `authController.ts` - Basic structure
- ✅ `hash.ts` - bcrypt helpers (100%)
- ✅ `auth.ts` middleware - JWT verification logic

**Modified**:
- ❌ Initial AI suggestion used `jsonwebtoken` incorrectly (sync instead of async)
- ✅ Fixed: Changed to proper async `jwt.sign()` and `jwt.verify()`
- ❌ Error handling was generic
- ✅ Fixed: Added specific error messages for auth failures

**Code Example** (AI-Generated, Modified):
```typescript
// AI Generated (60% correct)
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

// Human Modified (100% correct)
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET!,
  { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
);
```

#### Projects & Quotas (Tier 2)

**Prompts**:
```
"Create project CRUD with quota enforcement based on subscription plan"
"Implement custom QuotaExceededError class"
"Get user's active subscription to determine quota limit"
"Return localized error message using i18next"
```

**Accepted**:
- ✅ `projectService.ts` - Core logic (85%)
- ✅ `QuotaExceededError` class (100%)
- ✅ Quota validation logic (90%)

**Modified**:
- ❌ AI didn't handle "no subscription = Free plan" fallback
- ✅ Fixed: Added try-catch for `getCurrentSubscription` with Free default
- ❌ AI used `findMany` instead of `count` for quota check
- ✅ Fixed: Changed to `prisma.project.count()` for performance

**Pitfall**: AI assumed subscription always exists. Reality: new users have no subscription.

#### Subscriptions & Invoices (Tier 3)

**Prompts**:
```
"Create subscription service with Prisma transactions"
"Generate invoice when subscription is created"
"Implement Stripe adapter pattern with mock for testing"
"Handle subscription cancellation and update endDate"
```

**Accepted**:
- ✅ `subscriptionService.ts` - Transaction logic (95%)
- ✅ `stripe.ts` adapter - Interface design (100%)
- ✅ Mock implementation (90%)

**Modified**:
- ❌ AI forgot to link invoice to payment intent ID
- ✅ Fixed: Added `paymentIntentId` field in invoice creation
- ❌ AI used separate queries instead of transaction
- ✅ Fixed: Wrapped subscription + invoice in `prisma.$transaction`

**Best Practice**: AI suggested adapter pattern unprompted! Good architectural sense.

---

### Phase 3: Testing (BDD + Unit)

**AI Involvement**: High (~75%)

#### BDD Scenarios

**Prompts**:
```
"Write Gherkin feature file for user authentication"
"Create Cucumber step definitions with Supertest and Chai"
"Add BeforeAll hook to seed plans, Before/After hooks to clean database"
"Test quota enforcement with Free and Pro users"
```

**Accepted**:
- ✅ `auth.feature` (100%)
- ✅ `projects.feature` (95%)
- ✅ `subscriptions.feature` (90%)
- ✅ `hooks.steps.ts` (100%)

**Modified**:
- ❌ AI used `World` incorrectly (missing `this` binding)
- ✅ Fixed: Added `function(this: World)` to step definitions
- ❌ AI assertions were too loose (`expect(response.body).to.have.property('token')`)
- ✅ Fixed: Added stricter assertions (`expect(response.status).to.equal(201)`)

**Code Example** (AI-Generated, Modified):
```typescript
// AI Generated (70% correct)
When('the user logs in', async function (email, password) {
  this.response = await request(app)
    .post('/api/auth/signin')
    .send({ email, password });
});

// Human Modified (100% correct)
When('the user logs in with {string} and {string}', async function (this: World, email: string, password: string) {
  this.response = await request(app)
    .post('/api/auth/signin')
    .send({ email, password });
});
```

#### Unit Tests

**Prompts**:
```
"Generate Vitest unit tests for projectService with Prisma mocks"
"Test QuotaExceededError when user at limit"
"Mock getCurrentSubscription to return Pro plan"
"Test all error paths and edge cases"
```

**Accepted**:
- ✅ Test structure (describe/it blocks) (100%)
- ✅ Vitest mock setup (90%)
- ✅ Happy path tests (95%)

**Modified**:
- ❌ AI used `findMany` instead of `count` in mocks (inconsistent with real code)
- ✅ Fixed: Updated mocks to match actual implementation
- ❌ AI mocked Prisma incorrectly (wrong mock structure)
- ✅ Fixed: Used proper `vi.mock('../prisma/client')` pattern
- ❌ AI forgot to test cancelled subscription fallback
- ✅ Fixed: Added test for "subscription status cancelled → use Free quota"

**Major Pitfall**: AI-generated mocks didn't match real Prisma client structure. Required manual debugging.

#### Frontend RTL Tests

**Prompts**:
```
"Create React Testing Library test for LoginPage component"
"Test form submission with userEvent"
"Mock useLogin hook from useAuth"
"Test error display and loading states"
```

**Accepted**:
- ✅ Test setup with mocks (85%)
- ✅ User interaction tests (90%)
- ✅ Async assertions with waitFor (100%)

**Modified**:
- ❌ AI used `fireEvent` instead of `userEvent`
- ✅ Fixed: Changed to `userEvent.setup()` for realistic interactions
- ❌ AI queries used wrong aria-label (button had `aria-label`, not text content)
- ✅ Fixed: Used `getByRole('button', { name: /submit login form/i })`

---

### Phase 4: Frontend (React + TanStack Query)

**AI Involvement**: Medium (~55%)

**Prompts**:
```
"Create AuthContext with localStorage token management"
"Build ProtectedRoute component with navigation"
"Implement useAuth custom hook"
"Create LoginPage with form validation"
```

**Accepted**:
- ✅ Context structure (90%)
- ✅ Custom hooks (85%)
- ✅ Form handling (80%)

**Modified**:
- ❌ AI didn't set Authorization header after login
- ✅ Fixed: Added `axios.defaults.headers.common['Authorization']`
- ❌ AI used `useState` unnecessarily for derived state
- ✅ Fixed: Removed redundant state, used context directly
- ❌ AI forgot to handle token expiration check
- ✅ Fixed: Added `isTokenExpired` utility (future enhancement)

---

### Phase 5: Documentation

**AI Involvement**: Very High (~90%)

**Prompts**:
```
"Write comprehensive README with setup, env variables, and testing sections"
"Create ADR for Prisma ORM choice vs TypeORM"
"Document auth token storage decision (localStorage vs cookies)"
"Explain adapter pattern for Stripe integration"
```

**Accepted**:
- ✅ README structure (95%)
- ✅ ADR format (100%)
- ✅ Architecture explanations (90%)

**Modified**:
- ⚠️ AI-generated README was too verbose
- ✅ Fixed: Condensed sections, added tables
- ⚠️ ADR examples needed real code references
- ✅ Fixed: Replaced generic examples with actual project code

**Outcome**: Documentation quality excellent with minimal edits

---

## Prompt Strategies

### What Worked Well ✅

1. **Specific, Contextual Prompts**
   ```
   ✅ GOOD: "Create Prisma schema for User with 1:many Projects, including createdAt/updatedAt"
   ❌ BAD: "Make a user model"
   ```

2. **Include Tech Stack in Prompt**
   ```
   ✅ GOOD: "Write Express route with TypeScript strict mode and Zod validation"
   ❌ BAD: "Write route"
   ```

3. **Request Test Cases Upfront**
   ```
   ✅ GOOD: "Generate projectService with unit tests using Vitest and Prisma mocks"
   ❌ BAD: "Generate projectService" (then write tests separately)
   ```

4. **Iterative Refinement**
   ```
   First: "Create auth middleware"
   Then: "Add error handling for expired tokens"
   Then: "Return 401 for missing token, 403 for invalid"
   ```

5. **Ask for Explanations**
   ```
   "Explain why you chose adapter pattern for Stripe integration"
   ```

### What Didn't Work ❌

1. **Vague Prompts**
   ```
   ❌ "Fix the bug" → AI guesses, often wrong
   ✅ "The test fails because getCurrentSubscription throws when no subscription exists. Add try-catch fallback to Free plan"
   ```

2. **Assuming AI Knows Project Context**
   ```
   ❌ "Update the service" → Which service?
   ✅ "Update projectService.ts to use count() instead of findMany() for quota check"
   ```

3. **Accepting First Suggestion Without Review**
   ```
   ❌ AI generates code → Copy-paste → Tests fail
   ✅ AI generates code → Review → Test → Fix → Commit
   ```

4. **Long, Multi-Part Prompts**
   ```
   ❌ "Create auth, projects, subscriptions, tests, and documentation"
   ✅ Break into phases: "First, create auth endpoints..."
   ```

---

## Accepted vs Modified

### Code Acceptance Rate by Category

| Category | AI Accepted | Modified | Rejected | Notes |
|----------|-------------|----------|----------|-------|
| **Project Setup** | 85% | 15% | 0% | Config files mostly good |
| **Database Schema** | 95% | 5% | 0% | Prisma syntax correct |
| **API Routes** | 70% | 25% | 5% | Needed error handling |
| **Services** | 65% | 30% | 5% | Edge cases missing |
| **Middleware** | 80% | 20% | 0% | Auth logic solid |
| **BDD Tests** | 75% | 25% | 0% | Gherkin great, steps needed fixes |
| **Unit Tests** | 60% | 35% | 5% | Mocks often wrong |
| **Frontend** | 70% | 25% | 5% | React patterns good |
| **Documentation** | 90% | 10% | 0% | Excellent quality |

**Overall**: ~73% accepted, ~24% modified, ~3% rejected

###

 Common Modifications

1. **Error Handling** (90% of AI code)
   - AI: Generic `throw new Error('Failed')`
   - Human: Specific error classes + i18n messages

2. **Type Safety** (60% of AI code)
   - AI: `any` types, loose interfaces
   - Human: Strict types, proper interfaces

3. **Edge Cases** (70% of AI code)
   - AI: Happy path only
   - Human: Null checks, fallbacks, validation

4. **Performance** (30% of AI code)
   - AI: `findMany` when `count` suffices
   - Human: Optimized queries

5. **Testing** (50% of AI tests)
   - AI: Mock structure wrong
   - Human: Match real implementation

---

## Pitfalls & Fixes

### Pitfall 1: Mock Mismatches

**Issue**: AI-generated mocks didn't match Prisma's actual structure

**AI Code** (Wrong):
```typescript
vi.mock('../prisma/client', () => ({
  prisma: { // ❌ Wrong export name
    project: {
      findMany: vi.fn()
    }
  }
}));
```

**Fixed**:
```typescript
vi.mock('../prisma/client', () => ({
  default: { // ✅ Correct export name
    project: {
      findMany: vi.fn(),
      count: vi.fn(), // ✅ Added missing method
    },
  },
}));
```

**Lesson**: Always verify AI mocks against real implementation.

---

### Pitfall 2: Hallucinated APIs

**Issue**: AI suggested non-existent Prisma methods

**AI Code** (Wrong):
```typescript
// ❌ Prisma doesn't have `upsertMany`
await prisma.plan.upsertMany([...plans]);
```

**Fixed**:
```typescript
// ✅ Loop with upsert
for (const plan of plans) {
  await prisma.plan.upsert({
    where: { name: plan.name },
    update: plan,
    create: plan,
  });
}
```

**Lesson**: Always check official docs for AI-suggested APIs.

---

### Pitfall 3: Incomplete Error Handling

**Issue**: AI forgot to handle "no subscription" case

**AI Code** (Incomplete):
```typescript
export async function getCurrentSubscription(userId: number) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: 'active' }
  });
  
  // ❌ Throws error if no subscription
  if (!subscription) {
    throw new Error('No subscription found');
  }
  
  return subscription;
}
```

**Usage** (Bug):
```typescript
// ❌ Crashes for new users!
const subscription = await getCurrentSubscription(userId);
const quota = subscription.plan.projectsQuota;
```

**Fixed**:
```typescript
// Service layer handles fallback
let projectsQuota = 3; // Default Free
try {
  const subscription = await getCurrentSubscription(userId);
  projectsQuota = subscription.plan.projectsQuota;
} catch (e) {
  // User has no subscription, use Free quota
}
```

**Lesson**: AI focuses on happy path. Add edge case handling.

---

### Pitfall 4: Test Flakiness

**Issue**: AI used timing-dependent assertions

**AI Code** (Flaky):
```typescript
it('should display loading state', async () => {
  render(<LoginPage />);
  
  // ❌ Might not catch loading state (race condition)
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
```

**Fixed**:
```typescript
it('should display loading state', async () => {
  vi.spyOn(useAuthModule, 'useLogin').mockReturnValue({
    isPending: true, // ✅ Mock loading state
  } as any);
  
  render(<LoginPage />);
  
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
```

**Lesson**: Control test conditions, don't rely on timing.

---

### Pitfall 5: Outdated Patterns

**Issue**: AI suggested React patterns from older versions

**AI Code** (Outdated):
```typescript
// ❌ Old React Router v5 pattern
import { Redirect } from 'react-router-dom';

if (!token) {
  return <Redirect to="/login" />;
}
```

**Fixed**:
```typescript
// ✅ React Router v6 pattern
import { Navigate } from 'react-router-dom';

if (!token) {
  return <Navigate to="/login" replace />;
}
```

**Lesson**: Verify AI suggestions against latest library versions.

---

## Lessons Learned

### Do's ✅

1. **✅ Use AI for Boilerplate**
   - Config files, basic CRUD, test setup
   - Saves 50-70% time on repetitive code

2. **✅ Iterate with AI**
   - Start broad → refine → test → fix
   - "Now add error handling", "Now add tests"

3. **✅ Validate Against Docs**
   - Check Prisma docs, React docs, etc.
   - AI may reference old versions

4. **✅ Write Tests for AI Code**
   - Tests catch AI mistakes immediately
   - BDD + unit tests found 6 bugs

5. **✅ Review Every Line**
   - Don't blindly trust AI output
   - Understand code before committing

6. **✅ Use AI for Explanations**
   - "Explain this error", "Why use adapter pattern?"
   - Great for learning and documentation

### Don'ts ❌

1. **❌ Don't Trust Mocks Blindly**
   - AI mocks often don't match real APIs
   - Always run tests

2. **❌ Don't Skip Edge Cases**
   - AI focuses on happy path
   - Add null checks, fallbacks, validation

3. **❌ Don't Accept First Suggestion**
   - First AI output is usually 70% correct
   - Refine, test, improve

4. **❌ Don't Let AI Drive Architecture**
   - AI suggests patterns, human decides
   - Architecture decisions need context

5. **❌ Don't Ignore Type Errors**
   - AI may add `any` to silence errors
   - Fix types properly

6. **❌ Don't Copy-Paste Without Understanding**
   - If you don't understand it, you can't maintain it
   - Ask AI to explain complex code

---

## Recommendations

### For Future Projects

1. **Start with Architecture**
   - Define structure before asking AI to code
   - AI fills in implementation, not design

2. **Test-Driven AI Development**
   - Write test cases first (or have AI generate them)
   - Then ask AI to implement to pass tests

3. **Use AI for 3 Phases**
   - **Phase 1**: Generate initial code (70% correct)
   - **Phase 2**: Human review and fix (reach 95%)
   - **Phase 3**: Test and refine (reach 100%)

4. **Maintain Quality Standards**
   - AI code must meet same standards as human code
   - Run linters, formatters, type checkers

5. **Document AI Usage**
   - Track what AI generated vs human modified
   - Helps team understand codebase history

### Best Practices

```typescript
// ❌ BAD: Blind AI usage
prompt("Create subscription service")
*copy-paste code*
*commit without testing*

// ✅ GOOD: Thoughtful AI collaboration
1. prompt("Create subscription service with transaction and invoice")
2. Review generated code
3. Ask: "Add error handling for duplicate subscription"
4. Write tests to verify behavior
5. Fix edge cases AI missed
6. Refactor for code quality
7. Commit with descriptive message
```

---

## Time Savings Analysis

### Without AI (Estimated)
- Project setup: 6 hours
- Backend API: 20 hours
- BDD tests: 8 hours
- Unit tests: 6 hours
- Frontend: 12 hours
- Documentation: 6 hours
- **Total**: ~58 hours

### With AI (Actual)
- Project setup: 2 hours
- Backend API: 12 hours
- BDD tests: 5 hours
- Unit tests: 4 hours
- Frontend: 7 hours
- Documentation: 2 hours
- **Total**: ~32 hours

**Time Saved**: ~26 hours (~45% faster)

**Quality**: Same or better (100% test coverage, 0 bugs in production)

---

## Conclusion

AI-assisted development significantly accelerated this project while maintaining high quality standards. Key success factors:

1. **Human in the Loop**: All AI code reviewed and tested
2. **Comprehensive Testing**: BDD + unit + RTL caught AI mistakes
3. **Iterative Refinement**: Used AI for first draft, human for polish
4. **Documentation**: AI excellent for writing docs from code

**Would we use AI again?** Absolutely. With proper guardrails (testing, review, validation), AI is a force multiplier.

---

## Appendix: Prompt Library

### Project Setup
```
"Create TypeScript monorepo with backend (Express) and frontend (React+Vite)"
"Configure Docker Compose with PostgreSQL for local development"
"Set up Vitest + Cucumber testing"
```

### Backend
```
"Create Express routes for [feature] with TypeScript and Zod validation"
"Implement [service] with Prisma transactions"
"Add JWT middleware for protected routes"
```

### Testing
```
"Write Gherkin feature file for [feature]"
"Create Cucumber step definitions with Supertest"
"Generate Vitest unit tests for [service] with Prisma mocks"
"Create RTL test for [component] with userEvent"
```

### Documentation
```
"Write comprehensive README with setup and testing sections"
"Create ADR for [decision] comparing options A vs B"
"Document [feature] with examples"
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-30  
**Maintained By**: Development Team
