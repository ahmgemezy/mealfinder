/**
 * Blog Post Generator Script (Long Form)
 *
 * Strategy:
 * 1. Research (JINA.ai)
 * 2. Architect (Outline Generation) - 15-20 sections
 * 3. Write (Recursive Section Expansion) - 500+ words per section
 * 4. Assemble & Optimize
 *
 * Target: 7500+ words of high-quality, SEO-optimized content.
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env.local if it exists (for local development keys)
if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local', override: true });
}

// ============================================================================
// Configuration
// ============================================================================

const JINA_SEARCH_URL = "https://s.jina.ai/";
const JINA_READER_URL = "https://r.jina.ai/";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseServiceKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseServiceKey);
    } catch (e) {
        console.warn("⚠️ Failed to initialize Supabase client:", e);
    }
} else {
    console.warn("⚠️ Supabase credentials missing or invalid. Database operations will fail.");
}

const AUTHORS = [
    "Chef Alex", "Sarah Jenkins", "Dr. Emily Foodsci", "Giulia Rossi",
    "Marcus Chen", "Elena Rodriguez", "James Oliver", "Priya Patel",
    "Sophie Dubois", "Kenji Yamamoto"
];

const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
    "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&q=80",
];

const BLOG_CATEGORIES = [
    "Cooking Fundamentals",
    "Diet & Nutrition",
    "Cuisine Exploration",
    "Cooking Tips & Trends",
    "Budget-Friendly Eats",
    "Quick & Easy",
    "Seasonal Spotlight",
    "Kitchen Gear & Gadgets",
    "Entertaining & Hosting",
    "Ingredient Deep Dive",
] as const;

type BlogCategory = (typeof BLOG_CATEGORIES)[number];

// Category-specific word targets (+30% from original baselines, matched to search intent)
const CATEGORY_CONFIG: Record<BlogCategory, { targetWords: number; sectionCount: number; focusNote: string }> = {
    "Quick & Easy": { targetWords: 1125, sectionCount: 6, focusNote: "Focus on efficiency, shortcuts, and time-saving hacks. Readers want fast answers." },
    "Cooking Tips & Trends": { targetWords: 1500, sectionCount: 8, focusNote: "Blend practical advice with trending techniques. Include 'Chef Hacks'." },
    "Budget-Friendly Eats": { targetWords: 1650, sectionCount: 10, focusNote: "Emphasize cost breakdowns, meal prep, and smart shopping tips." },
    "Cooking Fundamentals": { targetWords: 2250, sectionCount: 12, focusNote: "Be comprehensive. Explain the 'why' (science, Maillard reaction, emulsification)." },
    "Ingredient Deep Dive": { targetWords: 2625, sectionCount: 14, focusNote: "Cover history, varieties, storage, cooking methods, and substitutions." },
    "Kitchen Gear & Gadgets": { targetWords: 1950, sectionCount: 10, focusNote: "Heavy on product comparisons. MUST include Amazon affiliate links." },
    "Entertaining & Hosting": { targetWords: 1950, sectionCount: 10, focusNote: "Focus on planning, presentation, and crowd-pleasers." },
    "Seasonal Spotlight": { targetWords: 1950, sectionCount: 10, focusNote: "Focus on evergreen seasonal concepts (spring produce, winter warmers), not specific holidays." },
    "Diet & Nutrition": { targetWords: 1875, sectionCount: 10, focusNote: "Be authoritative but accessible. Cite nutritional benefits without medical claims." },
    "Cuisine Exploration": { targetWords: 2100, sectionCount: 12, focusNote: "Cultural context is key. Include history, regional variations, and authentic techniques." },
};

// Fetch random recipe slugs from Supabase for internal linking
async function getInternalRecipeLinks(count: number = 8): Promise<string[]> {
    if (!supabase) return [];
    try {
        const { data } = await supabase
            .from('recipes')
            .select('id, data')
            .limit(count * 2); // Fetch more to have variety

        if (!data || data.length === 0) return [];

        // Shuffle and pick 'count' recipes
        const shuffled = data.sort(() => Math.random() - 0.5).slice(0, count);
        return shuffled.map(r => {
            const name = r.data?.name || 'Recipe';
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return `[${name}](/recipes/${slug}-${r.id})`;
        });
    } catch {
        return [];
    }
}

// ============================================================================
// Types
// ============================================================================

interface JinaSearchResult {
    title: string;
    url: string;
    content: string;
    description?: string;
}

interface OutlineSection {
    heading: string;
    description: string;
    estimatedWords: number;
}

interface BlogPostOutline {
    slug: string;
    title: string;
    description: string; // Meta description
    tags: string[];
    excerpt: string;
    sections: OutlineSection[];
    infographicPrompt: string;
}

interface GeneratedBlogPost {
    slug: string;
    title: string;
    description: string;
    category: BlogCategory;
    tags: string[];
    author: string;
    publishedDate: string;
    readTime: number;
    featuredImage: string;
    excerpt: string;
    content: string;
}

interface CLIArgs {
    topic: string;
    category: BlogCategory;
    author?: string;
    output: boolean;
    dryRun: boolean;
}

// ============================================================================
// Logic
// ============================================================================

async function searchWithJina(query: string): Promise<JinaSearchResult[]> {
    const apiKey = process.env.JINA_API_KEY;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    console.log(`🔍 Searching JINA.ai for: "${query}"...`);
    try {
        const response = await fetch(`${JINA_SEARCH_URL}${encodeURIComponent(query)}`, { headers });
        if (!response.ok) throw new Error(`JINA search failed: ${response.status}`);
        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (data.data || []).slice(0, 5).map((item: any) => ({
            title: item.title || "",
            url: item.url || "",
            content: item.content || "",
            description: item.description || "",
        }));
    } catch (error) {
        console.error("❌ JINA search error:", error);
        return [];
    }
}

async function readWithJina(url: string): Promise<string> {
    const apiKey = process.env.JINA_API_KEY;
    const headers: Record<string, string> = { Accept: "text/plain", "x-with-generated-alt": "true" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    try {
        const response = await fetch(`${JINA_READER_URL}${url}`, { headers });
        if (!response.ok) return "";
        return (await response.text()).slice(0, 30000);
    } catch {
        return "";
    }
}

// Reuse image search from previous version
async function searchImagesWithJina(topic: string): Promise<string[]> {
    const apiKey = process.env.JINA_API_KEY;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    try {
        const response = await fetch(`${JINA_SEARCH_URL}${encodeURIComponent(topic + " food photography")}`, { headers });
        if (!response.ok) return [];
        const data = await response.json();
        return (data.data || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((item: any) => item.url)
            .filter((url: string) => /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url))
            .slice(0, 5);
    } catch {
        return [];
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function openaiChat(messages: any[], model = "gpt-5-mini", maxTokens = 25000) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is required.");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model,
            messages,
            max_completion_tokens: maxTokens,
        }),
        signal: AbortSignal.timeout(600000), // 10 minutes timeout for deep reasoning
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`❌ OpenAI API Error (${response.status} ${response.statusText}):`, errorBody);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
        console.error("❌ OpenAI Response missing content:", JSON.stringify(data, null, 2));
        return "";
    }
    return content;
}

/**
 * Fallback: Simulate research using OpenAI's internal knowledge base
 * This is used when Jina.ai search fails (e.g. 402 Payment Required).
 */
