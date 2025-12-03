/**
 * Unified Recipe API
 * 
 * This module provides a unified interface for recipe operations that can use
 * either TheMealDB or Spoonacular APIs based on configuration.
 * 
 * Provider Selection:
 * - Set RECIPE_API_PROVIDER in .env.local to: 'mealdb', 'spoonacular', or 'hybrid'
 * - Default: 'mealdb' (free, unlimited)
 */

import { Recipe, MealFilters } from "@/lib/types/recipe";
import * as mealdb from "./mealdb";
import * as spoonacular from "./spoonacular";

// Get API provider from environment variable
const getProvider = (): 'mealdb' | 'spoonacular' | 'hybrid' => {
    const provider = process.env.RECIPE_API_PROVIDER || 'hybrid';
    if (provider !== 'mealdb' && provider !== 'spoonacular' && provider !== 'hybrid') {
        console.warn(`Invalid RECIPE_API_PROVIDER: ${provider}. Defaulting to 'mealdb'`);
        return 'mealdb';
    }
    return provider as 'mealdb' | 'spoonacular' | 'hybrid';
};

/**
 * Get a random meal/recipe
 */
export async function getRandomMeal(): Promise<Recipe | null> {
    const provider = getProvider();

    try {
        if (provider === 'spoonacular') {
            return await spoonacular.getRandomRecipe();
        } else if (provider === 'hybrid') {
            // Try TheMealDB first, fallback to Spoonacular
            const meal = await mealdb.getRandomMeal();
            if (meal) return meal;

            console.log("TheMealDB failed, trying Spoonacular...");
            return await spoonacular.getRandomRecipe();
        } else {
            // Default: mealdb
            return await mealdb.getRandomMeal();
        }
    } catch (error) {
        console.error("Error in getRandomMeal:", error);

        // Fallback in hybrid mode
        if (provider === 'hybrid') {
            try {
                return await mealdb.getRandomMeal();
            } catch (fallbackError) {
                console.error("Fallback also failed:", fallbackError);
            }
        }

        return null;
    }
}

/**
 * Get a random meal with filters
 */
export async function getRandomMealWithFilters(filters: MealFilters): Promise<Recipe | null> {
    const provider = getProvider();

    try {
        if (provider === 'spoonacular') {
            return await spoonacular.getRandomRecipeWithFilters(filters);
        } else if (provider === 'hybrid') {
            const meal = await mealdb.getRandomMealWithFilters(filters);
            if (meal) return meal;

            console.log("TheMealDB filtered random failed, trying Spoonacular...");
            return await spoonacular.getRandomRecipeWithFilters(filters);
        } else {
            return await mealdb.getRandomMealWithFilters(filters);
        }
    } catch (error) {
        console.error("Error in getRandomMealWithFilters:", error);

        if (provider === 'hybrid') {
            try {
                return await mealdb.getRandomMealWithFilters(filters);
            } catch (fallbackError) {
                console.error("Fallback also failed:", fallbackError);
            }
        }

        return null;
    }
}

/**
 * Get meal/recipe by ID
 */
export async function getMealById(id: string): Promise<Recipe | null> {
    const provider = getProvider();

    try {
        if (provider === 'spoonacular') {
            return await spoonacular.getRecipeById(id);
        } else if (provider === 'hybrid') {
            // In hybrid mode, try to determine which API the ID belongs to
            // Spoonacular IDs are typically numeric, MealDB IDs are typically 5+ digits
            const isSpoonacularId = /^\d{1,6}$/.test(id);

            if (isSpoonacularId) {
                const recipe = await spoonacular.getRecipeById(id);
                if (recipe) return recipe;
            }

            // Try MealDB
            return await mealdb.getMealById(id);
        } else {
            return await mealdb.getMealById(id);
        }
    } catch (error) {
        console.error("Error in getMealById:", error);
        return null;
    }
}

/**
 * Search meals/recipes by query
 */
