/**
 * Blog Post Generator Script
 *
 * Uses JINA.ai to search for content and OpenAI to rewrite it into original blog posts.
 *
 * Usage:
 *   npx ts-node scripts/generate-blog-post.ts --topic "meal prep tips" --category "Cooking Tips & Trends"
 *   npx ts-node scripts/generate-blog-post.ts --topic "Italian pasta" --category "Cuisine Exploration" --output
 */

import { loadEnvConfig } from '@next/env';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env* files
loadEnvConfig(process.cwd());

// ============================================================================

// Configuration
// ============================================================================

const JINA_SEARCH_URL = "https://s.jina.ai/";
const JINA_READER_URL = "https://r.jina.ai/";

const AUTHORS = [
    "Chef Alex", "Sarah Jenkins", "Dr. Emily Foodsci", "Giulia Rossi",
    "Marcus Chen", "Elena Rodriguez", "James Oliver", "Priya Patel",
    "Sophie Dubois", "Kenji Yamamoto"
];

const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", // Generic food
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80", // Salad/Fresh
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80", // Veggies/Prep
    "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&q=80", // Meat/Steak
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80", // Bowl/Healthy
    "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2b?w=800&q=80", // Soup/Warm
    "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80", // Breakfast/Eggs
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80", // Pasta/Italian
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

const CATEGORY_FILE_MAP: Record<BlogCategory, string> = {
    "Cooking Fundamentals": "fundamentals.ts",
    "Diet & Nutrition": "nutrition.ts",
    "Cuisine Exploration": "cuisine.ts",
    "Cooking Tips & Trends": "tips.ts",
    "Budget-Friendly Eats": "tips.ts",
    "Quick & Easy": "tips.ts",
    "Seasonal Spotlight": "tips.ts",
    "Kitchen Gear & Gadgets": "tips.ts",
    "Entertaining & Hosting": "tips.ts",
    "Ingredient Deep Dive": "fundamentals.ts",
};

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

interface JinaAPIItem {
    title?: string;
    url?: string;
    content?: string;
    description?: string;
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
// JINA.ai Integration
// ============================================================================

/**
 * Search for content using JINA.ai Search API
 */
async function searchWithJina(query: string): Promise<JinaSearchResult[]> {
    const apiKey = process.env.JINA_API_KEY;

    const headers: Record<string, string> = {
        Accept: "application/json",
    };

    if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey} `;
    }

    const url = `${JINA_SEARCH_URL}${encodeURIComponent(query)} `;

    console.log(`🔍 Searching JINA.ai for: "${query}"...`);

    try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`JINA search failed: ${response.status} ${response.statusText} `);
        }

        const data = await response.json();

        // JINA returns results in data array
        const results: JinaSearchResult[] = (data.data || []).slice(0, 5).map((item: JinaAPIItem) => ({
            title: item.title || "",
            url: item.url || "",
            content: item.content || "",
            description: item.description || "",
        }));

        console.log(`✅ Found ${results.length} results`);
        return results;
    } catch (error) {
        console.error("❌ JINA search error:", error);
        throw error;
    }
}

/**
 * Read full content from a URL using JINA.ai Reader API
 */
async function readWithJina(url: string): Promise<string> {
    const apiKey = process.env.JINA_API_KEY;

    const headers: Record<string, string> = {
        Accept: "text/plain",
        "x-with-generated-alt": "true",
    };

    if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey} `;
    }

    const readerUrl = `${JINA_READER_URL}${url} `;

    try {
        const response = await fetch(readerUrl, { headers });

        if (!response.ok) {
            console.warn(`⚠️ Could not read ${url}: ${response.status} `);
            return "";
        }

        const content = await response.text();
        return content.slice(0, 5000); // Limit content length
    } catch (error) {
        console.warn(`⚠️ Error reading ${url}: `, error);
        return "";
    }
}

// ============================================================================
// OpenAI Integration
// ============================================================================

/**
 * Rewrite content using OpenAI GPT-4
 */
