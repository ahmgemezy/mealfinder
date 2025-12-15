/**
 * Unified Recipe API
 * "use server" directive ensures this code runs on the server,
 * allowing secure access to environment variables.
 */
"use server";

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
import { devLog } from "@/lib/utils/logger";
import {
  validateRecipeId,
  validateSearchQuery,
  validateCategory,
  validateArea,
  sanitizeInput,
} from "@/lib/utils/validation";

// Get API provider from environment variable
const getProvider = (): "mealdb" | "spoonacular" | "hybrid" => {
  const provider = process.env.RECIPE_API_PROVIDER || "hybrid";
  if (
    provider !== "mealdb" &&
    provider !== "spoonacular" &&
    provider !== "hybrid"
  ) {
    console.warn(
      `Invalid RECIPE_API_PROVIDER: ${provider}. Defaulting to 'mealdb'`
    );
    return "mealdb";
  }
  return provider as "mealdb" | "spoonacular" | "hybrid";
};

// Re-export PaginatedResult for use in components
export type { PaginatedResult } from "./spoonacular";

/**
 * Get a random meal/recipe
 */
export async function getRandomMeal(): Promise<Recipe | null> {
  const provider = getProvider();

  try {
    if (provider === "spoonacular") {
      return await spoonacular.getRandomRecipe();
    } else if (provider === "hybrid") {
      // Try TheMealDB first, fallback to Spoonacular
      const meal = await mealdb.getRandomMeal();
      if (meal) return meal;

      devLog.log("TheMealDB failed, trying Spoonacular...");
      return await spoonacular.getRandomRecipe();
    } else {
      // Default: mealdb
      return await mealdb.getRandomMeal();
    }
  } catch (error) {
    console.error("Error in getRandomMeal:", error);

    // Fallback in hybrid mode
    if (provider === "hybrid") {
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
export async function getRandomMealWithFilters(
  filters: MealFilters
): Promise<Recipe | null> {
  const provider = getProvider();

  try {
    // 1. Database (Supabase) - Always check first
    if (provider === "hybrid" || provider === "mealdb") {
      try {
        const dbMeal =
          await mealdb.getRandomRecipeFromSupabaseWithFilters(filters);
        if (dbMeal) {
          devLog.log("Found random filtered meal in Supabase");
          return dbMeal;
        }
      } catch (error) {
        console.error("Database random filtered fetch failed:", error);
      }
    }

    if (provider === "spoonacular") {
      return await spoonacular.getRandomRecipeWithFilters(filters);
    } else if (provider === "hybrid") {
      const meal = await mealdb.getRandomMealWithFilters(filters);
      if (meal) return meal;

      devLog.log("TheMealDB filtered random failed, trying Spoonacular...");
      return await spoonacular.getRandomRecipeWithFilters(filters);
    } else {
      return await mealdb.getRandomMealWithFilters(filters);
    }
  } catch (error) {
    console.error("Error in getRandomMealWithFilters:", error);

    if (provider === "hybrid") {
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
  // Validate recipe ID
  if (!validateRecipeId(id)) {
    console.warn("Invalid recipe ID provided to getMealById:", id);
    return null;
  }

  const provider = getProvider();

  try {
    if (provider === "spoonacular") {
      return await spoonacular.getRecipeById(id);
    } else if (provider === "hybrid") {
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
  // Validate and sanitize search query
  if (!validateSearchQuery(query)) {
    console.warn("Invalid search query provided to searchMeals:", query);
    return [];
  }

  const sanitizedQuery = sanitizeInput(query);
  if (!sanitizedQuery) {
    return [];
  }

  const provider = getProvider();

  try {
    const results: Recipe[] = [];
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();

    // 1. Database (Supabase) - Always check first
    if (provider === "hybrid" || provider === "mealdb") {
      try {
        const dbRecipes = await mealdb.searchRecipesInSupabase(sanitizedQuery);
        dbRecipes.forEach((r) => {
          if (!seenIds.has(r.id)) {
            results.push(r);
            seenIds.add(r.id);
            seenNames.add(r.name.toLowerCase());
          }
        });
      } catch (error) {
        console.error("Database search failed:", error);
      }
    }

    if (provider === "spoonacular") {
      const spoonResult = await spoonacular.searchRecipes(sanitizedQuery);
      spoonResult.recipes.forEach((r) => {
        if (!seenIds.has(r.id)) {
          results.push(r);
          seenIds.add(r.id);
          seenNames.add(r.name.toLowerCase());
        }
      });
    } else if (provider === "hybrid") {
      // In hybrid mode, combine results from both APIs
      const [mealdbResults, spoonacularResults] = await Promise.allSettled([
        mealdb.searchMeals(sanitizedQuery),
        spoonacular.searchRecipes(sanitizedQuery),
      ]);

      if (mealdbResults.status === "fulfilled") {
        mealdbResults.value.forEach((r) => {
          if (!seenIds.has(r.id)) {
            results.push(r);
            seenIds.add(r.id);
            seenNames.add(r.name.toLowerCase());
          }
        });
      }

      if (spoonacularResults.status === "fulfilled") {
        spoonacularResults.value.recipes.forEach((r) => {
          if (!seenIds.has(r.id)) {
            results.push(r);
            seenIds.add(r.id);
            seenNames.add(r.name.toLowerCase());
          }
        });
      }
    } else {
      // MealDB only
      const mealdbRecipes = await mealdb.searchMeals(sanitizedQuery);
      mealdbRecipes.forEach((r) => {
        if (!seenIds.has(r.id)) {
          results.push(r);
          seenIds.add(r.id);
          seenNames.add(r.name.toLowerCase());
        }
      });
    }

    return results;
  } catch (error) {
    console.error("Error in searchMeals:", error);
    return [];
  }
}

/**
 * Load more search results (for pagination)
 */
export async function loadMoreSearchResults(
  query: string,
  offset: number,
  existingIds: string[]
): Promise<{ recipes: Recipe[]; hasMore: boolean }> {
  const provider = getProvider();

  try {
    if (provider === "spoonacular" || provider === "hybrid") {
      const result = await spoonacular.searchRecipes(query, offset);
      const seenIds = new Set(existingIds);
      const newRecipes = result.recipes.filter((r) => !seenIds.has(r.id));
      return { recipes: newRecipes, hasMore: result.hasMore };
    }
    return { recipes: [], hasMore: false };
  } catch (error) {
    console.error("Error loading more search results:", error);
    return { recipes: [], hasMore: false };
  }
}

/**
 * Filter by category
 */
export async function filterByCategory(category: string): Promise<Recipe[]> {
  // Validate category
  if (!validateCategory(category)) {
    console.warn("Invalid category provided to filterByCategory:", category);
    return [];
  }

  const provider = getProvider();
  const results: Recipe[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  try {
    // 1. Database (always try first)
    if (provider === "hybrid" || provider === "mealdb") {
      try {
        const dbRecipes = await mealdb.getRecipesFromSupabase(
          category,
          undefined
        );
        dbRecipes.forEach((r) => {
          if (!seenIds.has(r.id)) {
            results.push(r);
            seenIds.add(r.id);
            seenNames.add(r.name.toLowerCase());
          }
        });
      } catch (error) {
        console.error("Database filter failed:", error);
      }
    }

    // 2. TheMealDB
    if (provider === "hybrid" || provider === "mealdb") {
      // Optimization: If we have enough results from DB, skip API to save quota
      if (results.length < 12) {
        const mealdbRecipes = await mealdb.filterByCategory(category);
        mealdbRecipes.forEach((r) => {
          if (!seenIds.has(r.id)) {
            results.push(r);
            seenIds.add(r.id);
            seenNames.add(r.name.toLowerCase());
          }
        });
      } else {
        /* devLog.log(
          `Skipping MealDB API for category '${category}' as we have enough results from DB`
        ); */
      }
    }

    // 3. Spoonacular (if hybrid or spoonacular)
    if (provider === "hybrid" || provider === "spoonacular") {
      const spoonResult = await spoonacular.filterByCategory(category);
      spoonResult.recipes.forEach((r) => {
        if (!seenIds.has(r.id)) {
          results.push(r);
          seenIds.add(r.id);
          seenNames.add(r.name.toLowerCase());
        }
      });
    }

    return results;
  } catch (error) {
    console.error("Error in filterByCategory:", error);
    return results;
  }
}

/**
 * Load more category filter results (for pagination)
 */
export async function loadMoreCategoryResults(
  category: string,
  offset: number,
  existingIds: string[]
): Promise<{ recipes: Recipe[]; hasMore: boolean }> {
  const provider = getProvider();
  const PAGE_SIZE = 12;
  const recipes: Recipe[] = [];

  try {
    // 1. Try Supabase first (Always)
    if (
      provider === "hybrid" ||
      provider === "mealdb" ||
      provider === "spoonacular"
    ) {
      try {
        // Fetch next page from Supabase
        const dbRecipes = await mealdb.getRecipesFromSupabase(
          category,
          undefined,
          undefined,
          offset,
          PAGE_SIZE
        );

        // Filter out any that strictly exist already
        const seenIds = new Set(existingIds);
        dbRecipes.forEach((r) => {
          if (!seenIds.has(r.id)) {
            recipes.push(r);
            seenIds.add(r.id);
          }
        });
      } catch (error) {
        console.error("Database loadMore failed:", error);
      }
    }

    // 2. If we filled the page, return
    if (recipes.length >= PAGE_SIZE) {
      return { recipes, hasMore: true }; // Optimistic
    }

    // 3. Fallback to API (Spoonacular) if applicable
    // Only Spoonacular effectively supports offset-based pagination in this codebase
    if (provider === "spoonacular" || provider === "hybrid") {
      const needed = PAGE_SIZE - recipes.length;
      // We fetch with original offset?
      // If we fetched 12 from DB (offset 0), and returned 5.
      // Client asks for offset 5? No, client asks for Page 2 (offset 12).
      // If DB returned 5 recipes for offset 12... it means DB is ending.
      // We should fetch from API using offset. But API offset logic must align.
      // Simplified: Just fetch from API using the same offset, and dedupe.

      const result = await spoonacular.filterByCategory(category, offset);
      const seenIds = new Set([...existingIds, ...recipes.map((r) => r.id)]);
      const newRecipes = result.recipes.filter((r) => !seenIds.has(r.id));

      return {
        recipes: [...recipes, ...newRecipes],
        hasMore: result.hasMore,
      };
    }

    return { recipes, hasMore: recipes.length === PAGE_SIZE };
  } catch (error) {
    console.error("Error loading more category results:", error);
    return { recipes: [], hasMore: false };
  }
}

/**
 * Filter by area/cuisine
 */
export async function filterByArea(area: string): Promise<Recipe[]> {
  // Validate area
  if (!validateArea(area)) {
    console.warn("Invalid area provided to filterByArea:", area);
    return [];
  }

  const provider = getProvider();
  const results: Recipe[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  try {
    // 1. Database
    if (provider === "hybrid" || provider === "mealdb") {
      try {
        const dbRecipes = await mealdb.getRecipesFromSupabase(undefined, area);
        dbRecipes.forEach((r) => {
          if (!seenIds.has(r.id)) {
            results.push(r);
            seenIds.add(r.id);
            seenNames.add(r.name.toLowerCase());
          }
        });
      } catch (error) {
        console.error("Database filter failed:", error);
      }
    }

    // 2. TheMealDB
    if (provider === "hybrid" || provider === "mealdb") {
      // Optimization: If we have enough results from DB, skip API to save quota
      if (results.length < 12) {
        const mealdbRecipes = await mealdb.filterByArea(area);
        mealdbRecipes.forEach((r) => {
          if (!seenIds.has(r.id)) {
            results.push(r);
            seenIds.add(r.id);
            seenNames.add(r.name.toLowerCase());
          }
        });
      } else {
        /* devLog.log(
          `Skipping MealDB API for area '${area}' as we have enough results from DB`
        ); */
      }
    }

    // 3. Spoonacular
    if (provider === "hybrid" || provider === "spoonacular") {
      const spoonResult = await spoonacular.filterByArea(area);
      spoonResult.recipes.forEach((r) => {
        if (!seenIds.has(r.id)) {
          results.push(r);
          seenIds.add(r.id);
          seenNames.add(r.name.toLowerCase());
        }
      });
    }

    return results;
  } catch (error) {
    console.error("Error in filterByArea:", error);
    return results;
  }
}

/**
 * Load more area filter results (for pagination)
 */
export async function loadMoreAreaResults(
  area: string,
  offset: number,
  existingIds: string[]
): Promise<{ recipes: Recipe[]; hasMore: boolean }> {
  const provider = getProvider();

  try {
    if (provider === "spoonacular" || provider === "hybrid") {
      const result = await spoonacular.filterByArea(area, offset);
      const seenIds = new Set(existingIds);
      const newRecipes = result.recipes.filter((r) => !seenIds.has(r.id));
      return { recipes: newRecipes, hasMore: result.hasMore };
    }
    return { recipes: [], hasMore: false };
  } catch (error) {
    console.error("Error loading more area results:", error);
    return { recipes: [], hasMore: false };
  }
}

/**
 * Filter by diet (Spoonacular-specific)
 */
export async function filterByDiet(
  diet: string,
  offset: number = 0
): Promise<{ recipes: Recipe[]; totalCount: number }> {
  const provider = getProvider();
  const results: Recipe[] = [];
  const seenIds = new Set<string>();
  const PAGE_SIZE = 24; // Match UI
  let totalCount = 0;

  try {
    // 1. Database first
    if (provider === "hybrid" || provider === "mealdb") {
      try {
        // Get accurate count first
        totalCount = await mealdb.countRecipesInSupabase(
          undefined,
          undefined,
          diet
        );

        // Fetch valid page from Supabase
        const dbRecipes = await mealdb.getRecipesFromSupabase(
          undefined,
          undefined,
          diet,
          offset,
          PAGE_SIZE
        );
        if (dbRecipes.length > 0) {
          dbRecipes.forEach((r) => {
            if (!seenIds.has(r.id)) {
              results.push(r);
              seenIds.add(r.id);
            }
          });
        }
      } catch (error) {
        console.error("Database diet filter failed:", error);
      }
    }

    // 2. Spoonacular API (Fallback)
    // If we didn't fill the page from DB, try API
    // Logic: If DB returned a full page, we are good. If not, maybe we need API?
    // Simple strategy: If DB result is empty or small, and we are allowed to check API, check API for *this specific offset*.
    // This might overlap or leave gaps if DB and API are out of sync, but it's maximizing data availability.

    if (provider === "hybrid" || provider === "spoonacular") {
      const hasEnough = results.length >= PAGE_SIZE;

      // If we don't have enough results locally for this page, OR if we want to get the true total count from API
      // (If local count says 5, but API has 100, we should probably know that for pagination)
      // But fetching API just for count is expensive (quota).
      // We only fetch API if we need data (page is incomplete).

      if (!hasEnough) {
        try {
          const spoonResult = await spoonacular.filterByDiet(diet, offset);

          // Update total count from API if it's larger (API is authority)
          if (spoonResult.totalResults > totalCount) {
            totalCount = spoonResult.totalResults;
          }

          spoonResult.recipes.forEach((r) => {
            if (!seenIds.has(r.id)) {
              results.push(r);
              seenIds.add(r.id);
            }
          });
        } catch (spoonError) {
          console.warn(
            `Spoonacular diet filter failed (using DB results only): ${spoonError}`
          );
        }
      } else {
        /* devLog.log(
          `Skipping Spoonacular API for diet '${diet}' (offset ${offset}) as we have enough results from DB`
        ); */
      }
    }

    return { recipes: results, totalCount };
  } catch (error) {
    console.error("Error in filterByDiet:", error);
    return { recipes: results, totalCount };
  }
}

/**
 * Load more diet filter results (for pagination)
 */
export async function loadMoreDietResults(
  diet: string,
  offset: number,
  existingIds: string[]
): Promise<{ recipes: Recipe[]; hasMore: boolean }> {
  const provider = getProvider();

  try {
    if (provider === "spoonacular" || provider === "hybrid") {
      const result = await spoonacular.filterByDiet(diet, offset);
      const seenIds = new Set(existingIds);
      const newRecipes = result.recipes.filter((r) => !seenIds.has(r.id));
      return { recipes: newRecipes, hasMore: result.hasMore };
    }
    return { recipes: [], hasMore: false };
  } catch (error) {
    console.error("Error loading more diet results:", error);
    return { recipes: [], hasMore: false };
  }
}

/**
 * Filter meals by multiple criteria (Category + Area)
 */
/**
 * Filter meals by multiple criteria (Category + Area + Diet)
 * Acts as the unified filter function with pagination
 */
export async function filterByMultiple(
  category?: string,
  area?: string,
  diet?: string,
  offset: number = 0
): Promise<{ recipes: Recipe[]; totalCount: number }> {
  const provider = getProvider();
  const results: Recipe[] = [];
  const seenIds = new Set<string>();
  const PAGE_SIZE = 24; // Standardize page size
  let totalCount = 0;

  try {
    // 1. Database (Supabase) - Checks for exact intersection of filters
    if (provider === "hybrid" || provider === "mealdb") {
      try {
        // Get count from DB
        totalCount = await mealdb.countRecipesInSupabase(category, area, diet);

        // Get page from DB
        const dbRecipes = await mealdb.getRecipesFromSupabase(
          category,
          area,
          diet,
          offset,
          PAGE_SIZE
        );
        dbRecipes.forEach((r) => {
          if (!seenIds.has(r.id)) {
            results.push(r);
            seenIds.add(r.id);
          }
        });
      } catch (error) {
        console.error("Database unified filter failed:", error);
      }
    }

    // 2. Spoonacular (Fallback or Supplement)
    // If we don't have enough results from DB, check API if allowed
    if (provider === "hybrid" || provider === "spoonacular") {
      const hasEnough = results.length >= PAGE_SIZE;

      // Simple logic: If we didn't fill the page, fetch from Spoonacular
      if (!hasEnough) {
        // Map MealDB/Spoonacular params
        const params: Record<string, string> = {
          number: PAGE_SIZE.toString(),
          offset: offset.toString(),
        };
        if (category) params.type = category.toLowerCase();
        if (area) params.cuisine = area;
        if (diet) params.diet = diet.toLowerCase();

        try {
          const spoonResult = await spoonacular.searchRecipesWrapper(params);

          // Update total count if API has more
          if (spoonResult.totalResults > totalCount) {
            totalCount = spoonResult.totalResults;
          }

          spoonResult.recipes.forEach((r) => {
            if (!seenIds.has(r.id)) {
              results.push(r);
              seenIds.add(r.id);
            }
          });
        } catch (error) {
          // Log but don't fail if API fails (we might have some DB results)
          console.warn("Spoonacular unified filter failed:", error);
        }
      } else {
        /* devLog.log(
          "Skipping Spoonacular API for unified filter (DB has enough results)"
        ); */
      }
    }

    return { recipes: results, totalCount };
  } catch (error) {
    console.error("Error in filterByMultiple:", error);
    return { recipes: results, totalCount };
  }
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<string[]> {
  const provider = getProvider();

  try {
    if (provider === "spoonacular") {
      return await spoonacular.getCategories();
    } else if (provider === "hybrid") {
      // In hybrid mode, combine categories from both APIs
      const [mealdbCats, spoonacularCats] = await Promise.allSettled([
        mealdb.getCategories(),
        spoonacular.getCategories(),
      ]);

      const categories: string[] = [];

      if (mealdbCats.status === "fulfilled") {
        categories.push(...mealdbCats.value);
      }

      if (spoonacularCats.status === "fulfilled") {
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
    if (provider === "spoonacular") {
      return await spoonacular.getAreas();
    } else if (provider === "hybrid") {
      // In hybrid mode, combine areas from both APIs
      const [mealdbAreas, spoonacularAreas] = await Promise.allSettled([
        mealdb.getAreas(),
        spoonacular.getAreas(),
      ]);

      const areas: string[] = [];

      if (mealdbAreas.status === "fulfilled") {
        areas.push(...mealdbAreas.value);
      }

      if (spoonacularAreas.status === "fulfilled") {
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
export async function getMultipleRandomMeals(
  count: number = 6,
  excludeIds: string[] = []
): Promise<Recipe[]> {
  const provider = getProvider();
  const results: Recipe[] = [];

  try {
    // 1. Try Database first (for Hybrid/MealDB modes)
    // We prioritize local DB to save API quota
    if (provider === "hybrid" || provider === "mealdb") {
      try {
        const dbRecipes = await mealdb.getRandomRecipesFromSupabase(
          count,
          excludeIds
        );
        if (dbRecipes.length > 0) {
          // devLog.log(`Fetched ${dbRecipes.length} recipes from Supabase`);
          results.push(...dbRecipes);
        }
      } catch (error) {
        console.error("Database fetch failed:", error);
      }

      if (results.length >= count) return results;
    }

    // 2. Try TheMealDB
    if (provider === "hybrid" || provider === "mealdb") {
      const remaining = count - results.length;
      if (remaining > 0) {
        const mealdbResults = await mealdb.getMultipleRandomMeals(remaining);
        results.push(...mealdbResults);
      }

      if (results.length >= count) return results;
    }

    // 3. Try Spoonacular (Last resort)
    if (provider === "hybrid" || provider === "spoonacular") {
      const remaining = count - results.length;
      if (remaining > 0) {
        devLog.log(`Fetching ${remaining} recipes from Spoonacular (fallback)`);
        const spoonRecipes =
          await spoonacular.getMultipleRandomRecipes(remaining);
        results.push(...spoonRecipes);
      }
    }

    // Final deduplication to ensure no duplicates across sources
    const uniqueResults: Recipe[] = [];
    const seenIds = new Set<string>();

    for (const recipe of results) {
      if (!seenIds.has(recipe.id)) {
        uniqueResults.push(recipe);
        seenIds.add(recipe.id);
      }
    }

    return uniqueResults;
  } catch (error) {
    console.error("Error in getMultipleRandomMeals:", error);
    return results.length > 0 ? results : [];
  }
}

/**
 * Get related recipes based on category
 */
export async function getRelatedRecipes(
  category: string,
  currentId: string,
  count: number = 3
): Promise<Recipe[]> {
  const provider = getProvider();

  try {
    if (provider === "spoonacular") {
      return await spoonacular.getSimilarRecipes(currentId, count);
    } else if (provider === "hybrid") {
      // Use TheMealDB primarily
      let results = await mealdb.getRelatedRecipes(category, currentId, count);
      if (results.length >= count) return results;

      /* devLog.log(
        "TheMealDB related recipes returned insufficient results, trying Spoonacular..."
      ); */

      try {
        // Try to get similar recipes from Spoonacular if ID is numeric (Spoonacular ID)
        if (/^\d{1,6}$/.test(currentId)) {
          const similar = await spoonacular.getSimilarRecipes(
            currentId,
            count - results.length
          );
          results = [...results, ...similar];
        } else {
          // Otherwise fallback to random Spoonacular recipes
          const remaining = count - results.length;
          const spoonacularResults =
            await spoonacular.getMultipleRandomRecipes(remaining);
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
