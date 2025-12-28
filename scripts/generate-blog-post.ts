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
    "Quick & Easy": { targetWords: 1125, sectionCount: 3, focusNote: "Focus on efficiency, shortcuts, and time-saving hacks. Readers want fast answers." },
    "Cooking Tips & Trends": { targetWords: 1500, sectionCount: 4, focusNote: "Blend practical advice with trending techniques. Include 'Chef Hacks'." },
    "Budget-Friendly Eats": { targetWords: 1650, sectionCount: 5, focusNote: "Emphasize cost breakdowns, meal prep, and smart shopping tips." },
    "Cooking Fundamentals": { targetWords: 2250, sectionCount: 6, focusNote: "Be comprehensive. Explain the 'why' (science, Maillard reaction, emulsification)." },
    "Ingredient Deep Dive": { targetWords: 2625, sectionCount: 7, focusNote: "Cover history, varieties, storage, cooking methods, and substitutions." },
    "Kitchen Gear & Gadgets": { targetWords: 1950, sectionCount: 5, focusNote: "Heavy on product comparisons. MUST include Amazon affiliate links." },
    "Entertaining & Hosting": { targetWords: 1950, sectionCount: 5, focusNote: "Focus on planning, presentation, and crowd-pleasers." },
    "Seasonal Spotlight": { targetWords: 1950, sectionCount: 5, focusNote: "Focus on evergreen seasonal concepts (spring produce, winter warmers), not specific holidays." },
    "Diet & Nutrition": { targetWords: 1875, sectionCount: 5, focusNote: "Be authoritative but accessible. Cite nutritional benefits without medical claims." },
    "Cuisine Exploration": { targetWords: 2100, sectionCount: 6, focusNote: "Cultural context is key. Include history, regional variations, and authentic techniques." },
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
    keywords?: string[];
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
    featuredImage?: string;
    output: boolean;
    dryRun: boolean;
}

// ============================================================================
// AI Configuration (OpenAI SDK)
// ============================================================================

import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 5, // Retry up to 5 times for 502/503 errors
    timeout: 180000, // 3 minutes timeout
});

// Zod Schemas for Structured Outputs

const VisualSearchTermsSchema = z.object({
    terms: z.array(z.string()),
});

const OutlineSectionSchema = z.object({
    heading: z.string(),
    description: z.string(),
    estimatedWords: z.number(),
    keywords: z.array(z.string()),
});

const BlogPostOutlineSchema = z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    excerpt: z.string(),
    sections: z.array(OutlineSectionSchema),
    infographicPrompt: z.string(),
});

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

// ============================================================================
// Image Logic
// ============================================================================

async function getVisualSearchTerms(topic: string): Promise<string[]> {
    const systemPrompt = "You are a visual research assistant. Generate 3 distinct search keywords (MAX 1-2 words each) to find high-quality images on Unsplash for the given topic. Avoid long phrases.";
    const userPrompt = `Topic: "${topic}"`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: zodResponseFormat(VisualSearchTermsSchema, "search_terms"),
        });

        const content = completion.choices[0].message.content;
        if (content) {
            const parsed = JSON.parse(content);
            const result = VisualSearchTermsSchema.parse(parsed);
            return result.terms;
        }
        return [topic];
    } catch (e) {
        console.warn("⚠️ Visual search terms generation failed, using topic.", e);
        return [topic, topic.split(" ")[0], "Food"];
    }
}

async function searchImagesWithUnsplash(query: string): Promise<string[]> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
    if (!accessKey) {
        console.warn("⚠️  Missing UNSPLASH_ACCESS_KEY. Skipping Unsplash search.");
        return [];
    }

    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
            { headers: { Authorization: `Client-ID ${accessKey}` } }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error(`❌ Unsplash API Error (${response.status}): ${errText}`);
            return [];
        }

        const data = await response.json();
        if (data.results.length === 0) {
            console.log(`⚠️  Unsplash returned 0 results for query: "${query}"`);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.results.map((img: any) => `${img.urls.raw}&w=1200&q=80`);
    } catch (e) {
        console.error("❌ Unsplash Network/Parse Error:", e);
        return [];
    }
}

