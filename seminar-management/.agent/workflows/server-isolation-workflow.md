---
description: Server-Isolated Clean Architecture & TypeORM Workflow
---
# Server-Isolated Clean Architecture & TypeORM Workflow

This workflow enforces a strict isolation of all backend code inside `src/server/`.

---

## 1. Architectural Boundaries

- **`src/server/domain/`**: Pure TypeScript. No ORM, no Next.js, no external libraries. Contains pure models and repository contracts.
- **`src/server/use-cases/`**: Application business logic. Depends ONLY on domain interfaces.
- **`src/server/infrastructure/`**: Technical details. TypeORM entities, DB connection (`data-source.ts`), email services, and AI integration.
- **`src/pages/api/`**: HTTP Presentation layer. Receives requests, instantiates Use-Cases via `@server/*` imports, and returns JSON.

---

## 2. Step-by-Step Feature Implementation

For any new backend feature, execute in this exact order:

### Step 1: Define Domain Contract
1. Create domain entity in `src/server/domain/entities/`.
2. Create repository interface contract in `src/server/domain/repositories/`.

### Step 2: Implement Use Case
1. Create the use-case class in `src/server/use-cases/[feature]/`.
2. Inject repository/service interfaces via constructor.
3. Expose the `execute()` method.

### Step 3: Implement Infrastructure
1. Create TypeORM `@Entity` in `src/server/infrastructure/database/entities/`.
2. Create repository implementation in `src/server/infrastructure/database/repositories/`.
3. Implement external services (AI/Email) in `src/server/infrastructure/services/`.

### Step 4: Expose via API Route
1. Create route handler in `src/pages/api/[endpoint].ts`.
2. Import dependencies using the `@server/*` alias:
   ```typescript
   import { MyUseCase } from '@server/use-cases/MyUseCase';
   import { TypeORMRepo } from '@server/infrastructure/database/repositories/TypeORMRepo';
   ```
3. Initialize DataSource, execute the Use-Case, and return the HTTP response.

---

## 3. Strict Rules for AI Agents

* NEVER import `@server/infrastructure` code into React components (`src/components/` or `src/pages/` outside `/api`).
* ALL backend logic must reside strictly inside `src/server/`.