async function rewriteWithAI(
    topic: string,
    category: BlogCategory,
    sourceContent: string,
    availableImages: string[],
    forcedAuthor?: string
): Promise<GeneratedBlogPost> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is required. Set it in your .env file.");
    }

    console.log("🤖 Generating blog post with OpenAI...");

    const systemPrompt = `You are a professional food and cooking blog writer for "Dish Shuffle", a recipe discovery app.
Your writing style is:
- **Authoritative & Professional**: Deeply knowledgeable, citing culinary science or history where appropriate.
- **Warm & Engaging**: Accessible but not overly casual.
- **Comprehensive & Exhaustive**: You write "Ultimate Guides" that cover every angle of a topic.
- **Structured for Readability**: Use frequent ## and ### headers, lists, and formatting.
- **SEO Optimized**: Naturally include relevant keywords.

You must output a valid JSON object with these exact fields:
{
  "slug": "kebab-case-url-slug",
  "title": "Compelling, SEO-optimized title",
  "description": "Meta description, max 160 chars",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
  "readTime": 15,
  "featuredImage": "URL of the most relevant image from the provided list, or null if none match well",
  "excerpt": "Engaging 2-3 sentence summary",
  "content": "Full markdown content. MUST BE AT LEAST 2500 WORDS. Use multiple h2 and h3 sections."
} `;

    const userPrompt = `Write a definitive, high-quality, and extremely comprehensive blog post about: "${topic}"
Category: ${category}

Use the following research as inspiration (DO NOT copy directly - completely rewrite in your own words):

${sourceContent.slice(0, 12000)}

Available Images (Choose the best one for 'featuredImage', or null):
${JSON.stringify(availableImages, null, 2)}

Requirements:
1. **Length**: CONTENT MUST BE AT LEAST 2500 WORDS. Go into extreme detail.
2. **Structure**: 
   - Engaging Introduction (hook the reader).
   - At least 6-8 main sections (##) with subsections (###).
   - "Deep Dive" sections explaining the 'Why' and 'How'.
   - Practical, step-by-step guides or tips.
   - Troubleshooting or Common Mistakes section.
   - FAQ section at the end.
   - Conclusion.
3. **Links**: Include 2-3 internal links to /recipes (e.g., [healthy recipes](/recipes?category=Healthy)).
4. **Tone**: Professional, helpful, expert.
5. **Originality**: 100% original phrasing. Do not copy sources.

Output ONLY the JSON object, no markdown code blocks.`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.7,
                max_tokens: 4096, // Max output tokens for gpt-4o
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API error: ${JSON.stringify(error)} `);
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || "";

        // Parse JSON response
        const parsed = JSON.parse(rawContent);

        // Get author (forced or random)
        const author = forcedAuthor || AUTHORS[Math.floor(Math.random() * AUTHORS.length)];

        // Get today's date
        const today = new Date().toISOString().split("T")[0];

        // Select Image
        let selectedImage = parsed.featuredImage;
        if (!selectedImage || selectedImage === "null" || !selectedImage.startsWith("http")) {
            // Fallback to random fallback image
            console.log("⚠️ No suitable image found by AI. Using fallback.");
            selectedImage = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
        }

        // Build complete blog post
        const blogPost: GeneratedBlogPost = {
            slug: parsed.slug || slugify(topic),
            title: parsed.title || topic,
            description: parsed.description || "",
            category: category,
            tags: parsed.tags || [],
            author: author,
            publishedDate: today,
            readTime: parsed.readTime || 8,
            featuredImage: selectedImage,
            excerpt: parsed.excerpt || "",
            content: parsed.content || "",
        };

        console.log("✅ Blog post generated successfully!");
        return blogPost;
    } catch (error) {
        console.error("❌ OpenAI error:", error);
        throw error;
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

function extractImagesFromMarkdown(content: string): string[] {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const images: string[] = [];
    let match;
    while ((match = imageRegex.exec(content)) !== null) {
        if (match[1] && match[1].startsWith("http")) {
            images.push(match[1]);
        }
    }
    return images;
}

/**
 * Save blog post to file
 */
function saveBlogPost(post: GeneratedBlogPost): string {
    const filename = CATEGORY_FILE_MAP[post.category];
    if (!filename) {
        throw new Error(`No file mapping found for category: ${post.category}`);
    }

    const filePath = path.join(process.cwd(), 'lib/data/blog', filename);

    // Read file
    let content = fs.readFileSync(filePath, 'utf-8');

    // Find the end of the array
    const lastBracketIndex = content.lastIndexOf('];');
    if (lastBracketIndex === -1) {
        throw new Error(`Could not find closing bracket in ${filename}`);
    }

    // Prepare new entry
    // Check if the list is empty or has items (to handle comma)
    const arrayContent = content.slice(0, lastBracketIndex);
    const hasItems = arrayContent.trim().endsWith('}');

    const newEntry = `    {
        slug: "${post.slug}",
        title: "${post.title.replace(/"/g, '\\"')}",
        description: "${post.description.replace(/"/g, '\\"')}",
        category: "${post.category}",
        tags: ${JSON.stringify(post.tags)},
        author: "${post.author}",
        publishedDate: "${post.publishedDate}",
        readTime: ${post.readTime},
        featuredImage: "${post.featuredImage}",
        excerpt: "${post.excerpt.replace(/"/g, '\\"')}",
        content: \`
${post.content}
        \`
    }`;

    // Insert new entry
    const prefix = hasItems ? ',' : '';
    const newContent = content.slice(0, lastBracketIndex) +
        `${prefix}\n${newEntry}\n` +
        content.slice(lastBracketIndex);

    // Write back
    fs.writeFileSync(filePath, newContent, 'utf-8');

    return `lib/data/blog/${filename}`;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

