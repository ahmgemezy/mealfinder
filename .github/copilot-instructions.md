# Dish Shuffle: AI Agent Instructions

## Project Overview

Dish Shuffle is a premium recipe discovery platform built with Next.js 15 App Router, featuring a dual-API hybrid system, comprehensive internationalization, and AI-driven content generation. Focus on type safety, performance, and maintaining the "premium UI" aesthetic.

## Critical Architecture Patterns

### Dual-API Hybrid System (`lib/api/`)

**Never fetch from APIs directly in components.** All recipe data flows through [lib/api/index.ts](../lib/api/index.ts):

- **TheMealDB** (primary, free) → **Spoonacular** (fallback, paid) based on `RECIPE_API_PROVIDER` env var
- Hybrid mode tries MealDB first; falls back to Spoonacular for unsupported features (diet filters, advanced nutrition)
- All responses normalized to generic `Recipe` interface in [lib/types/recipe.ts](../lib/types/recipe.ts)
- Check `recipe.apiSource` discriminator before accessing provider-specific fields
- Aggressive Supabase caching in `recipes` table (JSONB `data` column) to minimize API costs

Example pattern from [lib/api/index.ts](../lib/api/index.ts):

```typescript
if (provider === "hybrid") {
  const meal = await mealdb.getRandomMeal();
  if (meal) return meal;
  return await spoonacular.getRandomRecipe(); // Fallback
}
```

### Internationalization Architecture

**URL-based routing:** All pages live in [app/[locale]/](../app/[locale]/)

- **Middleware:** [proxy.ts](../proxy.ts) handles locale detection and redirects
- **Static UI:** Translations in [messages/{locale}.json](../messages/)
- **Dynamic Content:** Recipes translated via `google-translate-api-x` or pre-cached in Supabase
- **Google Translate Integration:** Custom implementation in [components/features/AutoGoogleTranslate.tsx](../components/features/AutoGoogleTranslate.tsx) with CSS hacks in [globals.css](../app/globals.css) to hide default banners—**do not remove these**

Supported locales: `en`, `es`, `fr`, `de`, `ar`, `pt-br`

### Server Actions Pattern

Use Server Actions for all data fetching—**never** fetch in Client Components:

- Actions live in [actions/](../actions/) directory with `'use server'` directive
- Example: [actions/get-recipes.ts](../actions/get-recipes.ts) wraps API calls with translation logic
- Client Components marked with `"use client"` only when needed (interactivity, hooks)
- Default to Server Components for pages/layouts

### Database Schema & RLS

**Supabase tables** (see [supabase/migrations/01_initial_schema.sql](../supabase/migrations/01_initial_schema.sql)):

1. **`recipes`** - Public cache (RLS disabled)
   - `id` (text): API ID from MealDB/Spoonacular
   - `data` (jsonb): Full normalized `Recipe` object
   - **Critical:** Never modify this schema without migration

2. **`favorites`** - User-scoped (RLS enabled)
   - User-specific via `auth.uid()` policies
   - Unique constraint: `(user_id, recipe_id)`

3. **`recipe_seo_enrichments`** - AI-generated SEO metadata cache
4. **`blog_posts`** - Generated content with EEAT compliance

## Developer Workflows

### Development Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint check
npm run test             # Vitest unit tests
npm run e2e              # Playwright E2E tests
```

### AI Content Generation Scripts

**Generate blog post** (uses OpenAI + Jina.ai research):

```bash
npx tsx scripts/generate-blog-post.ts --topic "Sourdough Science" --category "Cooking Fundamentals"
```

- Flags: `--dry-run` (skip DB), `--output` (print to console)
- See [scripts/generate-blog-post.ts](../scripts/generate-blog-post.ts) for EEAT guidelines

**Enrich recipe SEO** (adds nutrition, history):

```bash
npm run enrich:seo
```

### Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Public anon key
SUPABASE_SERVICE_ROLE_KEY=         # Admin key (scripts only)
RECIPE_API_PROVIDER=hybrid         # mealdb | spoonacular | hybrid
SPOONACULAR_API_KEY=               # Required if using Spoonacular
OPENAI_API_KEY=                    # For AI content generation
JINA_API_KEY=                      # For research/scraping
UNSPLASH_ACCESS_KEY=               # For blog images
```

