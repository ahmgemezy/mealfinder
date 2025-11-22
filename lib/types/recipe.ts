// Recipe types based on TheMealDB API structure

export interface Ingredient {
    name: string;
    measure: string;
}

export interface Recipe {
    id: string;
    name: string;
    category: string;
    area: string; // Cuisine/region
    instructions: string;
    thumbnail: string;
    tags: string[];
    youtube?: string;
    ingredients: Ingredient[];
    source?: string;
}

// Raw API response from TheMealDB
export interface MealDBMeal {
    idMeal: string;
    strMeal: string;
    strCategory: string;
    strArea: string;
    strInstructions: string;
    strMealThumb: string;
    strTags: string | null;
    strYoutube: string;
    strSource: string;
    // Ingredients (up to 20)
    strIngredient1: string;
    strIngredient2: string;
    strIngredient3: string;
    strIngredient4: string;
    strIngredient5: string;
    strIngredient6: string;
    strIngredient7: string;
    strIngredient8: string;
    strIngredient9: string;
    strIngredient10: string;
    strIngredient11: string;
    strIngredient12: string;
    strIngredient13: string;
    strIngredient14: string;
    strIngredient15: string;
    strIngredient16: string;
    strIngredient17: string;
    strIngredient18: string;
    strIngredient19: string;
    strIngredient20: string;
    // Measures
    strMeasure1: string;
    strMeasure2: string;
    strMeasure3: string;
    strMeasure4: string;
    strMeasure5: string;
    strMeasure6: string;
    strMeasure7: string;
    strMeasure8: string;
    strMeasure9: string;
    strMeasure10: string;
    strMeasure11: string;
    strMeasure12: string;
    strMeasure13: string;
    strMeasure14: string;
    strMeasure15: string;
    strMeasure16: string;
    strMeasure17: string;
    strMeasure18: string;
    strMeasure19: string;
    strMeasure20: string;
}

export interface MealDBResponse {
    meals: MealDBMeal[] | null;
}

// Filter types
export interface MealFilters {
    category?: string;
    area?: string;
    search?: string;
}

// Categories and areas (cuisines)
export type MealCategory =
    | "Beef"
    | "Chicken"
    | "Dessert"
    | "Lamb"
    | "Miscellaneous"
    | "Pasta"
    | "Pork"
    | "Seafood"
    | "Side"
    | "Starter"
    | "Vegan"
    | "Vegetarian"
    | "Breakfast"
    | "Goat";

export type MealArea =
    | "American"
    | "British"
    | "Canadian"
    | "Chinese"
    | "Croatian"
    | "Dutch"
    | "Egyptian"
    | "Filipino"
    | "French"
    | "Greek"
    | "Indian"
    | "Irish"
    | "Italian"
    | "Jamaican"
    | "Japanese"
    | "Kenyan"
    | "Malaysian"
    | "Mexican"
    | "Moroccan"
    | "Polish"
    | "Portuguese"
    | "Russian"
    | "Spanish"
    | "Thai"
    | "Tunisian"
    | "Turkish"
    | "Ukrainian"
    | "Vietnamese";

// Helper function to transform MealDB response to our Recipe type
export function transformMealDBToRecipe(meal: MealDBMeal): Recipe {
    const ingredients: Ingredient[] = [];

    // Extract ingredients and measures
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}` as keyof MealDBMeal];
        const measure = meal[`strMeasure${i}` as keyof MealDBMeal];

        if (ingredient && ingredient.trim() !== "") {
            ingredients.push({
                name: ingredient.trim(),
                measure: measure?.trim() || "",
            });
        }
    }

    return {
        id: meal.idMeal,
        name: meal.strMeal,
        category: meal.strCategory,
        area: meal.strArea,
        instructions: meal.strInstructions,
        thumbnail: meal.strMealThumb,
        tags: meal.strTags ? meal.strTags.split(",").map(tag => tag.trim()) : [],
        youtube: meal.strYoutube || undefined,
        ingredients,
        source: meal.strSource || undefined,
    };
}
