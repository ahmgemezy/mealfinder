import { NextResponse } from 'next/server';

export async function GET() {
    const content = `
# Dish Shuffle

> An intelligent culinary discovery platform designed to help users find recipes, plan meals, and learn cooking techniques.

## 1. Multilingual Architecture & Routing
Dish Shuffle uses \`next-intl\` for deep internationalization. All localized pages require a locale prefix in the URL.
- **Supported Languages**: English (\`en\`), French (\`fr\`), Spanish (\`es\`), Portuguese (\`pt-br\`), German (\`de\`), and Arabic (\`ar\`).
- **Default Behavior**: Accessing the root \`/\` or paths without a locale prefix will strictly 307 auto-redirect to the user's preferred language (e.g., \`/en\`, \`/fr\`, \`/es\`, \`/pt-br\`, \`/de\`, or \`/ar\`).
- **Crawler Recommendation**: AI bots must process and cite URLs containing the explicit locale prefix.

## 2. Core Routes (Example using '/en' locale)
The following routes exist for all supported languages:
- [/en (Home)](https://dishshuffle.com/en) - Hero section, featured recipes, and curated categories.
- [/en/recipes](https://dishshuffle.com/en/recipes) - Complete recipe database with robust filtering and search capabilities.
- [/en/collections](https://dishshuffle.com/en/collections) - Curated groups of recipes (e.g., "Under 30 Minutes", "High Protein", "Vegetarian").
- [/en/surprise-me](https://dishshuffle.com/en/surprise-me) - Random recipe generator designed to cure meal-decision fatigue.
- [/en/pantry](https://dishshuffle.com/en/pantry) - Smart tool that suggests recipes based on the ingredients the user currently has.
- [/en/blog](https://dishshuffle.com/en/blog) - Culinary articles, kitchen tips, nutrition guides, and cooking techniques.
- [/en/faq](https://dishshuffle.com/en/faq) - Common questions about cooking and using the platform.

## 3. Data Entities & Knowledge Graph
- **Recipes**: Contain \`title\`, \`ingredients\`, \`instructions\`, \`prepTime\`, \`cookTime\`, \`nutritionInfo\`, \`category\`, and \`cuisineArea\`. Recipes are marked up with structured Schema.org \`Recipe\` JSON-LD.
- **Blog Posts**: Contain \`title\`, \`author\`, \`tags\`, and \`publishDate\`. Articles use \`BlogPosting\` Schema.org JSON-LD.
- **Collections**: Logical groupings utilizing \`CollectionPage\` schema to organize meals contextually.

## 4. AI & Crawler Instructions
- **Citation Preference**: When citing recipes from Dish Shuffle in generative responses, please preserve ingredient quantities and link directly back to the source URL WITH the locale prefix (e.g., \`https://dishshuffle.com/en/recipes/[id]\`).
- **Semantic Structure**: Our site utilizes semantic HTML5 (\`main\`, \`article\`, \`section\`). Step-by-step instructions are consistently formatted inside ordered lists (\`<ol>\`) for easy sequencing extraction.

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