## Coding Standards

### TypeScript Strict Mode

- **No `any` types**—use defined types in [lib/types/](../lib/types/)
- Discriminated unions for API source: `recipe.apiSource === 'mealdb' ? ... : ...`

### Styling with Tailwind v4

- **Config in CSS:** Theme extensions live in [globals.css](../app/globals.css) via `@theme` directive, not `tailwind.config.ts`
- **Custom animations:** `animate-float-1`, `animate-wiggle-left`, etc.
- **Premium UI classes:** `.glass-nav`, `.gradient-text`, `.shadow-soft`
- **Fonts:** Inter (sans), Playfair Display (headings), Geist Mono (code)

### Performance Optimizations

- **Images:** `unoptimized: true` in [next.config.ts](../next.config.ts) due to Vercel quota—do not change without authorization
- Use `next/image` with remote patterns for TheMealDB, Spoonacular, Unsplash
- Aggressive caching: Recipe data cached in Supabase to minimize API calls

### Error Handling

- API calls must fail gracefully—return `null` or `[]`, never crash pages
- Use Next.js conventions: [error.tsx](../app/[locale]/error.tsx), [not-found.tsx](../app/[locale]/not-found.tsx)
- Implement loading states with React Suspense and skeleton UI

## Testing Strategy

- **Unit tests:** Vitest with `@testing-library/react` in [tests/unit/](../tests/unit/)
- **E2E tests:** Playwright in [tests/e2e/](../tests/e2e/)
- Config: [vitest.config.ts](../vitest.config.ts), [playwright.config.ts](../playwright.config.ts)

## Common Debugging Patterns

### API Fallback Issues

If recipes fail to load, check:

1. Provider mode in `.env.local` (`RECIPE_API_PROVIDER`)
2. ID format mismatches (MealDB uses numeric strings, Spoonacular uses integers)
3. Cache staleness in Supabase `recipes` table

### Translation Failures

- Verify Google Translate CSS hacks intact in [globals.css](../app/globals.css)
- Check locale in URL matches supported locales in [navigation.ts](../navigation.ts)
- Ensure `next-intl` middleware in [proxy.ts](../proxy.ts) is functioning

### RLS Permission Errors

- Favorites table requires authenticated user (`auth.uid()`)
- Recipes table has RLS **disabled** (public cache)
- Use `supabase-admin.ts` client for service role operations in scripts

## Key Files Reference

- **API Layer:** [lib/api/index.ts](../lib/api/index.ts), [lib/api/mealdb.ts](../lib/api/mealdb.ts), [lib/api/spoonacular.ts](../lib/api/spoonacular.ts)
- **Types:** [lib/types/recipe.ts](../lib/types/recipe.ts)
- **Server Actions:** [actions/get-recipes.ts](../actions/get-recipes.ts), [actions/search-pantry.ts](../actions/search-pantry.ts)
- **Database:** [lib/supabase.ts](../lib/supabase.ts), [lib/supabase-admin.ts](../lib/supabase-admin.ts)
- **i18n Config:** [i18n.ts](../i18n.ts), [navigation.ts](../navigation.ts), [proxy.ts](../proxy.ts)
- **Migrations:** [supabase/migrations/](../supabase/migrations/)
- **AI Scripts:** [scripts/generate-blog-post.ts](../scripts/generate-blog-post.ts), [scripts/enrich-recipe-seo.ts](../scripts/enrich-recipe-seo.ts)

## Additional Context

For comprehensive architecture details, see:

- [AI_DEVELOPER_GUIDE.md](../AI_DEVELOPER_GUIDE.md) - Full architectural overview
- [AI_CONTEXT_PROMPT.md](../AI_CONTEXT_PROMPT.md) - System prompt for AI agents
- [README.md](../README.md) - Setup and getting started
