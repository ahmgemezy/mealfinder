import { MetadataRoute } from "next";
import { RECIPE_CATEGORIES, RECIPE_AREAS } from "@/lib/constants";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${baseUrl}/surprise-me`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/recipes`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
    ];

    // Legal pages
    const legalRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms-of-service`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/cookies-policy`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
    ];

    // Dynamic routes for Categories
    const categoryRoutes: MetadataRoute.Sitemap = RECIPE_CATEGORIES.map((category) => ({
        url: `${baseUrl}/recipes?category=${encodeURIComponent(category)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    // Dynamic routes for Areas
    const areaRoutes: MetadataRoute.Sitemap = RECIPE_AREAS.map((area) => ({
        url: `${baseUrl}/recipes?area=${encodeURIComponent(area)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    // Individual recipe pages from Supabase
    let recipeRoutes: MetadataRoute.Sitemap = [];

    if (isSupabaseConfigured()) {
        try {
            // Fetch all recipes from Supabase
            const { data: recipes, error } = await supabase
                .from('recipes')
                .select('id, name, updated_at');

            if (!error && recipes) {
                recipeRoutes = recipes.map((recipe) => ({
                    url: `${baseUrl}/recipes/${generateSlug(recipe.name, recipe.id)}`,
                    lastModified: recipe.updated_at ? new Date(recipe.updated_at) : new Date(),
                    changeFrequency: "weekly" as const,
                    priority: 0.6,
                }));
            }
        } catch (error) {
            console.error("Error fetching recipes for sitemap:", error);
        }
    }

    return [...staticRoutes, ...legalRoutes, ...categoryRoutes, ...areaRoutes, ...recipeRoutes];
}