async function simulateResearchWithOpenAI(topic: string): Promise<string> {
    console.log(`⚠️  Jina Search failed. Switching to OpenAI Knowledge Base for research on: "${topic}"...`);

    const systemPrompt = `You are a research assistant for a culinary blog. 
The user needs a comprehensive research briefing on the topic: "${topic}".
Since external search is unavailable, you must synthesize a detailed research document from your internal knowledge.

Include the following sections:
1.  **History & Origins**: Cultural background, evolution of the dish/ingredient.
2.  **Scientific Principles**: Chemical reactions (Maillard, gluten development, etc.), cooking physics.
3.  **Key Culinary Facts**: Varieties, seasonality, best practices.
4.  **Common FAQs**: 5-7 questions and detailed answers.
5.  **Product Trends**: Popular tools/brands associated with this topic (for valid recommendations).

Format the output as a structured text document. Be factually accurate and detailed.`;

    const userPrompt = `Generate research material for: "${topic}"`;

    try {
        return await openaiChat([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ], "gpt-5-mini", 25000); // High token limit for detailed research
    } catch (e) {
        console.error("❌ Critical: OpenAI simulation also failed.", e);
        return "";
    }
}

// ----------------------------------------------------------------------------
// Step 1: Generate Outline
// ----------------------------------------------------------------------------
async function generateOutline(
    topic: string,
    sourceMaterial: string,
    category: BlogCategory,
    internalLinks: string[]
): Promise<BlogPostOutline> {
    console.log("🏗️  Step 1: Architecting Outline...");

    const config = CATEGORY_CONFIG[category];
    const wordsPerSection = Math.ceil(config.targetWords / config.sectionCount);

    const systemPrompt = `You are the Editor-in-Chief of "Dish Shuffle", a premium culinary discovery platform.
You are designing the structure for a ${config.targetWords}-word authority article in the "${category}" category.

**CATEGORY FOCUS**: ${config.focusNote}

Your goal is to break this topic down into ${config.sectionCount} discrete, high-value sections.

Output strictly JSON with this schema:
{
  "slug": "url-slug",
  "title": "A Click-Worthy, SEO-Optimized Title",
  "description": "Meta description (150 chars)",
  "tags": ["Tag1", "Tag2"],
  "excerpt": "Engaging summary.",
  "infographicPrompt": "Visual description for a summary chart.",
  "sections": [
    { 
      "heading": "Section H2 Title", 
      "description": "Exact instructions for what to write here. Be specific about data, examples, or tips to include.", 
      "estimatedWords": ${wordsPerSection}
    }
  ]
}

Requirements:
1.  **Structure**:
    -   Introduction (Hook + Value Prop)
    -   ${config.sectionCount - 4} Content Body Sections (H2s)
    -   **Recommended Gear / Ingredients** (Dedicated Section for Affiliate Links)
    -   FAQ Section (mandatory - at least 5 questions)
    -   Conclusion
2.  **Depth**: Each section must be detailed enough to guide a writer to produce ${wordsPerSection} words.
3.  **Flow**: Ensure logical progression (History -> Science -> How-To -> Advanced -> Troubleshooting).
4.  **EEAT (Experience-Expertise-Authority-Trust)**: 
    -   Demonstrate expertise naturally through deep knowledge and practical advice.
    -   Avoid forced phrases like "In our test kitchen". Instead, write as an expert sharing hard-earned wisdom.
5.  **Monetization**: Recommend highly relevant tools/ingredients. Target 10-12 TOTAL Amazon links for the entire article. DO NOT SPAM.
6.  **Reader Value**: Include "💡 Pro Tip" callouts ONLY where they add genuine value. Do not force them into every section.
7.  **Internal Linking**: Naturally incorporate these recipe links where relevant:
    ${internalLinks.join(', ')}
`;

    const userPrompt = `Topic: "${topic}"
Category: "${category}"
Source Material Preview:
${sourceMaterial.slice(0, 10000)}

Create the Master Outline for a ${config.targetWords}-word article.`;

    const raw = await openaiChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ]);

    try {
        const sanitized = raw.replace(/```json|```/g, "").trim();
        return JSON.parse(sanitized);
    } catch (e) {
        console.error("Failed to parse outline JSON", raw);
        throw e;
    }
}

