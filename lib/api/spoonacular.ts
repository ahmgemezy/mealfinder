import {
    SpoonacularRecipe,
    SpoonacularSearchResponse,
    SpoonacularRandomResponse,
    Recipe,
    transformSpoonacularToRecipe,
    MealFilters,
} from "@/lib/types/recipe";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";

// Cache for API responses
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCacheKey(endpoint: string, params?: Record<string, string>): string {
    const paramString = params ? JSON.stringify(params) : "";
    return `spoonacular:${endpoint}${paramString}`;
}

function getFromCache<T>(key: string): T | null {
    const cached = cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
    if (isExpired) {
        cache.delete(key);
        return null;
    }

    return cached.data as T;
}

function setCache<T>(key: string, data: T): void {
    cache.set(key, { data, timestamp: Date.now() });
}

// Supabase Caching Helpers (same as MealDB)
async function fetchRecipeFromSupabase(id: string): Promise<Recipe | null> {
    if (!isSupabaseConfigured()) return null;

    try {
        const { data, error } = await supabase
            .from('recipes')
            .select('data')
            .eq('id', id)
            .single();

        if (error || !data) return null;
        return data.data as Recipe;
    } catch (error) {
        console.error("Error fetching from Supabase:", error);
        return null;
    }
}

async function saveRecipeToSupabase(recipe: Recipe): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
        supabase
            .from('recipes')
            .upsert({
                id: recipe.id,
                data: recipe,
                created_at: new Date().toISOString()
            }, { onConflict: 'id' })
            .then(({ error }) => {
                if (error) {
                    console.error("Error saving to Supabase:", error.message, error);
                }
            });
    } catch (error) {
        console.error("Error saving to Supabase (exception):", error);
    }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchFromSpoonacular<T>(
    endpoint: string,
    params?: Record<string, string>,
    skipCache = false,
    retries = 3,
    backoff = 300
): Promise<T> {
    if (!SPOONACULAR_API_KEY) {
        throw new Error("Spoonacular API key is not configured");
    }

    // Check cache first
    if (!skipCache) {
        const cacheKey = getCacheKey(endpoint, params);
        const cached = getFromCache<T>(cacheKey);
        if (cached) return cached;
    }

    const url = new URL(`${SPOONACULAR_BASE_URL}/${endpoint}`);

    // Add API key
    url.searchParams.append("apiKey", SPOONACULAR_API_KEY);

    // Add other params
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url.toString(), {
            next: { revalidate: skipCache ? 0 : 900 }, // 0 for no-cache, 900 for 15 minutes
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.status === 429 && retries > 0) {
            // Rate limited, wait and retry
            console.warn("Spoonacular rate limit hit, retrying...");
            await wait(backoff);
            return fetchFromSpoonacular<T>(endpoint, params, skipCache, retries - 1, backoff * 2);
        }

        if (response.status === 402) {
            throw new Error("Spoonacular API quota exceeded. Please upgrade your plan or try again later.");
        }

        if (!response.ok) {
            throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Cache the result
        if (!skipCache) {
            const cacheKey = getCacheKey(endpoint, params);
            setCache(cacheKey, data);
        }

        return data;
    } catch (error) {
        if (retries > 0) {
            await wait(backoff);
            return fetchFromSpoonacular<T>(endpoint, params, skipCache, retries - 1, backoff * 2);
        }
        throw error;
    }
}

/**
 * Get a random recipe from Spoonacular
 */
export async function getRandomRecipe(): Promise<Recipe | null> {
    try {
        const data = await fetchFromSpoonacular<SpoonacularRandomResponse>(
            "recipes/random",
            { number: "1" },
            true // Skip cache for random
        );

        if (!data.recipes || data.recipes.length === 0) return null;

        const recipe = transformSpoonacularToRecipe(data.recipes[0]);

        // Cache to Supabase
        await saveRecipeToSupabase(recipe);

        return recipe;
    } catch (error) {
        console.error("Error fetching random recipe from Spoonacular:", error);
        return null;
    }
}

/**
 * Get random recipe with filters
 */
export async function getRandomRecipeWithFilters(
    filters: MealFilters
): Promise<Recipe | null> {
    try {
        const params: Record<string, string> = {
            number: "1",
            sort: "random",
        };

        // Map MealDB filters to Spoonacular params
        if (filters.category) {
            // Map category to dishType
            params.type = filters.category.toLowerCase();
        }

        if (filters.area) {
            // Map area to cuisine
            params.cuisine = filters.area;
        }

        if (filters.diet) {
            params.diet = filters.diet;
        }

        if (filters.intolerances && filters.intolerances.length > 0) {
            params.intolerances = filters.intolerances.join(",");
        }

        const data = await fetchFromSpoonacular<SpoonacularSearchResponse>(
            "recipes/complexSearch",
            params,
            true // Skip cache for random
        );

        if (!data.results || data.results.length === 0) return null;

        // Fetch full recipe details
        return getRecipeById(data.results[0].id.toString());
    } catch (error) {
        console.error("Error fetching filtered random recipe from Spoonacular:", error);
        return null;
    }
}

/**
 * Get recipe by ID
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
    try {
        // 1. Try Supabase cache first
        const cachedRecipe = await fetchRecipeFromSupabase(id);
        if (cachedRecipe) {
            return cachedRecipe;
        }

        // 2. Fetch from Spoonacular with nutrition
        const data = await fetchFromSpoonacular<SpoonacularRecipe>(
            `recipes/${id}/information`,
            { includeNutrition: "true" }
        );

        if (!data) return null;

        const recipe = transformSpoonacularToRecipe(data);

        // 3. Save to Supabase
        await saveRecipeToSupabase(recipe);

        return recipe;
    } catch (error) {
        console.error("Error fetching recipe by ID from Spoonacular:", error);
        return null;
    }
}

/**
 * Search recipes by name
 */
