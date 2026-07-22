---
description: Clean Architecture & Prisma Workflow for Next.js
---

# Clean Architecture & Prisma Workflow for Next.js

This document defines the strict workflow, folder structure, and design principles that the AI assistant must follow when generating backend features.

---

## 1. Architectural Rules (Mandatory)

1. **Dependency Rule**: Dependencies must only point inwards.
   - `Domain`: Standard TypeScript only. Zero frameworks, zero ORM, zero Next.js imports.
   - `Use-Cases`: Business logic. Depends ONLY on Domain interfaces.
   - `Infrastructure`: Technical details (Prisma schemas/clients, database connections, external APIs).
   - `App (Presentation)`: Next.js API Routes / Server Actions. Connects HTTP inputs to Use-Cases.
2. **Prisma Isolation**: Prisma schemas, generated types, and the Prisma client must remain strictly inside `src/infrastructure/` (or the project root for `schema.prisma`). Domain models and interfaces must remain pure.
3. **Inversion of Control**: Use-Cases depend on Repository interfaces (`src/domain/repositories`), NOT on concrete Prisma implementations.

---

## 2. Directory Structure

```text
src/
├── domain/
│   ├── entities/            # Pure domain types/interfaces
│   ├── repositories/        # Repository contracts (interfaces)
│   └── services/            # External service interfaces
├── use-cases/
│   └── [feature]/           # Feature-specific use cases
├── infrastructure/
│   ├── database/
│   │   ├── prisma.ts        # PrismaClient singleton setup
│   │   └── repositories/    # Prisma implementation of domain repositories
│   └── services/            # External API adapters (email, AI, etc.)
└── app/
    └── api/                 # Next.js Route Handlers (HTTP Controllers)

```

---

## 3. Implementation Workflow Step-by-Step

When implementing any backend feature, execute the following steps in exact order:

### Step 1: Environment & Prisma Setup

1. Initialize Prisma in the project by running `npx prisma init`.
2. Define your database schema in `prisma/schema.prisma`.
3. Create or verify the global PrismaClient singleton in `src/infrastructure/database/prisma.ts` to handle Next.js Hot Reloading without opening redundant connections.

### Step 2: Define Domain Contract (`src/domain/`)

1. Create pure domain entities/types in `src/domain/entities/`.
2. Create repository interface contracts in `src/domain/repositories/` (e.g., `export interface IUserRepository`).

### Step 3: Implement Business Logic (`src/use-cases/`)

1. Create a dedicated Use-Case class in `src/use-cases/[feature]/`.
2. Pass domain interfaces into the constructor (Dependency Injection).
3. Expose an `execute(...)` method containing the business logic.

### Step 4: Implement Infrastructure (`src/infrastructure/`)

1. Ensure your database tables are mapped correctly in `prisma/schema.prisma` and run `npx prisma generate`.
2. Create the Repository implementation in `src/infrastructure/database/repositories/` wrapping the `PrismaClient` to fulfill the domain interface.

### Step 5: Expose API Endpoint (`src/app/api/`)

1. Create the Route Handler (`route.ts`) inside `src/app/api/`.
2. Initialize the `PrismaClient` and instantiate the concrete infrastructure dependencies.
3. Pass infrastructure implementations into the Use-Case constructor and call `execute()`.
4. Return standardized JSON responses with proper HTTP status codes.

---

## 4. Code Generation Checklist for AI

Before marking a feature as complete, verify:

* [ ] Are domain files free of `@prisma/client`, `.prisma`, or `next/server` imports?
* [ ] Does the Use-Case rely strictly on interfaces rather than Prisma repository classes?
* [ ] Is database access properly handled using the singleton `PrismaClient` instance?
* [ ] Are error boundaries and HTTP status codes cleanly mapped at the Presentation layer?