/**
 * SEO Enricher Service
 * 
 * Uses JINA.ai to generate SEO metadata for recipes:
 * - FAQ structured data (highest SEO impact)
 * - Enhanced meta descriptions
 * - Long-tail keywords
 * - Internal linking suggestions
 * 
 * This service NEVER modifies original recipe data.
 */

"use server";

import { createClient } from "@supabase/supabase-js";
import { Recipe } from "@/lib/types/recipe";

// ============================================================================
// Configuration
// ============================================================================

const JINA_SEARCH_URL = "https://s.jina.ai/";
const JINA_READER_URL = "https://r.jina.ai/";

// Initialize Supabase client for caching
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ============================================================================
// Types
// ============================================================================

export interface FAQItem {
    question: string;
    answer: string;
}

export interface SEOEnrichment {
    recipeId: string;
    faq: FAQItem[];
    metaDescription: string;
    keywords: string[];
    culturalSnippet: string;
    relatedRecipes: string[];
    relatedBlogPosts: string[];
    enrichedAt: string;
}

interface JinaSearchResult {
    title: string;
    url: string;
    content: string;
    description?: string;
}

// ============================================================================
// JINA.ai API Functions
// ============================================================================

async function searchWithJina(query: string): Promise<JinaSearchResult[]> {
    const apiKey = process.env.JINA_API_KEY;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    try {
        const response = await fetch(
            `${JINA_SEARCH_URL}${encodeURIComponent(query)}`,
            { headers }
        );
        if (!response.ok) return [];
        const data = await response.json();
        return (data.data || []).slice(0, 5).map((item: Record<string, unknown>) => ({
            title: (item.title as string) || "",
            url: (item.url as string) || "",
            content: (item.content as string) || "",
            description: (item.description as string) || "",
        }));
    } catch {
        return [];
    }
}

async function readWithJina(url: string): Promise<string> {
    const apiKey = process.env.JINA_API_KEY;
    const headers: Record<string, string> = { Accept: "text/plain" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    try {
        const response = await fetch(`${JINA_READER_URL}${url}`, { headers });
        if (!response.ok) return "";
        return (await response.text()).slice(0, 15000);
    } catch {
        return "";
    }
}

// ============================================================================
// OpenAI Integration for Processing
// ============================================================================

async function openaiChat(
    messages: Array<{ role: string; content: string }>,
    maxTokens = 2048
): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is required");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.7,
            max_tokens: maxTokens,
        }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

// ============================================================================
// SEO Enrichment Functions
// ============================================================================

/**
 * Generate FAQ questions and answers for a recipe
 */
async function generateFAQ(
    recipe: Recipe,
    sourceContent: string
): Promise<FAQItem[]> {
    const prompt = `You are an SEO expert creating FAQ schema content for a recipe page.

Recipe: ${recipe.name}
Category: ${recipe.category || "General"}
Cuisine: ${recipe.area || "International"}
Ingredients: ${recipe.ingredients.map((i) => i.name).join(", ")}

Source Research:
${sourceContent.slice(0, 5000)}

Generate 5-7 frequently asked questions that people search for about this recipe.
Focus on:
- Common cooking questions ("How long to cook...", "Can I make ahead...")
- Storage questions ("How to store...", "How long does it last...")
- Technique questions ("Why does my... fail", "How to avoid...")
- Variation questions ("Can I use... instead")

Output as JSON array:
[
  { "question": "How long does X keep in the fridge?", "answer": "Up to 3 days..." }
]

Keep answers concise (50-100 words). Be helpful and accurate.`;

    try {
        const response = await openaiChat([
            { role: "system", content: "You are an SEO and culinary expert." },
            { role: "user", content: prompt },
        ]);

        const sanitized = response.replace(/```json|```/g, "").trim();
        return JSON.parse(sanitized);
    } catch {
        return [];
    }
}

/**
 * Generate CTR-optimized meta description
 */
async function generateMetaDescription(
    recipe: Recipe,
    sourceContent: string
): Promise<string> {
    const prompt = `Create a compelling meta description for this recipe page.

Recipe: ${recipe.name}
Category: ${recipe.category || "Main Course"}
Cuisine: ${recipe.area || "International"}
Cook Time: ${recipe.readyInMinutes || 30} minutes

Requirements:
- Maximum 155 characters
- Include primary keyword (recipe name)
- Add time if available
- Create urgency or interest
- Include a call-to-action vibe

Examples of great meta descriptions:
"Learn how to make Spaghetti Carbonara in 30 minutes. Classic Italian recipe with creamy egg sauce. Perfect for weeknight dinners!"

Output ONLY the meta description, no quotes or explanation.`;

    try {
        const response = await openaiChat([
            { role: "user", content: prompt },
        ]);
        return response.trim().slice(0, 160);
    } catch {
        return `Learn how to make ${recipe.name}. ${recipe.area || "Delicious"} ${recipe.category || "recipe"} ready in ${recipe.readyInMinutes || 30} minutes.`;
    }
}

/**
 * Generate long-tail keywords
 */