export async function searchRecipes(query: string): Promise<Recipe[]> {
    try {
        const data = await fetchFromSpoonacular<SpoonacularSearchResponse>(
            "recipes/complexSearch",
            {
                query: query,
                number: "100",
                addRecipeInformation: "true",
                fillIngredients: "true",
            }
        );

        if (!data.results) return [];

        const recipes = data.results.map(transformSpoonacularToRecipe);

        // Cache all recipes to Supabase (fire and forget)
        recipes.forEach(recipe => saveRecipeToSupabase(recipe));

        return recipes;
    } catch (error) {
        console.error("Error searching recipes in Spoonacular:", error);
        return [];
    }
}

/**
 * Filter recipes by category (dishType)
 */
export async function filterByCategory(category: string): Promise<Recipe[]> {
    try {
        const data = await fetchFromSpoonacular<SpoonacularSearchResponse>(
            "recipes/complexSearch",
            {
                type: category.toLowerCase(),
                number: "100",
                addRecipeInformation: "true",
                fillIngredients: "true",
            }
        );

        if (!data.results) return [];

        const recipes = data.results.map(transformSpoonacularToRecipe);

        // Cache all recipes to Supabase (fire and forget)
        recipes.forEach(recipe => saveRecipeToSupabase(recipe));

        return recipes;
    } catch (error) {
        console.error("Error filtering by category in Spoonacular:", error);
        return [];
    }
}

/**
 * Filter recipes by area (cuisine)
 */
export async function filterByArea(area: string): Promise<Recipe[]> {
    try {
        const data = await fetchFromSpoonacular<SpoonacularSearchResponse>(
            "recipes/complexSearch",
            {
                cuisine: area,
                number: "100",
                addRecipeInformation: "true",
                fillIngredients: "true",
            }
        );

        if (!data.results) return [];

        const recipes = data.results.map(transformSpoonacularToRecipe);

        // Cache all recipes to Supabase (fire and forget)
        recipes.forEach(recipe => saveRecipeToSupabase(recipe));

        return recipes;
    } catch (error) {
        console.error("Error filtering by area in Spoonacular:", error);
        return [];
    }
}

/**
 * Filter recipes by diet
 */
export async function filterByDiet(diet: string): Promise<Recipe[]> {
    try {
        const data = await fetchFromSpoonacular<SpoonacularSearchResponse>(
            "recipes/complexSearch",
            {
                diet: diet.toLowerCase(),
                number: "100",
                addRecipeInformation: "true",
                fillIngredients: "true",
            }
        );

        if (!data.results) return [];

        const recipes = data.results.map(transformSpoonacularToRecipe);

        // Cache all recipes to Supabase (fire and forget)
        recipes.forEach(recipe => saveRecipeToSupabase(recipe));

        return recipes;
    } catch (error) {
        console.error("Error filtering by diet in Spoonacular:", error);
        return [];
    }
}

/**
 * Get all supported cuisines
 */
export async function getAreas(): Promise<string[]> {
    // Spoonacular supports these cuisines
    // Reference: https://spoonacular.com/food-api/docs#Cuisines
    return [
        "African",
        "American",
        "British",
        "Cajun",
        "Caribbean",
        "Chinese",
        "Eastern European",
        "European",
        "French",
        "German",
        "Greek",
        "Indian",
        "Irish",
        "Italian",
        "Japanese",
        "Jewish",
        "Korean",
        "Latin American",
        "Mediterranean",
        "Mexican",
        "Middle Eastern",
        "Nordic",
        "Southern",
        "Spanish",
        "Thai",
        "Vietnamese",
    ];
}

/**
 * Get all supported categories (dish types)
 */
export async function getCategories(): Promise<string[]> {
    // Spoonacular dish types
    // Reference: https://spoonacular.com/food-api/docs#Meal-Types
    return [
        "Main Course",
        "Side Dish",
        "Dessert",
        "Appetizer",
        "Salad",
        "Bread",
        "Breakfast",
        "Soup",
        "Beverage",
        "Sauce",
        "Marinade",
        "Fingerfood",
        "Snack",
        "Drink",
    ];
}

/**
 * Get multiple random recipes
 */
export async function getMultipleRandomRecipes(count: number = 6): Promise<Recipe[]> {
    try {
        const data = await fetchFromSpoonacular<SpoonacularRandomResponse>(
            "recipes/random",
            { number: count.toString() },
            true // Skip cache for random
        );

        if (!data.recipes) return [];

        const recipes = data.recipes.map(transformSpoonacularToRecipe);

        // Cache all recipes to Supabase
        await Promise.all(recipes.map(recipe => saveRecipeToSupabase(recipe)));

        return recipes;
    } catch (error) {
        console.error("Error fetching multiple random recipes from Spoonacular:", error);
        return [];
    }
}

/**
 * Get similar recipes
 */
export async function getSimilarRecipes(id: string, count: number = 3): Promise<Recipe[]> {
    try {
        // Spoonacular similar recipes endpoint returns simplified objects
        // We need to fetch full details for them
        const similarData = await fetchFromSpoonacular<Array<{ id: number }>>(
            `recipes/${id}/similar`,
            { number: count.toString() }
        );

        if (!similarData || similarData.length === 0) return [];

        // Fetch full details for each similar recipe
        const recipes = await Promise.all(
            similarData.map(item => getRecipeById(item.id.toString()))
        );

        return recipes.filter((recipe): recipe is Recipe => recipe !== null);
    } catch (error) {
        console.error("Error fetching similar recipes from Spoonacular:", error);
        return [];
    }
}