function parseArgs(): CLIArgs {
    const args = process.argv.slice(2);
    const result: CLIArgs = {
        topic: "",
        category: "Cooking Fundamentals",
        output: false,
        dryRun: false,
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--topic" && args[i + 1]) {
            result.topic = args[i + 1];
            i++;
        } else if (args[i] === "--category" && args[i + 1]) {
            const cat = args[i + 1] as BlogCategory;
            if (BLOG_CATEGORIES.includes(cat)) {
                result.category = cat;
            } else {
                console.warn(`⚠️ Invalid category "${cat}". Using default.`);
                console.log(`Valid categories: ${BLOG_CATEGORIES.join(", ")}`);
            }
            i++;
        } else if (args[i] === "--author" && args[i + 1]) {
            result.author = args[i + 1];
            i++;
        } else if (args[i] === "--output") {
            result.output = true;
        } else if (args[i] === "--dry-run") {
            result.dryRun = true;
        }
    }

    return result;
}

function formatBlogPostCode(post: GeneratedBlogPost): string {
    return `    {
        slug: "${post.slug}",
        title: "${post.title.replace(/"/g, '\\"')}",
        description: "${post.description.replace(/"/g, '\\"')}",
        category: "${post.category}",
        tags: ${JSON.stringify(post.tags)},
        author: "${post.author}",
        publishedDate: "${post.publishedDate}",
        readTime: ${post.readTime},
        featuredImage: "${post.featuredImage}",
        excerpt: "${post.excerpt.replace(/"/g, '\\"')}",
        content: \`
${post.content}
        \`
    }`;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
    console.log("\n🍽️  Dish Shuffle Blog Post Generator\n");
    console.log("=====================================\n");

    // Parse CLI arguments
    const args = parseArgs();

    if (!args.topic) {
        console.log("Usage:");
        console.log('  npx ts-node scripts/generate-blog-post.ts --topic "your topic here"');
        console.log("");
        console.log("Options:");
        console.log("  --topic      Topic to write about (required)");
        console.log("  --category   Blog category (default: Cooking Fundamentals)");
        console.log("  --author     Specific author name (optional)");
        console.log("  --output     Output code ready to paste (optional)");
        console.log("  --dry-run    Generate but do not save to file (optional)");
        console.log("");
        console.log("Categories:");
        BLOG_CATEGORIES.forEach((cat) => console.log(`  - ${cat}`));
        console.log("");
        process.exit(1);
    }

    console.log(`📝 Topic: ${args.topic}`);
    console.log(`📂 Category: ${args.category}\n`);

    try {
        // Step 1: Search for content with JINA.ai
        const searchResults = await searchWithJina(args.topic);

        if (searchResults.length === 0) {
            throw new Error("No search results found. Try a different topic.");
        }

        // Step 2: Gather content from top results
        console.log("\n📖 Reading source articles...");
        let combinedContent = "";
        const allImages: string[] = [];

        for (const result of searchResults.slice(0, 3)) {
            console.log(`  - ${result.title}`);
            const fullContent = await readWithJina(result.url);
            combinedContent += `\n\n## Source: ${result.title}\n${fullContent || result.content}`;

            // Extract images
            const images = extractImagesFromMarkdown(fullContent || "");
            allImages.push(...images);
        }

        console.log(`📸 Found ${allImages.length} images in sources.`);

        // Step 3: Generate blog post with AI
        console.log("");
        if (args.author) console.log(`👤 Author: ${args.author}`);
        const blogPost = await rewriteWithAI(args.topic, args.category, combinedContent, allImages, args.author);

        // Step 4: Output result
        console.log("\n=====================================");
        console.log("📄 GENERATED BLOG POST");
        console.log("=====================================\n");

        if (args.output || args.dryRun) {
            // Output as code ready to paste
            console.log(formatBlogPostCode(blogPost));

            if (args.dryRun) {
                console.log("\n🚧 DRY RUN: Not saved to file.");
            }
        } else {
            // Save to file by default
            try {
                const savedPath = saveBlogPost(blogPost);

                // Pretty print
                console.log(`Title: ${blogPost.title}`);
                console.log(`Slug: ${blogPost.slug}`);
                console.log(`Category: ${blogPost.category}`);
                console.log(`Author: ${blogPost.author}`);
                console.log(`Tags: ${blogPost.tags.join(", ")}`);
                console.log(`Read Time: ${blogPost.readTime} min`);
                console.log(`\nExcerpt:\n${blogPost.excerpt}`);
                console.log(`\n--- Content Preview (first 500 chars) ---\n`);
                console.log(blogPost.content.slice(0, 500) + "...");
                console.log(`\n\n✅ Saved successfully to ${savedPath}`);
            } catch (err) {
                console.error("❌ Failed to save blog post:", err);
                console.log("Here is the code so you can save it manually:");
                console.log(formatBlogPostCode(blogPost));
            }
        }

        console.log("\n✅ Done!\n");
    } catch (error) {
        console.error("\n❌ Error:", error);
        process.exit(1);
    }
}

main();