// Helper for general chat (non-structured) using SDK
async function openaiChat(messages: any[], model = "gpt-4o", maxTokens = 16000) {
    try {
        const completion = await openai.chat.completions.create({
            model: model === "gpt-5" ? "gpt-4o" : model, // Fallback mapping if gpt-5 not available/mocked
            messages,
            max_tokens: maxTokens,
        });
        return completion.choices[0]?.message?.content || "";
    } catch (e) {
        console.error("❌ OpenAI API Error:", e instanceof Error ? e.message : String(e));
        throw e; // Rethrow to let caller handle or fail
    }
}

/**
 * Fallback: Simulate research using OpenAI's internal knowledge base
 * This is used when Jina.ai search fails (e.g. 402 Payment Required).
 */
async function conductDeepResearch(topic: string): Promise<string> {
    console.log(`🧠 Conducting Deep-Dive Research on: "${topic}"...`);

    // Prompt engineered to simulate an "Expert" searching for non-obvious data
    const systemPrompt = `You are an elite Investigative Journalist and Subject Matter Expert.
Your goal is to provide a "Deep Dive" research briefing on the topic.

RULES for Research:
1.  **NO FLUFF**: Do not write generic intros. Go straight to the hard facts.
2.  **SPECIFICITY**: Cite specific techniques, scientific principles, dates, or expert consensus.
3.  **CONTRARIAN VIEWS**: Mention common myths vs. reality.
4.  **HUMAN ELEMENT**: focused on what actually matters to the user (pain points, real benefits).
5.  **DATA POINTS**: If applicable, estimate numbers/stats based on your training (e.g. "cooking temps", "gear weight").

Format:
-   **Key Concepts**: 3-5 core technical or practical pillars.
-   **Common Pitfalls**: What do beginners get wrong?
-   **Expert Tips**: 3 nuances only pros know.
-   **SEO Entities**: List 10 semantic keywords associated with this topic.`;

    const userPrompt = `Topic: "${topic}"
    
    Give me the raw research material needed to write the best article on the internet about this.`;

    return openaiChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ], "gpt-4o", 2000);
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


    const systemPrompt = `You are the Editor-in-Chief of "Dish Shuffle".
You are designing the structure for a ${config.targetWords}-word authority article in the "${category}" category.

**PHILOSOPHY**: "Value over Volume". We want to solve the reader's problem, not just fill space.

**GOAL**: Create a "Human" Narrative Arc.
-   Avoid "Robot" structures (e.g. "Introduction -> Body -> Conclusion").
-   Use "Hook-based" headings that promise value (e.g. instead of "Benefits", use "Why This Changes Everything").
-   Ensure logical flow: Step 1 leads to Step 2.

**CATEGORY FOCUS**: ${config.focusNote}

Your goal is to break this topic down into ${config.sectionCount} discrete, high-value sections.

Requirements:


Requirements:
1.  **Structure**:
    -   Introduction (Hook + Value Prop)
    -   ${config.sectionCount - 3} Content Body Sections (H2s)
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

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: zodResponseFormat(BlogPostOutlineSchema, "blog_outline"),
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content returned for outline");

        const parsed = JSON.parse(content);
        return BlogPostOutlineSchema.parse(parsed);
    } catch (e) {
        console.error("Failed to parse outline JSON", e);
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
    sourceMaterial: string,
    internalLinks: string[]
): Promise<string> {
    console.log(`✍️  Writing Section: "${section.heading}"...`);

    const systemPrompt = `You are a Senior Feature Writer for a top-tier magazine (like NYT Cooking, Serious Eats, or Bon Appétit).

**TONE & STYLE GUIDE**:
1.  **HUMAN**: Write like a knowledgeable friend, not a textbook. Be opinionated, witty, and warm.
2.  **DIRECT**: Use active voice. Cut the fluff. Never use phrases like "In this section", "It is important to note", or "Let's delve into".
3.  **ANTI-HALLUCINATION**: Do not invent products or studies. If unsure, generalize (e.g. "Many experts say...") or omit.
4.  **VOCABULARY**: Ban these AI-words: *delve, tapestry, landscape, myriad, crucial, paramount, realm, game-changer*.
5.  **FORMATTING**: Use short paragraphs (2-3 sentences). Use bullet points for readability.

