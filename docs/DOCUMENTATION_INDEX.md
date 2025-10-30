# Documentation Index

**Project**: Talavera Subscriptions  
**Last Updated**: October 30, 2025  
**Status**: Tier 3 Complete ✅

---

## 📚 Complete Documentation Overview

This project has comprehensive documentation covering all aspects of development, architecture, and deployment.

---

## 🎯 Quick Links

### Getting Started
- **[README.md](../README.md)** - Main project documentation
  - Project status and completed tiers
  - Setup instructions (Docker + Manual)
  - Environment variables
  - API endpoints
  - Testing guide
  - Troubleshooting

### Architecture Decisions
- **[ADR-001: ORM Choice](adr/001-orm-choice.md)** - Why Prisma over TypeORM/Sequelize
- **[ADR-002: Auth Token Storage](adr/002-auth-token-storage.md)** - localStorage vs httpOnly cookies
- **[ADR-003: Adapter Pattern](adr/003-adapter-pattern.md)** - Stripe mock implementation

### Development Process
- **[AI_USAGE.md](AI_USAGE.md)** - AI assistance documentation
  - Prompts and strategies
  - Code acceptance rates
  - Pitfalls and fixes
  - Lessons learned

---

## 📖 Documentation by Topic

### 1. Project Setup

**Quick Start (5 minutes)**:
1. Clone repository
2. Copy environment files
3. Run `docker-compose up`
4. Wait for services to start
5. Seed database
6. Access http://localhost:5173