// ----------------------------------------------------------------------------
// Step 2: Write Single Section
// ----------------------------------------------------------------------------
async function writeSection(
    topic: string,
    section: OutlineSection,
    previousContext: string,
    sourceMaterial: string
): Promise<string> {
    console.log(`✍️  Writing Section: "${section.heading}"...`);

    const systemPrompt = `You are a specialized senior food writer for "Dish Shuffle", a premium culinary platform.
You are writing ONE specific section of an authority guide on "${topic}".

Your Task: Write the content for the section "${section.heading}".
Target Length: ${section.estimatedWords} words (Minimum ${Math.max(300, section.estimatedWords - 100)}).

**CRITICAL FORMATTING RULES (for Mobile Readability)**:
1.  **Short Paragraphs**: Maximum 3 sentences per paragraph. No walls of text.
2.  **H3 Subheadings**: Use H3s every 200-300 words to break up content.
3.  **Bold Key Terms**: Highlight important words to aid scanning.
4.  **Bullet Points**: Use lists for steps or multi-item information.

**CONTENT QUALITY RULES (for EEAT & SEO)**:
1.  **Natural Voice**: Write in a conversational, authoritative tone (like Serious Eats or Bon Appétit). Avoid robotic transitions.
2.  **Contextual Expertise**: Explain the "why" behind techniques (e.g., why brown butter tastes nutty) naturally, without forcing scientific jargon unless necessary.
3.  **Pro Tip Callout**: OPTIONAL. Include one ONLY if you have a specific, actionable tip that isn't obvious text.
    \`\`\`
    > **💡 Pro Tip:** [Your actionable advice here.]
    \`\`\`
4.  **Tone**: Authoritative, scientific yet accessible (Serious Eats / NYT Cooking style).
5.  **Flow**: Ensure smooth transition from the previous section (context provided below).

**MONETIZATION (RESTRICTED - QUALITY OVER QUANTITY)**:
- Include Amazon Search Links ONLY for specific, high-value recommendations.
- **LIMIT**: Maximum 1-2 links per section. Do not spam.
- **CRITICAL**: NEVER use direct product links (like /dp/B00... or /gp/product/...). They break. ONLY use SEARCH links.
- Format: [Product Name](https://www.amazon.com/s?k=Product+Name&tag=dishshuffle-20)
- Example: "For best results, use a [Lodge Cast Iron Skillet](https://www.amazon.com/s?k=Lodge+Cast+Iron+Skillet&tag=dishshuffle-20)."
`;

    const userPrompt = `
SECTION TO WRITE: "${section.heading}"
INSTRUCTIONS: ${section.description}

PREVIOUS CONTEXT (Last 500 words written):
"...${previousContext.slice(-1500)}..."

SOURCE MATERIAL (Use for facts / data):
${sourceMaterial.slice(0, 15000)}

Start writing the markdown content for this section now.`;

    return await openaiChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ], "gpt-5-mini", 16000);
}

