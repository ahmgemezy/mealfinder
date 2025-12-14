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
    const locales = ['en', 'fr', 'es'];

    const allRoutes: MetadataRoute.Sitemap = [];

    // Helper to add routes for all locales
    const addMultilingualRoute = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly") => {
        locales.forEach(locale => {
            allRoutes.push({
                url: `${baseUrl}/${locale}${path}`,
                lastModified: new Date(),
                changeFrequency,
                priority,
                alternates: {
                    languages: {
                        en: `${baseUrl}/en${path}`,
                        fr: `${baseUrl}/fr${path}`,
                        es: `${baseUrl}/es${path}`,
                    }
                }
            });
        });
    };

    // 1. Static Routes
    const staticPaths = [
        { path: '', priority: 1, freq: 'daily' },
        { path: '/surprise-me', priority: 0.9, freq: 'daily' },
        { path: '/recipes', priority: 0.8, freq: 'daily' },
        { path: '/blog', priority: 0.8, freq: 'daily' },
        { path: '/faq', priority: 0.7, freq: 'weekly' },
        { path: '/privacy-policy', priority: 0.3, freq: 'monthly' },
        { path: '/terms-of-service', priority: 0.3, freq: 'monthly' },
        { path: '/cookies-policy', priority: 0.3, freq: 'monthly' },
    ];

    staticPaths.forEach(({ path, priority, freq }) => {
        addMultilingualRoute(path, priority, freq as any);
    });

    // 2. Dynamic Routes: Categories & Areas
    RECIPE_CATEGORIES.forEach((category) => {
        const path = `/recipes?category=${encodeURIComponent(category)}`;
        // Note: Query params are tricky with canonicals/sitemaps but included here for discovery
        // Ideally should be static pages like /recipes/category/[name]
        locales.forEach(locale => {
            allRoutes.push({
                url: `${baseUrl}/${locale}${path}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        });
    });

    RECIPE_AREAS.forEach((area) => {
        const path = `/recipes?area=${encodeURIComponent(area)}`;
        locales.forEach(locale => {
            allRoutes.push({
                url: `${baseUrl}/${locale}${path}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        });
    });

    // 3. Blog Posts
    const blogPosts = getAllPostsMetadata();
    blogPosts.forEach((post) => {
        locales.forEach(locale => {
            allRoutes.push({
                url: `${baseUrl}/${locale}/blog/${post.slug}`,
                lastModified: new Date(post.publishedDate),
                changeFrequency: 'monthly',
                priority: 0.7,
                alternates: {
                    languages: {
                        en: `${baseUrl}/en/blog/${post.slug}`,
                        fr: `${baseUrl}/fr/blog/${post.slug}`,
                        es: `${baseUrl}/es/blog/${post.slug}`,
                    }
                }
            });
        });
    });

    // 4. Recipes
    try {
        // Fetch all recipes from Supabase (limit increased to 50k)
        console.log("Sitemap: Fetching recipes...");
        const { data: recipes, error } = await supabase
            .from('recipes')
            // Fetch only the name from the JSONB column to save memory
            // 'data->name' extracts just the name field maintaining the structure { data: { name: "..." } }
            .select('id, data->name, created_at')
            .limit(50000);

        if (error) {
            console.error("Supabase error fetching recipes for sitemap:", error);
        } else if (recipes && recipes.length > 0) {
            console.log(`Sitemap: Found ${recipes.length} recipes`);

            recipes.forEach((recipe) => {
                // When selecting 'data->name', Supabase returns it as 'name' property
                const name = recipe.name as string;
                if (!name) return;

                const slug = generateSlug(name, recipe.id);

                locales.forEach(locale => {
                    allRoutes.push({
                        url: `${baseUrl}/${locale}/recipes/${slug}`,
                        lastModified: recipe.created_at ? new Date(recipe.created_at) : new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.6,
                        alternates: {
                            languages: {
                                en: `${baseUrl}/en/recipes/${slug}`,
                                fr: `${baseUrl}/fr/recipes/${slug}`,
                                es: `${baseUrl}/es/recipes/${slug}`,
                            }
                        }
                    });
                });
            });
        }
    } catch (error) {
        console.error("Error fetching recipes for sitemap:", error);
    }

    console.log(`Sitemap: Generated ${allRoutes.length} URLs`);
    return allRoutes;
}