**Detailed Instructions**: See [README.md § Getting Started](../README.md#getting-started)

---

### 2. Architecture

#### System Design
- **Monorepo Structure**: Backend + Frontend + Database
- **Backend**: Node.js 20 + TypeScript 5.9 + Express 5.1
- **Frontend**: React 19 + Vite 7 + TanStack Query 5
- **Database**: PostgreSQL 15 + Prisma ORM 6.18

#### Design Patterns
- **Repository Pattern**: Service layer abstracts data access
- **Adapter Pattern**: Payment provider abstraction ([ADR-003](adr/003-adapter-pattern.md))
- **Middleware Chain**: Auth → Validation → Error Handling
- **Dependency Injection**: Prisma client for testability

#### Key Decisions
| Decision | ADR | Summary |
|----------|-----|---------|
| **ORM Choice** | [ADR-001](adr/001-orm-choice.md) | Prisma selected for type safety, DX, and migration quality over TypeORM/Sequelize |
| **Auth Storage** | [ADR-002](adr/002-auth-token-storage.md) | localStorage chosen for JWT tokens despite XSS risk (mitigated by React) |
| **Payment Integration** | [ADR-003](adr/003-adapter-pattern.md) | Adapter pattern with mock for development, easy swap to real Stripe |

---

### 3. Testing

#### Test Coverage Summary
- **50 tests total** - All passing ✅
- **100% statement coverage**
- **95.65% branch coverage**
- **Execution time**: <2 seconds

#### Test Types
| Type | Count | Framework | Status |
|------|-------|-----------|--------|
| **BDD Scenarios** | 12 | Cucumber + Gherkin | ✅ 100% passing |
| **Unit Tests** | 31 | Vitest + Prisma Mocks | ✅ 100% passing |
| **Frontend Tests** | 7 | React Testing Library | ✅ 100% passing |

#### Running Tests
```bash
# BDD integration tests
cd backend && npm run cucumber

# Unit tests with coverage
cd backend && npm run test:coverage

# Frontend component tests
cd frontend && npm run test
```

**Detailed Guide**: See [README.md § Testing](../README.md#testing-strategy)

---

### 4. API Documentation

#### Endpoints

**Authentication** (Public)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login and receive JWT

**Projects** (Protected)
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create project (quota-enforced)
- `DELETE /api/projects/:id` - Delete project

**Plans** (Protected)
- `GET /api/plans` - List available plans (Free, Pro)

**Subscriptions** (Protected)
- `GET /api/subscriptions/current` - Get active subscription
- `POST /api/subscriptions` - Subscribe to plan (creates invoice)
- `DELETE /api/subscriptions/current` - Cancel subscription

**Health Check**
- `GET /health` - Server status

**Full Documentation**: See [README.md § API Endpoints](../README.md#api-endpoints)

---

### 5. Development Workflow

#### Local Development Setup

**With Docker (Recommended)**:
```bash
# 1. Setup
docker-compose -f docker-compose.dev.yml up

# 2. Monitor logs
docker logs -f talaverasubscriptions-backend-1

# 3. Seed database (after backend ready)
docker exec talaverasubscriptions-backend-1 npm run prisma:seed

# 4. Access
# Frontend: http://localhost:5173
# Backend: http://localhost:4000
```

**Without Docker**:
```bash
# 1. Start PostgreSQL
# 2. Backend: cd backend && npm install && npm run dev
# 3. Frontend: cd frontend && npm install && npm run dev
```

#### BDD/TDD Workflow
1. Write Gherkin feature file
2. Run Cucumber (Red) - Tests fail
3. Implement minimum code
4. Run tests (Green) - Tests pass
5. Refactor code
6. Commit with descriptive message

---

### 6. Deployment

#### Environment Configuration
```env
# Production settings
NODE_ENV=production
JWT_SECRET=<strong-32-char-secret>
DATABASE_URL=<production-postgres-url>
```

#### Build Process
```bash
# Backend
cd backend
npm run build
npm run start

# Frontend
cd frontend
npm run build
npm run preview
```

**Full Guide**: See [README.md § Deployment](../README.md#deployment)

---

### 7. Troubleshooting

#### Common Issues

**Problem**: Frontend shows ERR_EMPTY_RESPONSE  
**Solution**: Wait 3-5 minutes for first startup, check logs  
**Details**: [README.md § Troubleshooting](../README.md#troubleshooting)

**Problem**: Prisma schema not found  
**Solution**: Already configured in docker-compose with `--schema=../database/schema.prisma`

**Problem**: Database connection refused  
**Solution**: Use `db` as hostname in Docker, `localhost` for local  

**Problem**: Port already in use  
**Solution**: Kill process or change PORT in .env

**Full Guide**: [README.md § Troubleshooting](../README.md#troubleshooting)

---

### 8. AI Assistance

This project was developed with significant AI assistance:

#### Statistics
- **AI-generated code**: ~70% initial, ~50% final (after modifications)
- **Human review**: 100% of code reviewed and tested
- **Time saved**: ~45% faster development (~26 hours saved)

#### Acceptance Rates
| Category | Accepted | Modified | Rejected |
|----------|----------|----------|----------|
| Project Setup | 85% | 15% | 0% |
| Database Schema | 95% | 5% | 0% |
| API Routes | 70% | 25% | 5% |
| Unit Tests | 60% | 35% | 5% |
| Documentation | 90% | 10% | 0% |

#### Key Learnings
- ✅ Use AI for boilerplate and initial structure
- ✅ Iterate with specific, contextual prompts
- ✅ Validate AI suggestions against official docs
- ❌ Don't trust mocks blindly
- ❌ Don't skip edge cases
- ❌ Don't accept first suggestion without review

**Full Documentation**: [AI_USAGE.md](AI_USAGE.md)

---

## 📋 Deliverables Checklist

All project deliverables are complete:

- ✅ **Git Repository**: Full monorepo with backend/frontend/database
- ✅ **Tests**: 50 tests passing, 100% statement coverage
- ✅ **README.md**: Comprehensive setup and usage guide
- ✅ **.env.example**: All environment variables documented
- ✅ **Database**: Migrations and seed data included
- ✅ **App/Tests**: Instructions for running both provided
- ✅ **Coverage**: Metrics documented and visualized
- ✅ **Tiers**: All 4 tiers (0-3) completed and documented
- ✅ **ADR-001**: ORM choice (Prisma) explained
- ✅ **ADR-002**: Auth token storage decision documented
- ✅ **ADR-003**: Adapter pattern for Stripe explained
- ✅ **AI_USAGE.md**: Complete AI assistance documentation

---

## 🔗 External Resources

### Technologies
- [Node.js Documentation](https://nodejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vite.dev/guide/)

### Testing
- [Vitest Documentation](https://vitest.dev/)
- [Cucumber.js](https://cucumber.io/docs/cucumber/)
- [React Testing Library](https://testing-library.com/react)

### Docker
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting section](../README.md#troubleshooting)
2. Review [AI_USAGE.md](AI_USAGE.md) for common pitfalls
3. Consult relevant ADR in [docs/adr/](adr/)
4. Check Docker logs: `docker logs -f <container-name>`

---

## 📝 Document Maintenance

### When to Update
- **README.md**: When adding features, changing setup process, or updating dependencies
- **ADRs**: When making new architectural decisions (create ADR-004, etc.)
- **AI_USAGE.md**: When using AI for significant new features
- **DOCUMENTATION_INDEX.md**: When adding new documentation files

### Document Ownership
- All documentation reviewed and approved by development team
- AI-generated content is marked as such in [AI_USAGE.md](AI_USAGE.md)
- ADRs are immutable once published (create new ADR to supersede)

---

**Last Review**: October 30, 2025  
**Documentation Coverage**: 100%  
**Status**: Complete ✅