// ----------------------------------------------------------------------------
// Main Orchestrator
// ----------------------------------------------------------------------------
async function generateLongFormPost(
    topic: string,
    category: BlogCategory,
    sourceMaterial: string,
    author: string,
    availableImages: string[]
): Promise<GeneratedBlogPost> {

    // 0. Fetch internal recipe links for SEO
    console.log("🔗 Fetching internal recipe links...");
    const internalLinks = await getInternalRecipeLinks(8);
    console.log(`   Found ${internalLinks.length} recipes for internal linking.`);

    // 1. Generate Outline (with category config)
    const config = CATEGORY_CONFIG[category];
    const outline = await generateOutline(topic, sourceMaterial, category, internalLinks);
    console.log(`PLAN: ${outline.sections.length} sections, Target ~${config.targetWords} words.`);

    // 2. Loop and Write
    let fullContent = "";
    let wordCount = 0;

    for (const [index, section] of outline.sections.entries()) {
        console.log(`\n[${index + 1}/${outline.sections.length}]Processing: ${section.heading} `);

        let sectionContent = await writeSection(topic, section, fullContent, sourceMaterial);

        // Add H2 header if missing (AI sometimes skips it if prompted to "start directly")
        if (!sectionContent.trim().startsWith("#")) {
            sectionContent = `## ${section.heading} \n\n${sectionContent} `;
        }

        fullContent += `\n\n${sectionContent} `;
        wordCount += sectionContent.split(/\s+/).length;
        console.log(`   > Added ~${sectionContent.split(/\s+/).length} words.Total: ${wordCount} `);
    }

    // 3. Assemble
    // Select Image
    const featuredImage = availableImages.length > 0 ? availableImages[0] : FALLBACK_IMAGES[0];

    return {
        slug: outline.slug,
        title: outline.title,
        description: outline.description,
        excerpt: outline.excerpt,
        tags: outline.tags,
        category,
        author,
        publishedDate: new Date().toISOString(),
        readTime: Math.ceil(wordCount / 200), // ~200 wpm
        featuredImage, // Simplification for now
        content: fullContent.trim()
    };
}

