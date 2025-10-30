```markdown
# Backend - talaverasubscriptions

Tecnologías:
- Node 20+, Express 5, TypeScript (strict), Zod, Prisma, PostgreSQL
- Auth: JWT (access token), bcrypt
- Tests: Vitest, Supertest, Cucumber (BDD features)

Quick start (local, desarrollo):
1. Instala dependencias:
   cd backend
   npm install

2. Configura variables de entorno:
   cp .env.example .env
   Edita DATABASE_URL para apuntar a tu Postgres (en dev, localhost; en Docker: host=db).

3. Cuando tengas la carpeta database/schema.prisma lista, genera Prisma Client:
   npm run prisma:generate
   npm run prisma:migrate:dev

4. Levanta en modo desarrollo:
   npm run dev

Scripts:
- npm run dev: desarrollo con reload
- npm run build && npm run start:prod: build y arranque producción
- npm run prisma:generate / prisma:migrate:dev
- npm test: corre tests con Vitest
- npm run cucumber: corre features BDD

Notas:
- El backend asume que la DB se gestiona desde la carpeta database/ (prisma/schema.prisma).
- No subas .env al repo.
```