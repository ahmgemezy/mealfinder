/**
 * Blog Post Generator Script
 *
 * Uses JINA.ai to search for content and OpenAI to rewrite it into original blog posts.
 *
 * Usage:
 *   npx ts-node scripts/generate-blog-post.ts --topic "meal prep tips" --category "Cooking Tips & Trends"
 *   npx ts-node scripts/generate-blog-post.ts --topic "Italian pasta" --category "Cuisine Exploration" --output
 */

// ============================================================================
// Configuration
// ============================================================================

const JINA_SEARCH_URL = "https://s.jina.ai/";
const JINA_READER_URL = "https://r.jina.ai/";

const AUTHORS = ["Chef Alex", "Sarah Jenkins", "Dr. Emily Foodsci", "Giulia Rossi"];

const BLOG_CATEGORIES = [
    "Cooking Fundamentals",
    "Diet & Nutrition",
    "Cuisine Exploration",
    "Cooking Tips & Trends",
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
    output: boolean;
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
        headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const url = `${JINA_SEARCH_URL}${encodeURIComponent(query)}`;

    console.log(`🔍 Searching JINA.ai for: "${query}"...`);

    try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`JINA search failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // JINA returns results in data array
        const results: JinaSearchResult[] = (data.data || []).slice(0, 5).map((item: any) => ({
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
    };

    if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const readerUrl = `${JINA_READER_URL}${url}`;

    try {
        const response = await fetch(readerUrl, { headers });

        if (!response.ok) {
            console.warn(`⚠️ Could not read ${url}: ${response.status}`);
            return "";
        }

        const content = await response.text();
        return content.slice(0, 5000); // Limit content length
    } catch (error) {
        console.warn(`⚠️ Error reading ${url}:`, error);
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
    sourceContent: string
): Promise<GeneratedBlogPost> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is required. Set it in your .env file.");
    }

    console.log("🤖 Generating blog post with OpenAI...");

    const systemPrompt = `You are a professional food and cooking blog writer for "Dish Shuffle", a recipe discovery app.
Your writing style is:
- Warm, friendly, and approachable
- Educational but not condescending
- Practical with actionable tips
- Uses markdown formatting (headers, lists, bold, italics)
- Includes internal links to /recipes where relevant

You must output a valid JSON object with these exact fields:
{
  "slug": "kebab-case-url-slug",
  "title": "Catchy, SEO-friendly title",
  "description": "Meta description for SEO, max 160 chars",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "readTime": 8,
  "featuredImage": "A descriptive placeholder for image search",
  "excerpt": "2-3 sentence summary for preview cards",
  "content": "Full markdown content with ## headers, lists, and links to /recipes"
}`;

    const userPrompt = `Write an original, comprehensive blog post about: "${topic}"
Category: ${category}

Use the following research as inspiration (DO NOT copy directly - completely rewrite in your own words):

${sourceContent.slice(0, 8000)}

Requirements:
- Create completely original content (no plagiarism)
- Include at least 3-4 main sections with ## headers
- Add practical tips and examples
- Include at least one internal link to /recipes (e.g., [healthy recipes](/recipes?category=Healthy))
- Content should be 800-1200 words
- Make it engaging and useful for home cooks

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
                max_tokens: 4000,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || "";

        // Parse JSON response
        const parsed = JSON.parse(rawContent);

        // Get random author
        const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];

        // Get today's date
        const today = new Date().toISOString().split("T")[0];

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
            featuredImage: `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80`, // Placeholder
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
        } else if (args[i] === "--output") {
            result.output = true;
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
        console.log("  --output     Output code ready to paste into blog files");
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

        for (const result of searchResults.slice(0, 3)) {
            console.log(`  - ${result.title}`);
            const fullContent = await readWithJina(result.url);
            combinedContent += `\n\n## Source: ${result.title}\n${fullContent || result.content}`;
        }

        // Step 3: Generate blog post with AI
        console.log("");
        const blogPost = await rewriteWithAI(args.topic, args.category, combinedContent);

        // Step 4: Output result
        console.log("\n=====================================");
        console.log("📄 GENERATED BLOG POST");
        console.log("=====================================\n");

        if (args.output) {
            // Output as code ready to paste
            console.log(formatBlogPostCode(blogPost));
        } else {
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
            console.log(`\n\n💡 Run with --output flag to get copy-pasteable code`);
        }

        console.log("\n✅ Done!\n");
    } catch (error) {
        console.error("\n❌ Error:", error);
        process.exit(1);
    }
}

main();