export async function searchMeals(query: string): Promise<Recipe[]> {
    const provider = getProvider();

    try {
        if (provider === 'spoonacular') {
            return await spoonacular.searchRecipes(query);
        } else if (provider === 'hybrid') {
            // In hybrid mode, combine results from both APIs
            const [mealdbResults, spoonacularResults] = await Promise.allSettled([
                mealdb.searchMeals(query),
                spoonacular.searchRecipes(query),
            ]);

            const results: Recipe[] = [];

            if (mealdbResults.status === 'fulfilled') {
                results.push(...mealdbResults.value);
            }

            if (spoonacularResults.status === 'fulfilled') {
                results.push(...spoonacularResults.value);
            }

            // Remove duplicates by name (simple deduplication)
            const seen = new Set<string>();
            return results.filter(recipe => {
                const key = recipe.name.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        } else {
            return await mealdb.searchMeals(query);
        }
    } catch (error) {
        console.error("Error in searchMeals:", error);
        return [];
    }
}

/**
 * Filter by category
 */
export async function filterByCategory(category: string): Promise<Recipe[]> {
    const provider = getProvider();

    try {
        if (provider === 'spoonacular') {
            return await spoonacular.filterByCategory(category);
        } else if (provider === 'hybrid') {
            // Use TheMealDB primarily for categories
            const results = await mealdb.filterByCategory(category);
            if (results.length > 0) return results;

            console.log("TheMealDB category filter returned no results, trying Spoonacular...");
            return await spoonacular.filterByCategory(category);
        } else {
            return await mealdb.filterByCategory(category);
        }
    } catch (error) {
        console.error("Error in filterByCategory:", error);
        return [];
    }
}

/**
 * Filter by area/cuisine
 */
export async function filterByArea(area: string): Promise<Recipe[]> {
    const provider = getProvider();

    try {
        if (provider === 'spoonacular') {
            return await spoonacular.filterByArea(area);
        } else if (provider === 'hybrid') {
            // Use TheMealDB primarily
            const results = await mealdb.filterByArea(area);
            if (results.length > 0) return results;

            console.log("TheMealDB area filter returned no results, trying Spoonacular...");
            return await spoonacular.filterByArea(area);
        } else {
            return await mealdb.filterByArea(area);
        }
    } catch (error) {
        console.error("Error in filterByArea:", error);
        return [];
    }
}

/**
 * Filter meals by multiple criteria (Category + Area)
 */
export async function filterByMultiple(category?: string, area?: string): Promise<Recipe[]> {
    const provider = getProvider();

    try {
        if (provider === 'spoonacular') {
            // Spoonacular supports complex filtering natively
            // For now, we'll just use the search endpoint with filters if implemented,
            // or fallback to basic filtering. Since spoonacular.ts isn't updated yet,
            // we'll implement a basic version here or assume it handles it.
            // TODO: Update spoonacular.ts to support multiple filters properly
            if (category) return await spoonacular.filterByCategory(category);
            if (area) return await spoonacular.filterByArea(area);
            return [];
        } else if (provider === 'hybrid') {
            // Use TheMealDB primarily
            const results = await mealdb.filterByMultiple(category, area);
            if (results.length > 0) return results;

            console.log("TheMealDB multiple filter returned no results, trying Spoonacular...");
            // Fallback: try one filter
            if (category) return await spoonacular.filterByCategory(category);
            return [];
        } else {
            return await mealdb.filterByMultiple(category, area);
        }
    } catch (error) {
        console.error("Error in filterByMultiple:", error);
        return [];
    }
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<string[]> {
    const provider = getProvider();

    try {
        if (provider === 'spoonacular') {
            return await spoonacular.getCategories();
        } else if (provider === 'hybrid') {
            // In hybrid mode, combine categories from both APIs
            const [mealdbCats, spoonacularCats] = await Promise.allSettled([
                mealdb.getCategories(),
                spoonacular.getCategories(),
            ]);

            const categories: string[] = [];

            if (mealdbCats.status === 'fulfilled') {
                categories.push(...mealdbCats.value);
            }

            if (spoonacularCats.status === 'fulfilled') {
                categories.push(...spoonacularCats.value);
            }

            // Remove duplicates and sort
            return Array.from(new Set(categories)).sort();
        } else {
            return await mealdb.getCategories();
        }
    } catch (error) {
        console.error("Error in getCategories:", error);
        return [];
    }
}

/**
 * Get all areas/cuisines
 */
export async function getAreas(): Promise<string[]> {
    const provider = getProvider();

    try {
        if (provider === 'spoonacular') {
            return await spoonacular.getAreas();
        } else if (provider === 'hybrid') {
            // In hybrid mode, combine areas from both APIs
            const [mealdbAreas, spoonacularAreas] = await Promise.allSettled([
                mealdb.getAreas(),
                spoonacular.getAreas(),
            ]);

            const areas: string[] = [];

            if (mealdbAreas.status === 'fulfilled') {
                areas.push(...mealdbAreas.value);
            }

            if (spoonacularAreas.status === 'fulfilled') {
                areas.push(...spoonacularAreas.value);
            }

            // Remove duplicates and sort
            return Array.from(new Set(areas)).sort();
        } else {
            return await mealdb.getAreas();
        }
    } catch (error) {
        console.error("Error in getAreas:", error);
        return [];
    }
}

/**
 * Get multiple random meals/recipes
 */
export async function getMultipleRandomMeals(count: number = 6): Promise<Recipe[]> {
    const provider = getProvider();

    try {
        if (provider === 'spoonacular') {
            return await spoonacular.getMultipleRandomRecipes(count);
        } else if (provider === 'hybrid') {
            // In hybrid mode, get from TheMealDB first
            const results = await mealdb.getMultipleRandomMeals(count);
            if (results.length >= count) return results;

            // If we didn't get enough, supplement with Spoonacular
            const remaining = count - results.length;
            if (remaining > 0) {
                const spoonacularResults = await spoonacular.getMultipleRandomRecipes(remaining);
                results.push(...spoonacularResults);
            }

            return results;
        } else {
            return await mealdb.getMultipleRandomMeals(count);
        }
    } catch (error) {
        console.error("Error in getMultipleRandomMeals:", error);
        return [];
    }
}

/**
 * Get related recipes based on category
 */
export async function getRelatedRecipes(category: string, currentId: string, count: number = 3): Promise<Recipe[]> {
    const provider = getProvider();

    try {
        if (provider === 'spoonacular') {
            return await spoonacular.getSimilarRecipes(currentId, count);
        } else if (provider === 'hybrid') {
            // Use TheMealDB primarily
            let results = await mealdb.getRelatedRecipes(category, currentId, count);
            if (results.length >= count) return results;

            console.log("TheMealDB related recipes returned insufficient results, trying Spoonacular...");

            try {
                // Try to get similar recipes from Spoonacular if ID is numeric (Spoonacular ID)
                if (/^\d{1,6}$/.test(currentId)) {
                    const similar = await spoonacular.getSimilarRecipes(currentId, count - results.length);
                    results = [...results, ...similar];
                } else {
                    // Otherwise fallback to random Spoonacular recipes
                    const remaining = count - results.length;
                    const spoonacularResults = await spoonacular.getMultipleRandomRecipes(remaining);
                    results = [...results, ...spoonacularResults];
                }
            } catch (spoonError) {
                console.error("Spoonacular related recipes failed:", spoonError);
                // Fallback to MealDB random if Spoonacular fails
                try {
                    const remaining = count - results.length;
                    if (remaining > 0) {
                        const randomMealDb = await mealdb.getMultipleRandomMeals(remaining);
                        results = [...results, ...randomMealDb];
                    }
                } catch (mealDbError) {
                    console.error("MealDB fallback failed:", mealDbError);
                }
            }

            return results;
        } else {
            return await mealdb.getRelatedRecipes(category, currentId, count);
        }
    } catch (error) {
        console.error("Error in getRelatedRecipes:", error);
        return [];
    }
}

// Re-export types for convenience
export type { Recipe, MealFilters } from "@/lib/types/recipe";
