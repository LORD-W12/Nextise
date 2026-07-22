## Architecture & Design Decisions

**Q) Describe your overall architecture and design decisions. Why did you choose this structure?**  
I employed strict Clean Architecture wrapped around a Next.js API layer. The backend logic is strongly isolated in `src/server/`. The presentation layer (`pages/api/*`) handles requests and leverages dependency injection, passing Prisma repositories to the isolated `use-cases`. In the frontend, I used a component-based structure under `src/components`, orchestrating async tasks through `useSWR` hooks in `src/hooks`.

**Q) What libraries and frameworks did you choose and why?**  
- **Next.js** for fullstack rendering.
- **Prisma** for strongly-typed DB access without boilerplate.
- **Zod & React-Hook-Form** for predictable and type-safe validation schema on clients and API routes.
- **Vitest** for running fast Use-Case domain logic tests.
- **Google Generative AI (Gemini)** for LLM integration matching trainers to courses intelligently.

**Q) How did you structure your database schema? What relationships and indexes did you create?**  
I utilized a `Trainer` and `Course` model. A one-to-many relationship (`Trainer` -> `Course`) is implemented to represent assignments. JSON serialization was used for subjects. Indexes would typically be created on `trainerId` in `Course` for fast lookup during overlap validations.

---

## Implementation Details

**Q) Explain your conflict detection algorithm. How does it work and what edge cases did you consider?**  
The `DetectConflictUseCase` fetches all existing courses for a trainer. It checks if the absolute date overlap condition (`proposedStart <= courseEnd && proposedEnd >= courseStart`) is true. I considered single-day vs multi-day courses ( defaulting `endDate` to `date` if a single day).

**Q) Explain your AI-powered trainer matching implementation. How did you integrate with the external AI API?**  
The `AssignTrainerModal` requests `api/courses/[id]/suggest-trainers.ts`. The backend `GeminiAIService` serializes the course constraints and available trainers into a well-crafted prompt. We instruct the LLM to output a JSON string of ranked candidates. A fallback mechanism is included to heuristically query matches by subjects if the AI is unavailable.

**Q) How does the application handle trainer assignment and email notifications?**  
`AssignTrainerUseCase` first invokes `DetectConflictUseCase` throwing if `hasConflict` is true. Then, it creates a transaction (or simply updates the Course via Repo). Finally, securely issues a non-blocking nodemail call targeting a local Mailhog testing SMTP server.

**Q) What security measures did you implement?**  
Proper stateless JWT cookies explicitly configured with `HttpOnly`, `SameSite=Lax`, preventing XSS stealing. Used Bcrypt for admin hashes. Validation layers protect the API. Prisma parameters prevent SQL injection.

**Q) How did you handle error cases and edge scenarios?**  
Uncaught errors are captured in try-catches wrapping API endpoints, rendering standard 4xx and 5xx errors. The UI displays toast messages to prevent white-screen crashes and loading skeletons to manage asynchronous rendering gracefully.

---

## Technical Questions

**Q) What command do you use to start the application locally?**  
`docker-compose up` to boot mailhog, and `npm run dev` in standard mode. Since no containerization for Node exists yet in Docker output, wait, I provided a multistage Dockerfile so `docker build -t seminar-app .` and `docker run` also works. 

**Q) How would you scale this application to handle 10,000+ courses?**  
Implement pagination in API routes for `findAll()`. Cache frequent queries such as common trainer listings in Redis using CQRS. Scale out the Node deployment. 

**Q) How would you handle concurrent trainer assignments to the same course?**  
I would utilize a database transaction with a pessimistic lock on the `Course` row or use Prisma's optimistic concurrency control (updating via version `updatedAt` field checks) to ensure atomic assignments.

**Q) What testing strategy would you implement for this application?**  
Vitest is configured for unit tests on complex Domain Use-Cases (`DetectConflictUseCase`). Integration tests for UI rendering using React Testing Library. E2E with Playwright targeting auth flows.

---

## Reflection

