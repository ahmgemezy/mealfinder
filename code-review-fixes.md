# Code Review Fixes Implementation Plan

## Phase 1: Security & Types
- [x] Find and replace all `catch (error: any)` or `error: any` patterns with `unknown` and proper type guards.
- [x] Audit and improve Zod schemas in Server Actions (`actions/submit-contact.ts`, `actions/search-pantry.ts`) to ensure strict inputs.

## Phase 2: Performance & State
- [x] Audit `lib/hooks/useFavorites.tsx` and `lib/hooks/useSearchHistory.tsx` to add `try/catch` fallbacks for `localStorage`.
- [x] Add item size limit to `useSearchHistory` logic.
- [x] Replace raw `console.log` and `console.error` with `lib/utils/logger.ts`.

## Phase 3: Testing & Polish
- [x] Clear remaining `@ts-ignore` flags in `lib/api/mealdb.ts` or `lib/services/translation.ts` where possible.
- [x] Run typescript checks.
