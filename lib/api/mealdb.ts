import {
    MealDBResponse,
    // MealDBMeal,
    Recipe,
    transformMealDBToRecipe,
    MealFilters,
} from "@/lib/types/recipe";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const MEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// Cache for API responses
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        return await retryAsync(
            async () => {
                const { data, error } = await supabase
                    .from('recipes')
                    .select('data')
                    .eq('id', id)
                    .single();

                if (error || !data) return null;
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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url.toString(), {
            ...fetchOptions,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

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
        await saveRecipeToSupabase(recipe);

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
        let candidateMeals: { idMeal: string }[] = [];

        // 1. Fetch by Category if present
        if (filters.category) {
            const data = await fetchFromMealDB<MealDBResponse>("filter.php", {
                c: filters.category,
            });
            if (data.meals) {
                candidateMeals = data.meals;
            } else {
                return null; // Category found no results
            }
        }

        // 2. Fetch by Area if present
        if (filters.area) {
            const data = await fetchFromMealDB<MealDBResponse>("filter.php", {
                a: filters.area,
            });

            if (data.meals) {
                if (candidateMeals.length > 0) {
                    // Intersection: Filter candidateMeals to only include those in area results
                    const areaIds = new Set(data.meals.map(m => m.idMeal));
                    candidateMeals = candidateMeals.filter(m => areaIds.has(m.idMeal));
                } else if (!filters.category) {
                    // Only area filter was present
                    candidateMeals = data.meals;
                } else {
                    // Category was present but had results, now area has results.
                    // If we are here, it means candidateMeals had items from category.
                    // The intersection logic above handles it.
                    // Wait, if candidateMeals was empty but category was present, we returned null above.
                    // So if we are here and candidateMeals is empty, it means category wasn't present.
                    // But we checked !filters.category in the else if.
                    // So this block is reachable only if category wasn't present OR if it was present and had results.
                }
            } else {
                return null; // Area found no results
            }
        }

        // 3. Pick random from candidates
        if (candidateMeals.length > 0) {
            const randomMeal = candidateMeals[Math.floor(Math.random() * candidateMeals.length)];
            return getMealById(randomMeal.idMeal);
        }

        // 4. Fallback if no filters (or if filters resulted in empty set but we didn't return null yet? No, logic covers it)
        if (!filters.category && !filters.area) {
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

        // Return cached recipe only if it has valid thumbnail AND youtube (for MealDB recipes)
        // If either is missing, refetch from API to fix corrupted cache
        const hasValidThumbnail = cachedRecipe?.thumbnail && cachedRecipe.thumbnail.trim() !== '';
        const hasValidYoutube = cachedRecipe?.youtube && cachedRecipe.youtube.trim() !== '';

        // For MealDB recipes, both thumbnail and youtube should be present
        if (cachedRecipe && hasValidThumbnail && hasValidYoutube) {
            return cachedRecipe;
        }

        // 2. Fetch from API (either no cache or cache has missing thumbnail)
        const data = await fetchFromMealDB<MealDBResponse>("lookup.php", { i: id });
        if (!data.meals || data.meals.length === 0) return null;

        const recipe = transformMealDBToRecipe(data.meals[0]);

        // 3. Save to Supabase cache (this will update corrupted entries)
        await saveRecipeToSupabase(recipe);

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

        const recipes = data.meals.map(transformMealDBToRecipe);

        // Cache all recipes to Supabase (fire and forget)
        recipes.forEach(recipe => saveRecipeToSupabase(recipe));

        return recipes;
    } catch (error) {
        console.error("Error searching meals:", error);
        return [];
    }
}

// Helper to fetch meals in batches to prevent timeouts
async function fetchMealsInBatches(meals: { idMeal: string }[], limit: number = 1000, batchSize: number = 5): Promise<Recipe[]> {
    // Increased limit to support "show all" functionality
    const targetMeals = meals.slice(0, limit);
    const results: Recipe[] = [];

    for (let i = 0; i < targetMeals.length; i += batchSize) {
        const batch = targetMeals.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(meal => getMealById(meal.idMeal))
        );
        results.push(...batchResults.filter((meal): meal is Recipe => meal !== null));

        // Small delay between batches to be nice to the API
        if (i + batchSize < targetMeals.length) {
            await wait(100);
        }
    }

    return results;
}

/**
 * Filter meals by category
 */
export async function filterByCategory(category: string): Promise<Recipe[]> {
    try {
        const data = await fetchFromMealDB<MealDBResponse>("filter.php", { c: category });
        if (!data.meals) return [];

        return fetchMealsInBatches(data.meals);
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

        return fetchMealsInBatches(data.meals);
    } catch (error) {
        console.error("Error filtering by area:", error);
        return [];
    }
}

/**
 * Filter meals by multiple criteria (Category + Area) using ID intersection
 */
export async function filterByMultiple(category?: string, area?: string): Promise<Recipe[]> {
    try {
        // 1. If only one filter is present, use the specific function
        if (category && !area) return filterByCategory(category);
        if (!category && area) return filterByArea(area);
        if (!category && !area) return [];

        // 2. If both are present, fetch IDs for both and find intersection
        const [categoryData, areaData] = await Promise.all([
            fetchFromMealDB<MealDBResponse>("filter.php", { c: category! }),
            fetchFromMealDB<MealDBResponse>("filter.php", { a: area! })
        ]);

        const categoryMeals = categoryData.meals || [];
        const areaMeals = areaData.meals || [];

        // Create a Set of IDs from the smaller list for faster lookup
        const categoryIds = new Set(categoryMeals.map(m => m.idMeal));

        // Find intersection: meals that exist in both lists
        const intersection = areaMeals.filter(meal => categoryIds.has(meal.idMeal));

        if (intersection.length === 0) return [];

        // 3. Fetch full details for the intersection
        return fetchMealsInBatches(intersection);
    } catch (error) {
        console.error("Error filtering by multiple criteria:", error);
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

        // Add timestamp to ensure different results on each call
        const timestamp = Date.now();

        // Fetch sequentially to avoid hitting rate limits with parallel requests
        while (meals.length < count && attempts < maxAttempts) {
            // Add both timestamp and random string to ensure uniqueness
            const cacheBuster = `${timestamp}-${Math.random().toString(36).substring(7)}-${attempts}`;
            const data = await fetchFromMealDB<MealDBResponse>("random.php", { cb: cacheBuster }, {
                cache: "no-store",
            });

            if (data.meals && data.meals.length > 0) {
                const recipe = transformMealDBToRecipe(data.meals[0]);
                if (!seenIds.has(recipe.id)) {
                    meals.push(recipe);
                    seenIds.add(recipe.id);
                    // Cache the random meal for future direct access
                    await saveRecipeToSupabase(recipe);
                }
            }

            attempts++;
            // Small delay between requests
            if (meals.length < count) {
                await wait(100);
            }
        }

        return meals;
    } catch (error) {
        console.error("Error fetching multiple random meals:", error);
        return [];
    }
}

/**
 * Get random recipes from Supabase
 */
export async function getRandomRecipesFromSupabase(count: number, excludeIds: string[] = []): Promise<Recipe[]> {
    if (!isSupabaseConfigured()) return [];

    try {
        return await retryAsync(
            async () => {
                // Fetch a larger pool of recent recipes to pick from
                let query = supabase
                    .from('recipes')
                    .select('data')
                    .limit(100)
                    .order('created_at', { ascending: false });

                // Filter out recipes we already have
                if (excludeIds.length > 0) {
                    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
                }

                const { data, error } = await query;

                if (error || !data) return [];

                const recipes = data.map(row => row.data as Recipe);

                // Shuffle and pick 'count' recipes
                const shuffled = recipes.sort(() => 0.5 - Math.random());
                return shuffled.slice(0, count);
            },
            3,
            200,
            'getRandomRecipesFromSupabase'
        );
    } catch (error) {
        console.error("Error fetching random from Supabase:", error);
        return [];
    }
}

/**
 * Get recipes from Supabase with filters
 */
export async function getRecipesFromSupabase(category?: string, area?: string, diet?: string): Promise<Recipe[]> {
    if (!isSupabaseConfigured()) return [];

    try {
        let query = supabase
            .from('recipes')
            .select('data');

        // Since we store the whole JSON in 'data' column, we need to use JSON operators
        // Assuming 'data' column is JSONB.
        // Note: This depends on how the data is structured in the JSON column.
        // Based on Recipe type: category -> category, area -> area

        if (category) {
            query = query.eq('data->>category', category);
        }

        if (area) {
            query = query.eq('data->>area', area);
        }

        if (diet) {
            // Tags is an array in the JSON. Use contains operator for arrays
            // We check for both the exact diet string and a lowercase version to be safe
            // Using .or() with the containment operator (cs)
            const dietLower = diet.toLowerCase();
            const dietProper = diet.charAt(0).toUpperCase() + diet.slice(1).toLowerCase();

            // Construct filter string for .or()
            // This checks if tags contains [diet] OR [dietLower] OR [dietProper]
            // Note: This assumes diet doesn't contain commas or special chars that break the syntax
            query = query.or(`data->tags.cs.{${diet}},data->tags.cs.{${dietLower}},data->tags.cs.{${dietProper}}`);
        }

        // Limit to reasonable amount, but high enough to be useful
        query = query.limit(100);

        const { data, error } = await query;

        if (error || !data) return [];

        return data.map(row => row.data as Recipe);
    } catch (error) {
        console.error("Error fetching filtered recipes from Supabase:", error);
        return [];
    }
}

/**
 * Search recipes in Supabase by name
 */
export async function searchRecipesInSupabase(searchQuery: string): Promise<Recipe[]> {
    if (!isSupabaseConfigured()) return [];

    try {
        return await retryAsync(
            async () => {
                const { data, error } = await supabase
                    .from('recipes')
                    .select('data')
                    .ilike('data->>name', `%${searchQuery}%`)
                    .limit(50);

                if (error || !data) return [];

                return data.map(row => row.data as Recipe);
            },
            3,
            200,
            'searchRecipesInSupabase'
        );
    } catch (error) {
        console.error("Error searching recipes in Supabase:", error);
        return [];
    }
}

/**
 * Get a random recipe from Supabase with filters
 */
export async function getRandomRecipeFromSupabaseWithFilters(filters: MealFilters): Promise<Recipe | null> {
    if (!isSupabaseConfigured()) return null;

    try {
        return await retryAsync(
            async () => {
                let query = supabase
                    .from('recipes')
                    .select('data');

                if (filters.category) {
                    query = query.eq('data->>category', filters.category);
                }

                if (filters.area) {
                    query = query.eq('data->>area', filters.area);
                }

                if (filters.diet) {
                    query = query.contains('data->tags', [filters.diet]);
                }

                // Fetch a batch of matching recipes
                const { data, error } = await query.limit(20);

                if (error || !data || data.length === 0) return null;

                // Pick a random one
                const randomIndex = Math.floor(Math.random() * data.length);
                return data[randomIndex].data as Recipe;
            },
            3,
            200,
            'getRandomRecipeFromSupabaseWithFilters'
        );
    } catch (error) {
        console.error("Error fetching random filtered recipe from Supabase:", error);
        return null;
    }
}

/**
 * Get related recipes based on category
 */
export async function getRelatedRecipes(category: string, currentId: string, count: number = 3): Promise<Recipe[]> {
    try {
        // Fetch all meals in the category
        const data = await fetchFromMealDB<MealDBResponse>("filter.php", { c: category });

        if (!data.meals || data.meals.length === 0) {
            // Fallback to random if no category matches
            return getMultipleRandomMeals(count);
        }

        // Filter out current recipe
        const otherMeals = data.meals.filter(meal => meal.idMeal !== currentId);

        if (otherMeals.length === 0) {
            return getMultipleRandomMeals(count);
        }

        // Shuffle using Fisher-Yates algorithm
        const shuffled = [...otherMeals];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const selected = shuffled.slice(0, count);

        // Fetch full details for selected meals
        const detailedMeals = await Promise.all(
            selected.map(meal => getMealById(meal.idMeal))
        );

        const validMeals = detailedMeals.filter((meal): meal is Recipe => meal !== null);

        // If we didn't get enough valid meals (e.g. API errors), fill with randoms
        if (validMeals.length < count) {
            const randoms = await getMultipleRandomMeals(count - validMeals.length);
            return [...validMeals, ...randoms];
        }

        return validMeals;
    } catch (error) {
        console.error("Error fetching related recipes:", error);
        return getMultipleRandomMeals(count);
    }
}
