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
            .map((item: any) => item.url)
            .filter((url: string) => /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url))
            .slice(0, 5);
    } catch {
        return [];
    }
}

async function openaiChat(messages: any[], model = "gpt-4o", maxTokens = 4096) {
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
            temperature: 0.7,
            max_tokens: maxTokens,
        }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

// ----------------------------------------------------------------------------
// Step 1: Generate Outline
// ----------------------------------------------------------------------------
async function generateOutline(topic: string, sourceMaterial: string): Promise<BlogPostOutline> {
    console.log("🏗️  Step 1: Architecting Outline...");

    const systemPrompt = `You are the Editor-in-Chief of "Dish Shuffle". 
You are designing the structure for a MASSIVE, 7500-word authority article.
Your goal is to break this topic down into at least 15-20 discrete, high-value sections.

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
      "estimatedWords": 600 
    }
  ]
}

Requirements:
1.  **Structure**:
    -   Introduction (Hook + Value Prop)
    -   12-15 Content Body Sections (H2s)
    -   FAQ Section (mandatory)
    -   Conclusion
2.  **Depth**: Each section description must be detailed enough to guide a writer to write 500-700 words.
3.  **Flow**: Ensure logical progression (History -> Science -> How-To -> Advanced -> Troubleshooting).
`;

    const userPrompt = `Topic: "${topic}"
Source Material Preview:
${sourceMaterial.slice(0, 10000)}

Create the Master Outline for a 7500-word article.`;

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

    const systemPrompt = `You are a specialized senior food writer.
You are writing ONE specific section of a massive 7500-word guide on "${topic}".

Your Task: Write the content for the section "${section.heading}".
Target Length: ${section.estimatedWords} words (Minimum 500).

Guidelines:
1.  **NO Intro/Outro**: Start directly with the content. Do not say "In this section...".
2.  **H3 usage**: Use H3s to break up the text further.
3.  **Density**: Use markdown bullet points, bold text for emphasis, and tables where appropriate.
4.  **Tone**: Authoritative, scientific yet accessible (Serious Eats style).
5.  **Context**: Ensure you flow smoothly from the previous thought (provided in context).
`;

    const userPrompt = `
SECTION TO WRITE: "${section.heading}"
INSTRUCTIONS: ${section.description}

PREVIOUS CONTEXT (Last 300 words written):
"...${previousContext.slice(-1000)}..."

SOURCE MATERIAL (Use for facts/data):
${sourceMaterial.slice(0, 15000)}

Start writing the markdown content for this section now.`;

    return await openaiChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ], "gpt-4o", 2048); // High token limit for response
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

    // 1. Generate Outline
    const outline = await generateOutline(topic, sourceMaterial);
    console.log(`PLAN: ${outline.sections.length} sections, Target ~${outline.sections.reduce((a, b) => a + b.estimatedWords, 0)} words.`);

    // 2. Loop and Write
    let fullContent = "";
    let wordCount = 0;

    for (const [index, section] of outline.sections.entries()) {
        console.log(`\n[${index + 1}/${outline.sections.length}] Processing: ${section.heading}`);

        let sectionContent = await writeSection(topic, section, fullContent, sourceMaterial);

        // Add H2 header if missing (AI sometimes skips it if prompted to "start directly")
        if (!sectionContent.trim().startsWith("#")) {
            sectionContent = `## ${section.heading}\n\n${sectionContent}`;
        }

        fullContent += `\n\n${sectionContent}`;
        wordCount += sectionContent.split(/\s+/).length;
        console.log(`   > Added ~${sectionContent.split(/\s+/).length} words. Total: ${wordCount}`);
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
        const searchResults = await searchWithJina(args.topic);
        const faqResults = await searchWithJina(`${args.topic} questions`);

        let combinedSource = "";
        let images: string[] = [];

        console.log("📖 Reading sources...");
        for (const res of searchResults.slice(0, 3)) {
            const text = await readWithJina(res.url);
            combinedSource += `\nSOURCE: ${res.title}\n${text}\n`;
        }
        for (const faq of faqResults.slice(0, 3)) {
            combinedSource += `\nFAQ CONTEXT: ${faq.title}\n${faq.description}\n`;
        }

        const jinaImages = await searchImagesWithJina(args.topic);
        images.push(...jinaImages);

        // 2. Generate
        const author = args.author || AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
        const post = await generateLongFormPost(args.topic, args.category, combinedSource, author, images);

        // 3. Output
        if (args.dryRun || args.output) {
            console.log("\n🚧 DRY RUN / OUTPUT MODE");
            console.log(`Title: ${post.title}`);
            console.log(`Words: ${post.content.split(/\s+/).length}`);
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
