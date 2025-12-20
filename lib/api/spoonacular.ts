import {
    SpoonacularRecipe,
    SpoonacularSearchResponse,
    SpoonacularRandomResponse,
    Recipe,
    transformSpoonacularToRecipe,
    MealFilters,
} from "@/lib/types/recipe";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { devLog } from "@/lib/utils/logger";

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";

/**
 * Check if Spoonacular is properly configured
 */
export function isSpoonacularConfigured(): boolean {
    const isConfigured = !!SPOONACULAR_API_KEY && SPOONACULAR_API_KEY.trim() !== "";

    if (!isConfigured) {
        console.warn("Spoonacular API key is not configured. Some features may not work.");
    }

    return isConfigured;
}

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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry helper with exponential backoff for Supabase operations
 * Handles transient network errors (socket closed, fetch failed, etc.)
 */
async function retryAsync<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    baseDelay: number = 200,
    context: string = 'operation'
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            const isTransientError =
                error instanceof Error &&
                (error.message.includes('fetch failed') ||
                    error.message.includes('socket') ||
                    error.message.includes('ECONNRESET') ||
                    error.message.includes('ETIMEDOUT'));

            if (attempt < retries && isTransientError) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.warn(`Retry ${attempt + 1}/${retries} for ${context} after ${delay}ms`);
                await wait(delay);
            }
        }
    }

    throw lastError;
}

// Cache expiration: 120 days in milliseconds
const SUPABASE_CACHE_TTL_MS = 120 * 24 * 60 * 60 * 1000;

async function fetchRecipeFromSupabase(id: string): Promise<Recipe | null> {
    if (!isSupabaseConfigured()) return null;

    try {
        return await retryAsync(
            async () => {
                const { data, error } = await supabase
                    .from('recipes')
                    .select('data, created_at')
                    .eq('id', id)
                    .single();

                if (error || !data) return null;

                // Check if cache has expired (older than 120 days)
                if (data.created_at) {
                    const createdAt = new Date(data.created_at).getTime();
                    const now = Date.now();
                    if (now - createdAt > SUPABASE_CACHE_TTL_MS) {
                        devLog.log(`Cache expired for recipe ${id} (older than 120 days)`);
                        return null; // Return null to trigger refetch from API
                    }
                }

                return data.data as Recipe;
            },
            3,
            200,
            `fetchRecipe:${id}`
        );
    } catch (error) {
        console.error("Error fetching from Supabase:", error);
        return null;
    }
}

