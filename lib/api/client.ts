/**
 * Client-side API functions for static export
 * These call external APIs directly from the browser
 */

import { Recipe } from "@/lib/types/recipe";

const MEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strYoutube: string;
  strSource: string;
  [key: string]: string | null;
}

function transformMealDBToRecipe(meal: MealDBMeal): Recipe {
  // Extract ingredients and measures
  const ingredients: string[] = [];
  const measures: string[] = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ingredient && ingredient.trim()) {
      ingredients.push(ingredient.trim());
      measures.push(measure?.trim() || "");
    }
  }

  return {
    id: `mealdb-${meal.idMeal}`,
    title: meal.strMeal,
    image: meal.strMealThumb,
    summary: `A delicious ${meal.strArea} ${meal.strCategory} dish.`,
    instructions: meal.strInstructions,
    readyInMinutes: 45,
    servings: 4,
    sourceUrl: meal.strSource || "",
    cuisines: [meal.strArea],
    dishTypes: [meal.strCategory?.toLowerCase()],
    diets: [],
    extendedIngredients: ingredients.map((ing, idx) => ({
      id: idx,
      original: `${measures[idx]} ${ing}`.trim(),
      originalName: ing,
      amount: 1,
      unit: measures[idx] || "",
    })),
    nutrition: null,
    videoUrl: meal.strYoutube || null,
  };
}

/**
 * Get a random meal from TheMealDB (client-side)
 */
export async function getRandomMealClient(): Promise<Recipe | null> {
  try {
    const response = await fetch(`${MEALDB_BASE_URL}/random.php`);
    const data = await response.json();

    if (!data.meals || data.meals.length === 0) {
      return null;
    }

    return transformMealDBToRecipe(data.meals[0]);
  } catch (error) {
    console.error("Error fetching random meal:", error);
    return null;
  }
}

/**
 * Get a random meal with filters from TheMealDB (client-side)
 */
export async function getRandomMealWithFiltersClient(filters: {
  category?: string;
  area?: string;
}): Promise<Recipe | null> {
  try {
    // If no filters, just get random
    if (!filters.category && !filters.area) {
      return getRandomMealClient();
    }

    // Get filtered list first
    let meals: { idMeal: string; strMeal: string; strMealThumb: string }[] = [];

    if (filters.category) {
      const response = await fetch(
        `${MEALDB_BASE_URL}/filter.php?c=${encodeURIComponent(filters.category)}`
      );
      const data = await response.json();
      meals = data.meals || [];
    } else if (filters.area) {
      const response = await fetch(
        `${MEALDB_BASE_URL}/filter.php?a=${encodeURIComponent(filters.area)}`
      );
      const data = await response.json();
      meals = data.meals || [];
    }

    if (meals.length === 0) {
      return null;
    }

    // Pick a random one from the filtered list
    const randomMeal = meals[Math.floor(Math.random() * meals.length)];

    // Get full details
    const detailResponse = await fetch(
      `${MEALDB_BASE_URL}/lookup.php?i=${randomMeal.idMeal}`
    );
    const detailData = await detailResponse.json();

    if (!detailData.meals || detailData.meals.length === 0) {
      return null;
    }

    return transformMealDBToRecipe(detailData.meals[0]);
  } catch (error) {
    console.error("Error fetching filtered random meal:", error);
    return null;
  }
}
