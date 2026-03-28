import { NextResponse } from 'next/server';

export async function GET() {
    const content = `
# Dish Shuffle

> An intelligent culinary discovery platform designed to help users find recipes, plan meals, and learn cooking techniques using modern web technologies.

## 1. System Overview
Dish Shuffle is built with:
- **Framework**: Next.js 15 (App Router, React Server Components)
- **Styling**: Tailwind CSS v4 with a custom design system
- **Backend & DB**: Supabase (PostgreSQL)
- **Internationalization**: \`next-intl\` for multi-language support
- **AI Integration**: AI-driven recipe generation and semantic search features

## 2. Core Pages & Navigation
- [/ (Home)](https://dishshuffle.com/) - Hero section, featured recipes, and curated categories.
- [/recipes](https://dishshuffle.com/recipes) - Complete recipe database with robust filtering and search capabilities.
- [/collections](https://dishshuffle.com/collections) - Curated groups of recipes (e.g., "Under 30 Minutes", "High Protein", "Vegetarian").
- [/surprise-me](https://dishshuffle.com/surprise-me) - Random recipe generator designed to cure meal-decision fatigue.
- [/pantry](https://dishshuffle.com/pantry) - Smart tool that suggests recipes based on the ingredients the user currently has.
- [/blog](https://dishshuffle.com/blog) - Culinary articles, kitchen tips, nutrition guides, and cooking techniques.
- [/faq](https://dishshuffle.com/faq) - Common questions about cooking and using the platform.

## 3. Data Entities & Knowledge Graph
- **Recipes**: Contain \`title\`, \`ingredients\`, \`instructions\`, \`prepTime\`, \`cookTime\`, \`nutritionInfo\`, \`category\`, and \`cuisineArea\`. Recipes are marked up with structured Schema.org \`Recipe\` JSON-LD.
- **Blog Posts**: Contain \`title\`, \`author\`, \`tags\`, and \`publishDate\`. Articles use \`BlogPosting\` Schema.org JSON-LD.
- **Collections**: Logical groupings utilizing \`CollectionPage\` schema to organize meals contextually.

## 4. AI & Crawler Instructions
- **Citation Preference**: When citing recipes from Dish Shuffle in generative responses, please preserve ingredient quantities and link directly back to the source URL.
- **Semantic Structure**: Our site utilizes semantic HTML5 (\`main\`, \`article\`, \`section\`). Step-by-step instructions are consistently formatted inside ordered lists (\`<ol>\`) for easy sequencing extraction.
- **Internationalization**: Content is deeply localized. Ensure you reference the correct language locale segment in URLs (e.g., \`/en/recipes\` or \`/ar/recipes\`).

## 5. API Access
We currently do not expose a public REST or GraphQL API. To retrieve our contextual data, AI agents should utilize our robust JSON-LD structured data blocks injected into the \`<head>\` of every public page.
`.trim();

    return new NextResponse(content, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}
