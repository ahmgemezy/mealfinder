import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";


import { generateRecipeSlug } from "@/lib/utils/slugs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use custom site URL or production domain as fallback
  // Use custom site URL or production domain as fallback
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dishshuffle.com";
  // Sync with navigation.ts
  const locales = ['en', 'fr', 'es', 'pt-br', 'de', 'ar'];

  const allRoutes: MetadataRoute.Sitemap = [];

  // Helper to add routes for all locales
  const addMultilingualRoute = (
    path: string,
    priority: number,
    changeFrequency: "daily" | "weekly" | "monthly"
  ) => {
    locales.forEach((locale) => {
      // Dynamic alternates generation
      const languages: Record<string, string> = {};
      locales.forEach((l) => {
        languages[l] = `${baseUrl}/${l}${path}`;
      });

      allRoutes.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: {
          languages,
        },
      });
    });
  };

  // 1. Static Routes
  const staticPaths = [
    { path: "", priority: 1, freq: "daily" },
    { path: "/surprise-me", priority: 0.9, freq: "daily" },
    { path: "/recipes", priority: 0.8, freq: "daily" },
    { path: "/pantry", priority: 0.8, freq: "daily" }, // Added Smart Pantry
    { path: "/blog", priority: 0.8, freq: "daily" },
    { path: "/about", priority: 0.7, freq: "monthly" },
    { path: "/contact", priority: 0.7, freq: "monthly" },
    { path: "/faq", priority: 0.7, freq: "weekly" },
    { path: "/privacy-policy", priority: 0.3, freq: "monthly" },
    { path: "/terms-of-service", priority: 0.3, freq: "monthly" },
    { path: "/cookies-policy", priority: 0.3, freq: "monthly" },
  ];

  staticPaths.forEach(({ path, priority, freq }) => {
    addMultilingualRoute(
      path,
      priority,
      freq as "daily" | "weekly" | "monthly"
    );
  });

  // 2. Dynamic Routes: Categories & Areas
  // NOTE: Query parameter URLs are excluded from the sitemap to avoid duplicate content issues.
  // If category/area filter pages need to be indexed, create dedicated static routes instead.
  // NOTE: With 10,000 recipes × 6 locales = 60,000 recipe URLs, plus static and blog routes,
  // this sitemap approaches Google's 50,000 URL per file limit. Consider splitting into a
  // sitemap index (using generateSitemaps()) if the recipe count grows significantly.

  // 3. Blog Posts
  try {
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('slug, published_date, updated_at')
      .not('published_date', 'is', null);

    if (blogError) {
      console.error("Error fetching blog posts for sitemap:", blogError);
    } else if (blogPosts && blogPosts.length > 0) {
      blogPosts.forEach((post) => {
        locales.forEach((locale) => {
          // Dynamic alternates
          const languages: Record<string, string> = {};
          locales.forEach((l) => {
            languages[l] = `${baseUrl}/${l}/blog/${post.slug}`;
          });

          allRoutes.push({
            url: `${baseUrl}/${locale}/blog/${post.slug}`,
            lastModified: new Date(post.updated_at || post.published_date),
            changeFrequency: "monthly",
            priority: 0.7,
            alternates: {
              languages,
            },
          });
        });
      });
    }
  } catch (error) {
    console.error("Error in blog post sitemap generation:", error);
  }

  // 4. Recipes
  try {
    // Fetch all recipes from Supabase (limit increased to 50k)
    console.log("Sitemap: Fetching recipes...");
    const { data: recipes, error } = await supabase
      .from("recipes")
      // Fetch only the name from the JSONB column to save memory
      // 'data->name' extracts just the name field maintaining the structure { data: { name: "..." } }
      .select("id, data->name, created_at")
      .limit(10000);

    if (error) {
      console.error("Supabase error fetching recipes for sitemap:", error);
    } else if (recipes && recipes.length > 0) {
      console.log(`Sitemap: Found ${recipes.length} recipes`);

      recipes.forEach((recipe) => {
        // When selecting 'data->name', Supabase returns it as 'name' property
        const name = recipe.name as string;
        if (!name) return;

        const slug = generateRecipeSlug(name, recipe.id);

        locales.forEach((locale) => {
          // Dynamic alternates
          const languages: Record<string, string> = {};
          locales.forEach((l) => {
            languages[l] = `${baseUrl}/${l}/recipes/${slug}`;
          });

          allRoutes.push({
            url: `${baseUrl}/${locale}/recipes/${slug}`,
            lastModified: recipe.created_at
              ? new Date(recipe.created_at)
              : new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
            alternates: {
              languages,
            },
          });
        });
      });
    }
  } catch (error) {
    console.error("Error fetching recipes for sitemap:", error);
  }

  // 5. Programmatic Collections
  // Generate URLs for all defined collections
  try {
    const { COLLECTIONS_CONFIG } = await import("@/lib/collections");
    COLLECTIONS_CONFIG.forEach((collection) => {
      locales.forEach((locale) => {
        const languages: Record<string, string> = {};
        locales.forEach((l) => {
          languages[l] = `${baseUrl}/${l}/collections/${collection.slug}`;
        });

        allRoutes.push({
          url: `${baseUrl}/${locale}/collections/${collection.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: {
            languages,
          },
        });
      });
    });
  } catch (error) {
    console.error("Error generating collection sitemap:", error);
  }

  console.log(`Sitemap: Generated ${allRoutes.length} URLs`);
  return allRoutes;
}
