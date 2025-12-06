import { MetadataRoute } from "next";
import { RECIPE_CATEGORIES, RECIPE_AREAS } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
    // Use custom site URL or production domain as fallback
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dishshuffle.com";

    // Static routes
    const routes: MetadataRoute.Sitemap = [
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

    return [...routes, ...categoryRoutes, ...areaRoutes];
}
