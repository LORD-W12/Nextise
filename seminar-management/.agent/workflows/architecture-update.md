---
description: Architectural and Quality Upgrade Workflow
---

# Project Upgrade Workflow: Seminar Management

This workflow defines the systematic steps to elevate the `seminar-management` project's quality to match the high architectural, scalable, security, and UX standards implemented in other projects (like `kmog-distributeur`).

## Step 1: Project Restructuring and Layer Separation
// turbo
```bash
mkdir -p src/components/ui src/components/layouts src/services src/hooks src/contexts src/types src/utils
```
- **Goal:** Move away from packing logic inside the Next.js `pages/` directory.
- **Action:** 
  - Migrate all shared structural components (like `Header.tsx`) to `src/components/layouts`.
  - Establish `src/services` for all API calls.
  - Establish `src/types` for global TypeScript interfaces.
  - Move `pages/` under `src/pages/` (if using Next.js src layout) or keep it at root but ensure pages only wrap components.

## Step 2: Establishing the API Service Layer
- **Goal:** Centralize API requests, enforce security, and handle global errors.
- **Action:**
  - Create `src/services/apiClient.ts` using `axios`.
  - Add request interceptors to inject Auth Tokens securely from cookies or secure storage.
  - Add response interceptors to catch 401s (trigger logout) and 500s (trigger global toast errors).

## Step 3: Implementing Core UI Components & Notifications (UX)
- **Goal:** Enhance user experience with immediate and beautiful feedback.
- **Action:**
  - Install a toast library: `npm install react-hot-toast` or `react-toastify`.
  - Create a global `ToastProvider`.
  - Develop reusable UI components: `Button`, `Input` (with built-in error states), `Modal` (for confirmations), and generic `Table`.
  - Add loading states (`Loader` component) for all asynchronous actions.

## Step 4: Refactoring State & Custom Hooks
- **Goal:** Decouple business logic from UI components.
- **Action:**
  - Create custom hooks (e.g., `useTrainers.ts`) that utilize the services to fetch data.
  - Implement caching/revalidation (using SWR or React Query) instead of simple `useEffect` + `useState`.

## Step 5: Advanced Form Handling and Validation
- **Goal:** Seamless field error handling and data integrity.
- **Action:**
  - Adopt `react-hook-form` with `zod` resolver.
  - Refactor all forms (Login, Create Trainer, etc.) to use these tools.
  - Ensure every input shows localized field errors elegantly underneath the field in red, along with a top-level error toast upon submission failure.

## Step 6: Security and Environment Configuration
- **Goal:** Ensure scalable and secure deployments.
- **Action:**
  - Define strict `.env.example` configurations.
  - Never store sensitive data in `localStorage`.
  - Use Next.js API routes (BFF pattern) if external APIs don't have proper CORS or need secret keys to act as a secure proxy.

## Step 7: Refactor Existing Pages
- **Goal:** Apply the new architecture.
- **Action:**
  - Rewrite `pages/trainers.tsx`:
    - Remove hardcoded mock data.
    - Inject `useTrainers()` hook.
    - Implement a `ConfirmModal` for trainer deletion.
    - Use the new generic `Table` component.