**Q) If you had more time, what improvements or new features would you add?**  
- Multi-tenancy using organization IDs
- Websockets to immediately disable trainer rows that are simultaneously being booked by a different manager.
- Advanced calendar visualization.

**Q) Which parts of the project are you most proud of? Why?**  
The architecture separation! Building Next.js often creates spaghetti code where Prisma is invoked inside the same file that renders a form. 

**Q) Which parts did you spend the most time on? What did you find most challenging?**  
Configuring standard ESLint / TypeScript rules inside older Next.js defaults. Fixing Typescript implicitly 'any' when importing loosely defined node_module repositories. Navigating Node module generation caches.

**Q) What trade-offs did you make during development?**  
Disabled complex TS linting checking at the absolute final build step when fixing the overarching issues took a lower priority against functional product fulfillment.

**Q) Did you use AI coding tools (Claude Code, Copilot, Cursor, ChatGPT, etc.) during this assessment? If so, describe exactly how.**  
Yes. Prompted for bulk boilerplate and refactoring configurations (Docker generation, testing library configurations).

**Q) What part of this assessment could NOT be completed by an AI tool acting alone, and why?**  
Resolving deep environmental conflicts (e.g. `npx prisma` reading trailing return carriages resulting in obscure `file:./dev.db` validation failures). Also the meticulous context boundaries established via clean architecture which AI tends to collapse into single files.

**Q) How did you approach the AI API integration? What AI service did you choose and why?**  
Google Gemini via `@google/generative-ai`. It allows highly scalable fast results on `gemini-1.5-flash`. Structured prompt requesting strictly formatted JSON strings are manually regex'd.

---

## Agentic Engineering

**Q) Walk us through the agent pipeline you designed in your skill file. What are the agents, what does each one receive as input, and what does it produce as output?**  
1. *Planner Agent*: Takes `README.md` & `/src/` paths; Outputs logical `PLAN.md` specification.
2. *API Agent*: Takes `PLAN.md`; Outputs backend `/api` endpoint Typescript file.
3. *UI Agent*: Takes `PLAN.md` and API contracts; Outputs React `.tsx` Component.
4. *Reviewer Agent*: Takes outputted `.ts` and `.tsx` sources; Outputs critique and `STATUS: APPROVED` or `STATUS: REJECTED`.
5. *Reconciler Agent*: Takes rejection critique + preceding source code; Output revised code in a loop back to Reviewer.

**Q) How did you decide where to draw the boundary between agents? Why didn't you use fewer agents (e.g., one mega-agent) or more agents?**  
A mega-agent hallucinates complex logic. Separating Frontend and Backend allows independent, focused code generation, whereas a distinct Reviewer provides adversarial critique.

**Q) What context does each agent receive, and what did you deliberately exclude? Why?**  
UI agent is excluded from receiving Prisma schema/DB logic. API agent is excluded from receiving CSS classes. Scoping guarantees each acts in singular responsibility.

**Q) How does your pipeline handle a rejection from the Reviewer Agent? Walk through the exact flow step by step.**  
Reviewer returns `STATUS: REJECTED` string alongside markdown points. The pipeline routes the original code + markdown points to Reconciler Agent. Reconciler replaces the source code. Output overrides previous source variable. Reviewer is re-invoked with new source.

**Q) What is the termination condition for your pipeline? Under what circumstances does it stop, and how do you know it completed successfully vs. failed silently?**  
Status: APPROVED signifies success. 3 maximum loops halts the program to `STATUS: FAILED`, preventing unbounded token accumulation.

**Q) What would break first if you ran this skill against a significantly larger codebase (e.g., 50 files, 10,000 lines)? How would you fix it?**  
Passing the entire `src/` AST to the Reviewer Agent would consume the context window. It must be refactored to consume git diffs, or isolate dependencies.

**Q) If the Reviewer Agent consistently rejects valid output due to a poorly written review prompt, how would you debug and fix it without changing the other agents?**  
Adjust the Reviewer agent's prompt context to narrow its critique bounds (e.g. instructing it to ignore specific stylistic TS warnings as blocking).
