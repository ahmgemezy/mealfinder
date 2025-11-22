import {
    MealDBResponse,
    MealDBMeal,
    Recipe,
    transformMealDBToRecipe,
    MealFilters,
} from "@/lib/types/recipe";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const MEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCacheKey(endpoint: string, params?: Record<string, string>): string {
    const paramString = params ? JSON.stringify(params) : "";
    return `${endpoint}${paramString}`;
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

// Supabase Caching Helpers

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
        // Fire and forget - don't await this to avoid slowing down the response
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

async function fetchFromMealDB<T>(
    endpoint: string,
    params?: Record<string, string>,
    options?: RequestInit,
    retries = 3,
    backoff = 300
): Promise<T> {
    // Don't cache random endpoint
    const isRandom = endpoint.includes("random.php");

    if (!isRandom) {
        const cacheKey = getCacheKey(endpoint, params);
        const cached = getFromCache<T>(cacheKey);
        if (cached) return cached;
    }

    const url = new URL(`${MEALDB_BASE_URL}/${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    const fetchOptions: RequestInit = {
        ...options,
        next: isRandom ? { revalidate: 0 } : { revalidate: 900 },
    };

    try {
        const response = await fetch(url.toString(), fetchOptions);

        if (response.status === 429 && retries > 0) {
            // Rate limited, wait and retry
            await wait(backoff);
            return fetchFromMealDB<T>(endpoint, params, options, retries - 1, backoff * 2);
        }

        if (!response.ok) {
            throw new Error(`MealDB API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!isRandom) {
            const cacheKey = getCacheKey(endpoint, params);
            setCache(cacheKey, data);
        }

        return data;
    } catch (error) {
        if (retries > 0) {
            await wait(backoff);
            return fetchFromMealDB<T>(endpoint, params, options, retries - 1, backoff * 2);
        }
        throw error;
    }
}

/**
 * Get a random meal
 */
export async function getRandomMeal(): Promise<Recipe | null> {
    try {
        // Add a cache buster to ensure we get different meals when calling in parallel
        const cacheBuster = Math.random().toString(36).substring(7);
        const data = await fetchFromMealDB<MealDBResponse>("random.php", { cb: cacheBuster }, {
            cache: "no-store",
        });
        if (!data.meals || data.meals.length === 0) return null;
        const recipe = transformMealDBToRecipe(data.meals[0]);

        // Cache the random meal for future direct access
        saveRecipeToSupabase(recipe);

        return recipe;
    } catch (error) {
        console.error("Error fetching random meal:", error);
        return null;
    }
}

/**
 * Get a random meal with filters
 * Note: TheMealDB doesn't support filtering random meals directly,
 * so we fetch by category/area and pick a random one
 */
export async function getRandomMealWithFilters(
    filters: MealFilters
): Promise<Recipe | null> {
    try {
        let meals: MealDBMeal[] = [];

        if (filters.category) {
            const data = await fetchFromMealDB<MealDBResponse>("filter.php", {
                c: filters.category,
            });
            if (data.meals) {
                // Filter endpoint returns partial data, need to fetch full details
                const randomMeal = data.meals[Math.floor(Math.random() * data.meals.length)];
                return getMealById(randomMeal.idMeal);
            }
        } else if (filters.area) {
            const data = await fetchFromMealDB<MealDBResponse>("filter.php", {
                a: filters.area,
            });
            if (data.meals) {
                const randomMeal = data.meals[Math.floor(Math.random() * data.meals.length)];
                return getMealById(randomMeal.idMeal);
            }
        } else {
            // No filters, return random meal
            return getRandomMeal();
        }

        return null;
    } catch (error) {
        console.error("Error fetching filtered random meal:", error);
        return null;
    }
}

/**
 * Get meal by ID
 */
export async function getMealById(id: string): Promise<Recipe | null> {
    try {
        // 1. Try to get from Supabase cache first
        const cachedRecipe = await fetchRecipeFromSupabase(id);
        if (cachedRecipe) {
            // console.log(`Cache hit for recipe ${id}`);
            return cachedRecipe;
        }

        // 2. If not in cache, fetch from API
        const data = await fetchFromMealDB<MealDBResponse>("lookup.php", { i: id });
        if (!data.meals || data.meals.length === 0) return null;

        const recipe = transformMealDBToRecipe(data.meals[0]);

        // 3. Save to Supabase cache
        saveRecipeToSupabase(recipe);

        return recipe;
    } catch (error) {
        console.error("Error fetching meal by ID:", error);
        return null;
    }
}

/**
 * Search meals by name
 */
export async function searchMeals(query: string): Promise<Recipe[]> {
    try {
        const data = await fetchFromMealDB<MealDBResponse>("search.php", { s: query });
        if (!data.meals) return [];
        return data.meals.map(transformMealDBToRecipe);
    } catch (error) {
        console.error("Error searching meals:", error);
        return [];
    }
}

/**
 * Filter meals by category
 */
export async function filterByCategory(category: string): Promise<Recipe[]> {
    try {
        const data = await fetchFromMealDB<MealDBResponse>("filter.php", { c: category });
        if (!data.meals) return [];

        // Filter endpoint returns partial data, fetch full details for first 12
        const detailedMeals = await Promise.all(
            data.meals.slice(0, 12).map(meal => getMealById(meal.idMeal))
        );

        return detailedMeals.filter((meal): meal is Recipe => meal !== null);
    } catch (error) {
        console.error("Error filtering by category:", error);
        return [];
    }
}

/**
 * Filter meals by area (cuisine)
 */
export async function filterByArea(area: string): Promise<Recipe[]> {
    try {
        const data = await fetchFromMealDB<MealDBResponse>("filter.php", { a: area });
        if (!data.meals) return [];

        // Filter endpoint returns partial data, fetch full details for first 12
        const detailedMeals = await Promise.all(
            data.meals.slice(0, 12).map(meal => getMealById(meal.idMeal))
        );

        return detailedMeals.filter((meal): meal is Recipe => meal !== null);
    } catch (error) {
        console.error("Error filtering by area:", error);
        return [];
    }
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<string[]> {
    try {
        const data = await fetchFromMealDB<{ categories: Array<{ strCategory: string }> }>(
            "categories.php"
        );
        return data.categories.map(cat => cat.strCategory);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

/**
 * Get all areas (cuisines)
 */
export async function getAreas(): Promise<string[]> {
    try {
        const data = await fetchFromMealDB<{ meals: Array<{ strArea: string }> }>(
            "list.php",
            { a: "list" }
        );
        return data.meals.map(area => area.strArea);
    } catch (error) {
        console.error("Error fetching areas:", error);
        return [];
    }
}

/**
 * Get multiple random meals (for homepage featured section)
 */
export async function getMultipleRandomMeals(count: number = 6): Promise<Recipe[]> {
    try {
        const meals: Recipe[] = [];
        const seenIds = new Set<string>();
        const maxAttempts = count * 2; // Limit attempts to avoid infinite loops
        let attempts = 0;

        // Fetch sequentially to avoid hitting rate limits with parallel requests
        while (meals.length < count && attempts < maxAttempts) {
            const meal = await getRandomMeal();
            if (meal && !seenIds.has(meal.id)) {
                meals.push(meal);
                seenIds.add(meal.id);
            }
            attempts++;
            // Small delay between requests
            await wait(100);
        }

        return meals;
    } catch (error) {
        console.error("Error fetching multiple random meals:", error);
        return [];
    }
}
