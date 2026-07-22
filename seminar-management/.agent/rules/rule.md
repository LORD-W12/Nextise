---
trigger: always_on
---

# Development Rules & Architectural Guidelines
To maintain highest quality in scalability, security, architecture, and user experience, follow these strict rules across the project:

## 1. Clean Architecture & Strict Dependency Rule
- **Dependency Rule**: Dependencies must strictly point inwards: `Infrastructure & Presentation -> Use-Cases -> Domain`.
- **Domain Layer**: Must be pure TypeScript. Zero frameworks, zero ORMs (no `@prisma/client`, `typeorm`, etc.), zero Next.js imports. Contains only pure models, entities, and repository interfaces.
- **Use-Cases Layer**: Houses application business logic. Depends ONLY on the interfaces defined in the Domain layer via Dependency Injection.
- **Infrastructure Layer**: Contains technical details (Prisma schemas/clients, database connections, external APIs). Isolated from the rest of the app.
- **Inversion of Control**: Use-Cases must depend on Repository interfaces, NOT concrete ORM implementations.

## 2. Directory Structure & Server Isolation
- **Server Isolation**: All backend logic MUST reside in its isolated directory (e.g., `src/server/` or isolated backend folders). React components must NEVER import from infrastructure or backend layers (e.g., no `@server/infrastructure` in React).
- **`pages/` (or `app/`)**: Must only act as routing entry points. Absolutely no complex logic, business rules, API fetching, or heavy UI. All pages must import components from `src/components/`.
- **`src/components/`**: UI components. No `fetch` or `axios` calls directly inside components.
- **`src/services/` (Frontend)**: Every API endpoint must have a dedicated abstraction layer (e.g., `trainer.service.ts`).
- **`src/hooks/`**: Complex frontend logic and data fetching orchestration must be extracted into custom hooks.
- **`api/` (Next.js API Routes)**: The HTTP Presentation layer. It should merely receive requests, handle DI (instantiate Use-Cases by injecting Infrastructure repositories), call the Use-Case's `execute()` method, and return standardized JSON responses. No business logic in API routes.

## 3. Strong Typing (TypeScript)
- `any` is strictly prohibited.
- All domain entities, API request payloads, and API response shapes must have properly defined `interfaces` or `types`.
- Component props must be typed explicitly.

## 4. User Experience (UX) & Error Handling
- **Toast Notifications**: Every mutation (Create, Update, Delete) MUST end with a success toast notification or a descriptive error toast.
- **Loaders**: All asynchronous and data-fetching operations must present a clear loading indicator (spinner or skeleton) to the user.
- **Empty States**: Tables and lists must display a beautiful "No data available" component when empty.
- **Confirmation**: Destructive actions (like Delete) must prompt the user with a confirmation Modal before executing.

## 5. Forms and Validation
- All forms must be built securely using robust libraries (e.g., `react-hook-form`, `zod`).
- **Inline Validation**: Field-specific errors must be visible immediately (e.g., "Email is invalid") next to or below the corresponding input fields.
- **Security**: Do not render raw user input without sanitization if dealing with rich text. Add CSRF tokens if applicable.

## 6. Security & State Management
- Authentication tokens must be managed securely—prefer HttpOnly Cookies. If using Bearer tokens, interceptors must attach them cleanly, and 401s must immediately wipe context and redirect to `/login`.
- Avoid prop-drilling. Use React Context or a state management library for global states (e.g., User Profile, Theme, Auth State).
- Backend dependencies (e.g., PrismaClient, TypeORM DataSource) must be safely initialized as singletons for hot-reloading stability.

## 7. Code Style
- Use absolute imports (configured in `tsconfig.json` mappings, e.g., `@server/*`) rather than messy relative paths (`../../`).
- Follow ES6+ conventions.
- Tailwind classes should be cleanly organized or abstracted using utility functions.