// ============================================================================
// Database & Utils
// ============================================================================

async function saveBlogPostToSupabase(post: GeneratedBlogPost): Promise<boolean> {
    if (!supabase) {
        console.error("❌ Supabase client is not initialized. Cannot save.");
        return false;
    }

    console.log(`💾 Saving blog post "${post.title}" to Supabase...`);
    try {
        const { error } = await supabase
            .from('blog_posts')
            .upsert({
                slug: post.slug,
                title: post.title,
                excerpt: post.excerpt,
                content: post.content,
                category: post.category,
                author: post.author,
                featured_image: post.featuredImage,
                tags: post.tags,
                read_time: post.readTime,
                published_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'slug' });

        if (error) throw error;
        console.log("✅ Saved to Supabase!");
        return true;
    } catch (err) {
        console.error("❌ Failed to save:", err);
        return false;
    }
}

function parseArgs(): CLIArgs {
    const args = process.argv.slice(2);
    const result: CLIArgs = { topic: "", category: "Cooking Fundamentals", output: false, dryRun: false };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--topic" && args[i + 1]) { result.topic = args[++i]; }
        else if (args[i] === "--category" && args[i + 1]) {
            const cat = args[++i] as BlogCategory;
            if (BLOG_CATEGORIES.includes(cat)) result.category = cat;
        }
        else if (args[i] === "--author" && args[++i]) { result.author = args[i]; }
        else if (args[i] === "--output") { result.output = true; }
        else if (args[i] === "--dry-run") { result.dryRun = true; }
    }
    return result;
}

// ============================================================================
// Execution
// ============================================================================

async function main() {
    console.log("\n🚀 Dish Shuffle Long-Form Generator\n");
    const args = parseArgs();

    if (!args.topic) {
        console.log("Usage: npx tsx scripts/generate-blog-post.ts --topic \"Top 10 Italian Cheeses\"");
        process.exit(1);
    }

    try {
        // 1. Research
        let combinedSource = "";
        const images: string[] = [];

        try {
            console.log("🔍 Attempting JINA.ai search...");
            const searchResults = await searchWithJina(args.topic);
            const faqResults = await searchWithJina(`${args.topic} questions`);
            const productResults = await searchWithJina(`best ${args.topic} products tools amazon review`);

            // Check if we actually got results (Jina might return empty array silently or throw)
            if (searchResults.length === 0) throw new Error("No Jina results found (likely API issue)");

            console.log("📖 Reading sources...");
            for (const res of searchResults.slice(0, 3)) {
                const text = await readWithJina(res.url);
                combinedSource += `\nSOURCE: ${res.title} \n${text} \n`;
            }
            for (const faq of faqResults.slice(0, 3)) {
                combinedSource += `\nFAQ CONTEXT: ${faq.title} \n${faq.description} \n`;
            }
            for (const prod of productResults.slice(0, 5)) {
                combinedSource += `\nPRODUCT RECOMMENDATION: ${prod.title} \n${prod.description} \n`;
            }

            const jinaImages = await searchImagesWithJina(args.topic);
            images.push(...jinaImages);

        } catch (error) {
            console.warn(`⚠️ Research failed: ${(error as any).message}. Using OpenAI Fallback.`);
            combinedSource = await simulateResearchWithOpenAI(args.topic);
            if (!combinedSource) {
                throw new Error("Both Jina and OpenAI Fallback failed to provide source material.");
            }
        }

        // 2. Generate
        const author = args.author || AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
        const post = await generateLongFormPost(args.topic, args.category, combinedSource, author, images);

        // 3. Output
        if (args.dryRun || args.output) {
            console.log("\n🚧 DRY RUN / OUTPUT MODE");
            console.log(`Title: ${post.title} `);
            console.log(`Words: ${post.content.split(/\s+/).length} `);
            if (args.output) console.log(post.content);
        } else {
            await saveBlogPostToSupabase(post);
        }
    } catch (e) {
        console.error("FATAL ERROR:", e);
        process.exit(1);
    }
}

main();