async function generateKeywords(recipe: Recipe): Promise<string[]> {
    const baseKeywords = [
        recipe.name.toLowerCase(),
        `${recipe.name.toLowerCase()} recipe`,
        `how to make ${recipe.name.toLowerCase()}`,
        `easy ${recipe.name.toLowerCase()}`,
    ];

    if (recipe.area) {
        baseKeywords.push(`${recipe.area.toLowerCase()} ${recipe.name.toLowerCase()}`);
        baseKeywords.push(`authentic ${recipe.area.toLowerCase()} recipe`);
    }

    if (recipe.category) {
        baseKeywords.push(`${recipe.category.toLowerCase()} recipe`);
    }

    if (recipe.readyInMinutes && recipe.readyInMinutes <= 30) {
        baseKeywords.push(`quick ${recipe.name.toLowerCase()}`);
        baseKeywords.push(`${recipe.readyInMinutes} minute ${recipe.category?.toLowerCase() || "recipe"}`);
    }

    return [...new Set(baseKeywords)].slice(0, 10);
}

/**
 * Generate cultural context snippet
 */
async function generateCulturalSnippet(
    recipe: Recipe,
    sourceContent: string
): Promise<string> {
    if (!recipe.area || recipe.area.trim() === "") {
        return "";
    }

    const prompt = `Write a brief cultural context for this recipe (2-3 sentences max).

Recipe: ${recipe.name}
Cuisine: ${recipe.area}

Research:
${sourceContent.slice(0, 3000)}

Focus on origin, tradition, or interesting cultural fact. Keep it under 100 words.
Output ONLY the snippet, no quotes.`;

    try {
        const response = await openaiChat([{ role: "user", content: prompt }]);
        return response.trim().slice(0, 300);
    } catch {
        return "";
    }
}

// ============================================================================
// Cache Management
// ============================================================================

/**
 * Get cached SEO enrichment from Supabase
 */
export async function getCachedEnrichment(
    recipeId: string
): Promise<SEOEnrichment | null> {
    if (!supabaseUrl || !supabaseServiceKey) return null;

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data, error } = await supabase
            .from("recipe_seo_enrichments")
            .select("*")
            .eq("recipe_id", recipeId)
            .single();

        if (error || !data) return null;

        // Check if cache is stale (older than 14 days)
        const enrichedAt = new Date(data.enriched_at);
        const now = new Date();
        const daysDiff = (now.getTime() - enrichedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff > 14) return null; // Cache expired

        return {
            recipeId: data.recipe_id,
            faq: data.faq || [],
            metaDescription: data.meta_description || "",
            keywords: data.keywords || [],
            culturalSnippet: data.cultural_snippet || "",
            relatedRecipes: data.related_recipes || [],
            relatedBlogPosts: data.related_posts || [],
            enrichedAt: data.enriched_at,
        };
    } catch {
        return null;
    }
}

/**
 * Save SEO enrichment to Supabase cache
 */
export async function cacheEnrichment(
    enrichment: SEOEnrichment
): Promise<boolean> {
    if (!supabaseUrl || !supabaseServiceKey) return false;

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { error } = await supabase.from("recipe_seo_enrichments").upsert(
            {
                recipe_id: enrichment.recipeId,
                faq: enrichment.faq,
                meta_description: enrichment.metaDescription,
                keywords: enrichment.keywords,
                cultural_snippet: enrichment.culturalSnippet,
                related_recipes: enrichment.relatedRecipes,
                related_posts: enrichment.relatedBlogPosts,
                enriched_at: new Date().toISOString(),
            },
            { onConflict: "recipe_id" }
        );

        return !error;
    } catch {
        return false;
    }
}

// ============================================================================
// Main Enrichment Function
// ============================================================================

/**
 * Enrich a recipe with SEO metadata
 * Returns cached data if available, otherwise generates new enrichment
 */
export async function enrichRecipeSEO(
    recipe: Recipe
): Promise<SEOEnrichment | null> {
    // 1. Check cache first
    const cached = await getCachedEnrichment(recipe.id);
    if (cached) {
        return cached;
    }

    // 2. Research with JINA
    console.log(`🔍 Enriching SEO for: ${recipe.name}`);

    const searchQuery = `${recipe.name} ${recipe.area || ""} recipe FAQ cooking tips`;
    const searchResults = await searchWithJina(searchQuery);

    // Compile source content
    let sourceContent = "";
    for (const result of searchResults.slice(0, 2)) {
        const content = await readWithJina(result.url);
        sourceContent += `\n${result.title}\n${content}\n`;
    }

    // 3. Generate enrichments in parallel
    const [faq, metaDescription, keywords, culturalSnippet] = await Promise.all([
        generateFAQ(recipe, sourceContent),
        generateMetaDescription(recipe, sourceContent),
        generateKeywords(recipe),
        generateCulturalSnippet(recipe, sourceContent),
    ]);

    const enrichment: SEOEnrichment = {
        recipeId: recipe.id,
        faq,
        metaDescription,
        keywords,
        culturalSnippet,
        relatedRecipes: [], // Could be populated by similarity search
        relatedBlogPosts: [], // Could be populated by tag matching
        enrichedAt: new Date().toISOString(),
    };

    // 4. Cache the result
    await cacheEnrichment(enrichment);

    return enrichment;
}

/**
 * Get SEO enrichment for recipe page (safe for use in pages)
 * Returns null if no enrichment available (won't block page render)
 */
export async function getRecipeSEO(
    recipe: Recipe
): Promise<SEOEnrichment | null> {
    try {
        // Only return cached data in production to avoid slow page loads
        // Enrichment happens via background script
        return await getCachedEnrichment(recipe.id);
    } catch {
        return null;
    }
}