async function saveRecipeToSupabase(recipe: Recipe): Promise<void> {
    if (!isSupabaseConfigured()) return;

    // Fire and forget with retry - use .then() to avoid blocking
    retryAsync(
        async () => {
            const { error } = await supabase
                .from('recipes')
                .upsert({
                    id: recipe.id,
                    data: recipe,
                    created_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (error) throw error;
        },
        2,
        200,
        `saveRecipe:${recipe.id}`
    ).catch((error) => {
        console.error("Error saving to Supabase:", error);
    });
}

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

        if (response.status === 429) {
            console.warn("Spoonacular rate limit hit. Skipping retry to fail fast.");
            throw new Error("Spoonacular API rate limit exceeded");
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

        // Return cached recipe only if it has valid instructions AND thumbnail
        // Old cached recipes may be missing data from before fixes
        const hasValidInstructions = cachedRecipe?.instructions && cachedRecipe.instructions.trim() !== '';
        const hasValidThumbnail = cachedRecipe?.thumbnail && cachedRecipe.thumbnail.trim() !== '';

        if (cachedRecipe && hasValidInstructions && hasValidThumbnail) {
            return cachedRecipe;
        }

        // 2. Fetch from Spoonacular with nutrition (either no cache or incomplete cache)
        const data = await fetchFromSpoonacular<SpoonacularRecipe>(
            `recipes/${id}/information`,
            { includeNutrition: "true" }
        );

        if (!data) return null;

        const recipe = transformSpoonacularToRecipe(data);

        // 3. Save/update to Supabase with complete data
        await saveRecipeToSupabase(recipe);

        return recipe;
    } catch (error) {
        console.error("Error fetching recipe by ID from Spoonacular:", error);
        return null;
    }
}

// Pagination result type
export interface PaginatedResult {
    recipes: Recipe[];
    totalResults: number;
    hasMore: boolean;
    offset: number;
}

const PAGE_SIZE = 20;

/**
 * Search recipes by name with pagination
 * Fetches full recipe details including instructions for each result
 */
export async function searchRecipes(query: string, offset: number = 0): Promise<PaginatedResult> {
    try {
        // First, get recipe IDs from complexSearch
        const data = await fetchFromSpoonacular<SpoonacularSearchResponse>(
            "recipes/complexSearch",
            {
                query: query,
                number: PAGE_SIZE.toString(),
                offset: offset.toString(),
            }
        );

        if (!data.results || data.results.length === 0) {
            return { recipes: [], totalResults: data.totalResults || 0, hasMore: false, offset };
        }

        // Fetch full details for each recipe (includes instructions)
        const recipePromises = data.results.map(result =>
            getRecipeById(result.id.toString())
        );

        const recipes = await Promise.all(recipePromises);
        const validRecipes = recipes.filter((recipe): recipe is Recipe => recipe !== null);

        const hasMore = offset + data.results.length < data.totalResults;

        return {
            recipes: validRecipes,
            totalResults: data.totalResults,
            hasMore,
            offset,
        };
    } catch (error) {
        console.error("Error searching recipes in Spoonacular:", error);
        return { recipes: [], totalResults: 0, hasMore: false, offset };
    }
}

/**
 * Filter recipes by category (dishType) with pagination
 * Fetches full recipe details including instructions for each result
 */
export async function filterByCategory(category: string, offset: number = 0): Promise<PaginatedResult> {
    try {
        // First, get recipe IDs from complexSearch
        const data = await fetchFromSpoonacular<SpoonacularSearchResponse>(
            "recipes/complexSearch",
            {
                type: category.toLowerCase(),
                number: PAGE_SIZE.toString(),
                offset: offset.toString(),
            }
        );

        if (!data.results || data.results.length === 0) {
            return { recipes: [], totalResults: data.totalResults || 0, hasMore: false, offset };
        }

        // Fetch full details for each recipe (includes instructions)
        const recipePromises = data.results.map(result =>
            getRecipeById(result.id.toString())
        );

        const recipes = await Promise.all(recipePromises);
        const validRecipes = recipes.filter((recipe): recipe is Recipe => recipe !== null);

        const hasMore = offset + data.results.length < data.totalResults;

        return {
            recipes: validRecipes,
            totalResults: data.totalResults,
            hasMore,
            offset,
        };
    } catch (error) {
        console.error("Error filtering by category in Spoonacular:", error);
        return { recipes: [], totalResults: 0, hasMore: false, offset };
    }
}

/**
 * Filter recipes by area (cuisine) with pagination
 * Fetches full recipe details including instructions for each result
 */
export async function filterByArea(area: string, offset: number = 0): Promise<PaginatedResult> {
    try {
        // First, get recipe IDs from complexSearch
        const data = await fetchFromSpoonacular<SpoonacularSearchResponse>(
            "recipes/complexSearch",
            {
                cuisine: area,
                number: PAGE_SIZE.toString(),
                offset: offset.toString(),
            }
        );

        if (!data.results || data.results.length === 0) {
            return { recipes: [], totalResults: data.totalResults || 0, hasMore: false, offset };
        }

        // Fetch full details for each recipe (includes instructions)
        const recipePromises = data.results.map(result =>
            getRecipeById(result.id.toString())
        );

        const recipes = await Promise.all(recipePromises);
        const validRecipes = recipes.filter((recipe): recipe is Recipe => recipe !== null);

        const hasMore = offset + data.results.length < data.totalResults;

        return {
            recipes: validRecipes,
            totalResults: data.totalResults,
            hasMore,
            offset,
        };
    } catch (error) {
        console.error("Error filtering by area in Spoonacular:", error);
        return { recipes: [], totalResults: 0, hasMore: false, offset };
    }
}

/**
 * Filter recipes by diet with pagination
 * Fetches full recipe details including instructions for each result
 */
export async function filterByDiet(diet: string, offset: number = 0): Promise<PaginatedResult> {
    try {
        // First, get recipe IDs from complexSearch
        const data = await fetchFromSpoonacular<SpoonacularSearchResponse>(
            "recipes/complexSearch",
            {
                diet: diet.toLowerCase(),
                number: PAGE_SIZE.toString(),
                offset: offset.toString(),
            }
        );

        if (!data.results || data.results.length === 0) {
            return { recipes: [], totalResults: data.totalResults || 0, hasMore: false, offset };
        }

        // Fetch full details for each recipe (includes instructions)
        const recipePromises = data.results.map(result =>
            getRecipeById(result.id.toString())
        );

        const recipes = await Promise.all(recipePromises);
        const validRecipes = recipes.filter((recipe): recipe is Recipe => recipe !== null);

        const hasMore = offset + data.results.length < data.totalResults;

        return {
            recipes: validRecipes,
            totalResults: data.totalResults,
            hasMore,
            offset,
        };
    } catch (error) {
        console.error("Error filtering by diet in Spoonacular:", error);
        return { recipes: [], totalResults: 0, hasMore: false, offset };
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
/**
 * Generic wrapper for complexSearch to support unified filtering
 * Allows passing arbitrary params like type, cuisine, diet combined
 */
export async function searchRecipesWrapper(params: Record<string, string>): Promise<PaginatedResult> {
    try {
        const offset = parseInt(params.offset || '0', 10);

        // First, get recipe IDs from complexSearch
        const data = await fetchFromSpoonacular<SpoonacularSearchResponse>(
            "recipes/complexSearch",
            params
        );

        if (!data.results || data.results.length === 0) {
            return { recipes: [], totalResults: data.totalResults || 0, hasMore: false, offset };
        }

        // Fetch full details for each recipe (includes instructions)
        const recipePromises = data.results.map(result =>
            getRecipeById(result.id.toString())
        );

        const recipes = await Promise.all(recipePromises);
        const validRecipes = recipes.filter((recipe): recipe is Recipe => recipe !== null);

        const hasMore = offset + data.results.length < data.totalResults;

        return {
            recipes: validRecipes,
            totalResults: data.totalResults,
            hasMore,
            offset,
        };
    } catch (error) {
        console.error("Error in searchRecipesWrapper:", error);
        return { recipes: [], totalResults: 0, hasMore: false, offset: 0 };
    }
}
/**
 * Find recipes by ingredients
 */
export async function findByIngredients(ingredients: string[], count: number = 10): Promise<Recipe[]> {
    try {
        // Spoonacular finds recipes that use these ingredients
        // It returns a simplified object that we need to enrich
        // https://spoonacular.com/food-api/docs#Search-Recipes-by-Ingredients
        interface SpoonacularIngredientRecipe {
            id: number;
            usedIngredientCount: number;
            missedIngredientCount: number;
            unusedIngredients: unknown[];
            likes: number;
        }

        const data = await fetchFromSpoonacular<SpoonacularIngredientRecipe[]>(
            "recipes/findByIngredients",
            {
                ingredients: ingredients.join(","),
                number: count.toString(),
                ranking: "1", // Maximize used ingredients
                ignorePantry: "true",
            }
        );

        if (!data || data.length === 0) return [];

        // Strict Filtering: Only keep recipes where all search ingredients are used.
        // The 'unusedIngredients' array contains ingredients from the query that were NOT found in the recipe.
        // If it's empty, it means all our search terms were found.
        const strictMatches = data.filter((item) =>
            !item.unusedIngredients || item.unusedIngredients.length === 0
        );

        if (strictMatches.length === 0) {
            devLog.log(`No strict matches found for ingredients: ${ingredients.join(", ")} (Filtered from ${data.length} loose matches)`);
            return [];
        }

        devLog.log(`Found ${strictMatches.length} strict matches (from ${data.length} candidates)`);

        // LIMITATION: findByIngredients returns incomplete recipe objects (missing instructions)
        // We must fetch full details for each result.
        // To save quota, we only fetch full details for the top results.
        const recipePromises = strictMatches.map((item) => getRecipeById(item.id.toString()));
        const recipes = await Promise.all(recipePromises);

        return recipes.filter((r): r is Recipe => r !== null);
    } catch (error) {
        console.error("Error finding recipes by ingredients:", error);
        return [];
    }
}
