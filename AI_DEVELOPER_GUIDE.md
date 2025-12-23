# 🤖 AI Developer Guide: Dish Shuffle

> **For AI Agents & Human Developers:** This document serves as the "source of truth" for understanding, navigating, and contributing to the **Dish Shuffle** codebase. Use this context to minimize hallucinations and ensure architectural alignment.

---

## 1. Project Overview & Architecture

**Dish Shuffle** is a premium recipe discovery platform focused on high-quality UX, internationalization, and AI-driven content generation.

### 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router, Server Actions)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 (with `@tailwindcss/typography`)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Translation**: `next-intl` (English, Spanish, French, German, Arabic, Portuguese)
- **Testing**: Vitest (Unit), Playwright (E2E)
- **AI/Automation**: OpenAI (GPT-5), Jina.ai (Search/Reader), Unsplash API

### 🧠 Core Concepts

#### Dual-API Hybrid System (`lib/api/index.ts`)
The app aggregates data from **TheMealDB** (Primary, Free) and **Spoonacular** (Secondary, Paid/Rich Data).
- **Hybrid Mode**: Tries MealDB first. If data is missing or insufficient (e.g., diet filters), it gracefully falls back to Spoonacular.
- **Caching**: Aggressive caching in Supabase (`recipes` table) to minimize API costs and improve speed.

#### Internationalization (`[locale]`)
- **Strategy**: URL-based routing (`/en/...`, `/es/...`).
- **Middleware**: `proxy.ts` handles locale detection and redirection.
- **Data Translation**: Recipes are translated on-the-fly or pre-translated using `google-translate-api-x` and stored in Supabase.

#### Content Automation (`scripts/`)
- **Blog Generation**: `scripts/generate-blog-post.ts` is an autonomous agent that researches topics via Jina.ai, drafts content using GPT-5, and fetches images via Unsplash.
- **SEO Enrichment**: `scripts/enrich-recipe-seo.ts` augments basic recipe data with rich metadata (nutrition, history) for better ranking.

---

## 2. Project Structure Map

```
dishshuffle/
├── app/
│   ├── [locale]/           # Internationalized routes (Core UI)
│   ├── api/                # Next.js API Routes
│   └── globals.css         # Global styles & Tailwind directives
├── lib/
│   ├── api/                # Unified API Layer (TheMealDB + Spoonacular logic)
│   ├── supabase/           # Database clients & types
│   ├── services/           # Business logic (Translation, SEO)
│   └── utils/              # Helpers (Validation, Formatting)
├── scripts/                # Node.js Automation Scripts (Blog, SEO, Maintenance)
├── messages/               # i18n JSON files (en.json, es.json, fr.json)
└── supabase/               # Migrations & Config
```

---

## 3. Key Workflows & Commands

### 🚀 Development
```bash
npm run dev      # Start dev server (localhost:3000)
npm run lint     # Code quality check
```

### 🧪 Testing
```bash
npm run test     # Run Unit tests (Vitest)
npm run e2e      # Run E2E tests (Playwright)
```

### ✍️ Content Generation (AI)
**Generate a Long-Form Blog Post:**
```bash
npx tsx scripts/generate-blog-post.ts --topic "The Science of Sourdough" --category "Cooking Fundamentals"
```
*Flags:* `--dry-run` (skip DB save), `--output` (print to console).

**Enrich Recipe Data:**
```bash
npm run enrich:seo
```

---

## 4. Coding Standards & Best Practices

1.  **Strict Typing**: Avoid `any`. Use defined types in `lib/types`.
2.  **Server Components**: Default to Server Components. Use `"use client"` only for interactivity (hooks, event listeners).
3.  **Performance**:
    -   Use `next/image` for all media.
    -   Implement aggressive data caching where possible.
4.  **Error Handling**:
    -   API calls must fail gracefully (return `null` or empty array), never crash the page.
    -   Use UI Fallbacks (`loading.tsx`, `error.tsx`).

## 5. Environment Variables (.env.local)

Required keys for full functionality:
-   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
-   `SUPABASE_SERVICE_ROLE_KEY` (For admin scripts)
-   `OPENAI_API_KEY` (For Blog/SEO generation)
-   `JINA_API_KEY` (For Research)
-   `UNSPLASH_ACCESS_KEY` (For Images)
-   `RECIPE_API_PROVIDER` (Set to `hybrid`)