**CONTEXT**:
-   Article Name: "${topic}"
-   Section Topic: "${section.heading}"
-   Role in Article: ${section.description}

**SEO**: Naturally weave in these keywords if relevant: ${section.keywords || []}.

**INTERNAL LINKS (CRITICAL)**:
You have access to these recipes from our database:
${internalLinks.join(', ')}

**MANDATORY**: Try to naturally mention at least 1 of these recipes in this section if it fits the context.
-   Format: Use the markdown link exactly provided.
-   Example: "For a classic side, try our [Garlic Mashed Potatoes](/recipes/garlic-mashed-potatoes-123)."
-   Do NOT force it if it's completely irrelevant.

**GOAL**: Write a section that is so useful and engaging the reader shares it immediately.`;

    const userPrompt = `
SECTION TO WRITE: "${section.heading}"
INSTRUCTIONS: ${section.description}

PREVIOUS CONTEXT (Last 500 words written):
"...${previousContext.slice(-1500)}..."

SOURCE MATERIAL (Use for facts / data):
${sourceMaterial.slice(0, 15000)}

Start writing the markdown content for this section now.`;

    const rawOutput = await openaiChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ], "gpt-5", 12000);

    // CLEANING: Strip prompt leaks from headers and content
    return rawOutput
        .replace(/\(Affiliate Picks.*?\)/gi, "")
        .replace(/\(10[-–]12 Amazon Links\)/gi, "")
        .replace(/Anchor text:.*?(?=\n|$)/gi, "") // Remove "Anchor text: ..." lines
        .replace(/Did I mention.*?/gi, "")
        .replace(/Placement & linking guidance/gi, "")
        .replace(/Please add a short affiliate disclosure/gi, "")
        .replace(/In our test kitchen/gi, "In professional kitchens") // Soften the claim
        .trim();
}

// ----------------------------------------------------------------------------
// Main Orchestrator
// ----------------------------------------------------------------------------
async function generateLongFormPost(
    topic: string,
    category: BlogCategory,
    sourceMaterial: string,
    author: string,
    availableImages: string[],
    forcedFeaturedImage?: string
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

        let sectionContent = await writeSection(topic, section, fullContent, sourceMaterial, internalLinks);

        // Clean the heading just in case the AI leaked instructions into it
        const cleanHeading = section.heading.replace(/\(.*?\)/g, "").trim();

        // Add H2 header if missing (AI sometimes skips it if prompted to "start directly")
        if (!sectionContent.trim().startsWith("#")) {
            sectionContent = `## ${cleanHeading} \n\n${sectionContent} `;
        }

        fullContent += `\n\n${sectionContent} `;
        wordCount += sectionContent.split(/\s+/).length;
        console.log(`   > Added ~${sectionContent.split(/\s+/).length} words.Total: ${wordCount} `);
    }

    // 3. Assemble
    // 3. Assemble
    // Select Image
    const featuredImage = forcedFeaturedImage || (availableImages.length > 0 ? availableImages[0] : FALLBACK_IMAGES[0]);

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
        else if (args[i] === "--featured-image" && args[++i]) { result.featuredImage = args[i]; }
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

        } catch (error) {
            console.warn(`⚠️ Research failed: ${error instanceof Error ? error.message : String(error)}. Using OpenAI Deep Dive.`);
            combinedSource = await conductDeepResearch(args.topic);
            if (!combinedSource) {
                throw new Error("Both Jina and OpenAI Fallback failed to provide source material.");
            }
        }

        // 1b. Unsplash Image Search (ALWAYS RUN)
        console.log("📸 Generating visual search terms & fetching from Unsplash...");
        try {
            const visualTerms = await getVisualSearchTerms(args.topic);
            console.log(`   Terms: ${visualTerms.join(", ")}`);

            for (const term of visualTerms) {
                const unsplashImages = await searchImagesWithUnsplash(term);
                images.push(...unsplashImages);
            }
            console.log(`   Found ${images.length} images.`);
        } catch (err) {
            console.error("⚠️ Unsplash fetch failed:", err);
        }

        // 2. Generate
        const author = args.author || AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
        const post = await generateLongFormPost(args.topic, args.category, combinedSource, author, images, args.featuredImage);

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
