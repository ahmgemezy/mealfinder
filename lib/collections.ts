import { Recipe } from "@/lib/types/recipe";
import { searchMeals, filterByMultiple } from "@/lib/api";

export interface CollectionDefinition {
    slug: string;
    title: string;
    description: string;
    searchQuery?: string;
    filters?: {
        category?: string;
        area?: string;
        diet?: string; // If supported by API
    };
    keywords: string[];
}

export const COLLECTIONS_CONFIG: CollectionDefinition[] = [
    // 1. Diet & Health
    {
        slug: "vegetarian-dinner-recipes",
        title: "Best Vegetarian Dinner Recipes",
        description: "Discover delicious and satisfying vegetarian dinner ideas. From pasta to curries, these meat-free meals are perfect for weeknight cooking.",

        filters: { category: "Vegetarian" },
        keywords: ["vegetarian dinner", "meatless monday", "vegetarian main course"],
    },
    {
        slug: "healthy-chicken-recipes",
        title: "Healthy Chicken Recipes",
        description: "Light and nutritious chicken recipes that don't skimp on flavor. High protein, low fat, and perfect for a balanced diet.",
        searchQuery: "chicken",
        // In a real app we might filter by calories if API supports it, using search for now
        filters: { category: "Chicken" },
        keywords: ["healthy chicken", "lean chicken recipes", "fitness meals"],
    },
    {
        slug: "gluten-free-options",
        title: "Gluten-Free Recipe Collection",
        description: "Safe and delicious gluten-free recipes for everyone. Explore meals without wheat, barley, or rye.",
        // Note: API support for diet is needed, falling back to search or broad category
        searchQuery: "gluten free",
        keywords: ["gluten free ideas", "wheat free recipes", "celiac friendly"],
    },

    // 2. Cuisines (Long tail)
    {
        slug: "authentic-italian-pasta",
        title: "Authentic Italian Pasta Recipes",
        description: "Bring the taste of Italy to your kitchen with these traditional pasta dishes. Carbonara, Bolognese, and more.",
        filters: { area: "Italian", category: "Pasta" },
        keywords: ["italian pasta", "traditional italian", "best pasta recipes"],
    },
    {
        slug: "spicy-mexican-food",
        title: "Spicy Mexican Recipes",
        description: "Fiesty and flavorful Mexican dishes to spice up your routine. Tacos, enchiladas, and fresh salsas.",
        filters: { area: "Mexican" },
        keywords: ["mexican food", "spicy recipes", "taco night"],
    },
    {
        slug: "asian-stir-fry",
        title: "Quick & Easy Asian Stir-Fry",
        description: "Better than takeout. Fast, fresh, and flavorful stir-fry recipes from across Asia.",
        filters: { area: "Chinese" }, // Broadening to Chinese/Asian
        searchQuery: "stir fry",
        keywords: ["stir fry sauce", "wok recipes", "easy asian dinner"],
    },

    // 3. Meal Types
    {
        slug: "quick-breakfast-ideas",
        title: "Quick Breakfast Ideas for Busy Mornings",
        description: "Start your day right with these fast and fueling breakfast recipes. Ready in minutes.",
        filters: { category: "Breakfast" },
        keywords: ["easy breakfast", "morning meal", "quick food"],
    },
    {
        slug: "comfort-food-desserts",
        title: "Ultimate Comfort Food Desserts",
        description: "Indulge in sweet treats that feel like a hug. Warm cookies, rich cakes, and classic puddings.",
        filters: { category: "Dessert" },
        keywords: ["best desserts", "sweet treats", "baking ideas"],
    },
    {
        slug: "seafood-lovers",
        title: "Recipes for Seafood Lovers",
        description: "Fresh fish and shellfish recipes. Healthy, elegant, and easier to make than you think.",
        filters: { category: "Seafood" },
        keywords: ["fish recipes", "seafood dinner", "shrimp dishes"],
    },
    {
        slug: "vegan-friendly-meals",
        title: "Vegan Friendly Meals",
        description: "Plant-based power on a plate. No animal products, 100% flavor.",
        filters: { category: "Vegan" },
        keywords: ["vegan recipes", "plant based diet", "vegan dinner"],
    },
];

export async function getCollectionBySlug(slug: string): Promise<{ definition: CollectionDefinition; recipes: Recipe[] } | null> {
    const definition = COLLECTIONS_CONFIG.find((c) => c.slug === slug);
    if (!definition) return null;

    let recipes: Recipe[] = [];

    // Strategy: Try Filters first (more precise), then Search
    if (definition.filters) {
        const { category, area, diet } = definition.filters;
        // Note: filterByMultiple supports pagination, we just fetch first page (standard size)
        // We could increase limit or fetch more if needed
        const result = await filterByMultiple(category, area, diet);
        recipes = result.recipes;
    }

    // If filters yielded few results OR we have a specific search query to refine/add
    if (definition.searchQuery && recipes.length < 12) {
        const searchResults = await searchMeals(definition.searchQuery);

        // Merge and Dedupe
        const existingIds = new Set(recipes.map(r => r.id));
        searchResults.forEach(r => {
            if (!existingIds.has(r.id)) {
                recipes.push(r);
                existingIds.add(r.id);
            }
        });
    }

    return {
        definition,
        recipes: recipes.slice(0, 24) // Cap at 24
    };
}

export function getAllCollectionSlugs(): string[] {
    return COLLECTIONS_CONFIG.map(c => c.slug);
}
