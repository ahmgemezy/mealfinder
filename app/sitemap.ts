import { MetadataRoute } from "next";
import { RECIPE_CATEGORIES, RECIPE_AREAS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { getAllPostsMetadata } from "@/lib/utils/blog-helpers";

// Helper to generate slug from recipe name (must match the slug format used in the app)
function generateSlug(name: string, id: string): string {
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    return `${slug}-${id}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Use custom site URL or production domain as fallback
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dishshuffle.com";

    // Static routes - Main pages
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/en`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${baseUrl}/en/surprise-me`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/en/recipes`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/en/blog`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/en/faq`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
        },
    ];

    // Legal pages
    const legalRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/en/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/en/terms-of-service`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/en/cookies-policy`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
    ];

    // Dynamic routes for Categories
    const categoryRoutes: MetadataRoute.Sitemap = RECIPE_CATEGORIES.map((category) => ({
        url: `${baseUrl}/en/recipes?category=${encodeURIComponent(category)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    // Dynamic routes for Areas
    const areaRoutes: MetadataRoute.Sitemap = RECIPE_AREAS.map((area) => ({
        url: `${baseUrl}/en/recipes?area=${encodeURIComponent(area)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    // Individual recipe pages from Supabase
    let recipeRoutes: MetadataRoute.Sitemap = [];

    try {
        // Fetch all recipes from Supabase (up to 10,000)
        // Note: The recipes table stores name inside a 'data' JSONB column
        const { data: recipes, error } = await supabase
            .from('recipes')
            .select('id, data, created_at')
            .limit(10000); // Increased from default 1000

        if (error) {
            console.error("Supabase error fetching recipes for sitemap:", error);
        } else if (recipes && recipes.length > 0) {
            console.log(`Sitemap: Found ${recipes.length} recipes in Supabase`);
            recipeRoutes = recipes
                .filter((recipe) => recipe.data?.name) // Only include recipes with a name
                .map((recipe) => ({
                    url: `${baseUrl}/en/recipes/${generateSlug(recipe.data.name, recipe.id)}`,
                    lastModified: recipe.created_at ? new Date(recipe.created_at) : new Date(),
                    changeFrequency: "weekly" as const,
                    priority: 0.6,
                }));
        } else {
            console.log("Sitemap: No recipes found in Supabase");
        }
    } catch (error) {
        console.error("Error fetching recipes for sitemap:", error);
    }

    // Blog post routes
    const blogPosts = getAllPostsMetadata();
    const blogUrls = blogPosts.map((post) => ({
        url: `${baseUrl}/en/blog/${post.slug}`,
        lastModified: new Date(post.publishedDate),
        changeFrequency: "monthly" as const,
        priority: 0.7,
        alternates: {
            languages: {
                en: `${baseUrl}/en/blog/${post.slug}`,
                fr: `${baseUrl}/fr/blog/${post.slug}`,
                es: `${baseUrl}/es/blog/${post.slug}`,
            },
        },
    }));

    // Add blog index page
    const blogIndex = {
        url: `${baseUrl}/en/blog`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: {
            languages: {
                en: `${baseUrl}/en/blog`,
                fr: `${baseUrl}/fr/blog`,
                es: `${baseUrl}/es/blog`,
            },
        },
    };

    return [...staticRoutes, ...legalRoutes, ...categoryRoutes, ...areaRoutes, ...recipeRoutes, blogIndex, ...blogUrls];
}
