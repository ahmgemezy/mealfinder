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
    // Optional fields from Spoonacular
    servings?: number;
    readyInMinutes?: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    apiSource?: 'mealdb' | 'spoonacular'; // Track which API provided the data
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

// Spoonacular API types
export interface SpoonacularIngredient {
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
}

export interface SpoonacularNutrition {
    nutrients: Array<{
        name: string;
        amount: number;
        unit: string;
    }>;
}

export interface SpoonacularRecipe {
    id: number;
    title: string;
    image: string;
    imageType?: string;
    servings: number;
    readyInMinutes: number;
    sourceUrl?: string;
    cuisines: string[];
    dishTypes: string[];
    diets: string[];
    instructions?: string;
    analyzedInstructions?: Array<{
        steps: Array<{
            number: number;
            step: string;
        }>;
    }>;
    extendedIngredients?: SpoonacularIngredient[];
    nutrition?: SpoonacularNutrition;
}

export interface SpoonacularSearchResponse {
    results: SpoonacularRecipe[];
    offset: number;
    number: number;
    totalResults: number;
}

export interface SpoonacularRandomResponse {
    recipes: SpoonacularRecipe[];
}

// Filter types
export interface MealFilters {
    category?: string;
    area?: string;
    search?: string;
    diet?: string;
    intolerances?: string[];
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
        apiSource: 'mealdb',
    };
}

// Helper function to transform Spoonacular response to our Recipe type
export function transformSpoonacularToRecipe(recipe: SpoonacularRecipe): Recipe {
    const ingredients: Ingredient[] = [];

    // Extract ingredients
    if (recipe.extendedIngredients) {
        recipe.extendedIngredients.forEach(ing => {
            ingredients.push({
                name: ing.name,
                measure: `${ing.amount} ${ing.unit}`.trim(),
            });
        });
    }

    // Helper function to strip HTML tags
    const stripHTML = (html: string): string => {
        return html
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
            .replace(/&amp;/g, '&')  // Replace &amp; with &
            .replace(/&lt;/g, '<')   // Replace &lt; with <
            .replace(/&gt;/g, '>')   // Replace &gt; with >
            .replace(/&quot;/g, '"') // Replace &quot; with "
            .trim();
    };

    // Extract instructions and strip HTML
    let instructions = '';
    if (recipe.instructions) {
        instructions = stripHTML(recipe.instructions);
    } else if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
        instructions = recipe.analyzedInstructions[0].steps
            .map(step => `${step.number}. ${stripHTML(step.step)}`)
            .join('\n\n');
    }

    // Extract nutrition data
    let calories: number | undefined;
    let protein: number | undefined;
    let carbs: number | undefined;
    let fat: number | undefined;

    if (recipe.nutrition?.nutrients) {
        const nutrients = recipe.nutrition.nutrients;
        calories = nutrients.find(n => n.name === 'Calories')?.amount;
        protein = nutrients.find(n => n.name === 'Protein')?.amount;
        carbs = nutrients.find(n => n.name === 'Carbohydrates')?.amount;
        fat = nutrients.find(n => n.name === 'Fat')?.amount;
    }

    // Map cuisines to area (use first cuisine or default to empty)
    const area = recipe.cuisines && recipe.cuisines.length > 0
        ? recipe.cuisines[0]
        : '';

    // Map dishTypes to category (use first dishType or default to empty)
    const category = recipe.dishTypes && recipe.dishTypes.length > 0
        ? recipe.dishTypes[0]
        : '';

    // Combine cuisines, diets, and dishTypes as tags
    const tags = [
        ...(recipe.cuisines || []),
        ...(recipe.diets || []),
        ...(recipe.dishTypes || [])
    ];

    // Fix image URL - Spoonacular sometimes returns incomplete URLs or undefined
    let thumbnail = '';
    if (recipe.image && recipe.image.trim() !== '') {
        thumbnail = recipe.image;
        // Remove trailing dots and ensure proper extension
        thumbnail = thumbnail.replace(/\.$/, '');
        // If URL doesn't have proper extension, add jpg
        if (!thumbnail.match(/\.(jpg|jpeg|png|webp)$/i)) {
            thumbnail = `${thumbnail}.jpg`;
        }
        // If URL doesn't start with http, it might be a relative path - construct full URL
        if (!thumbnail.startsWith('http')) {
            thumbnail = `https://img.spoonacular.com/recipes/${recipe.id}-556x370.jpg`;
        }
    } else {
        // If no image provided, construct one from the recipe ID
        thumbnail = `https://img.spoonacular.com/recipes/${recipe.id}-556x370.jpg`;
    }

    return {
        id: recipe.id.toString(),
        name: recipe.title,
        category: category,
        area: area,
        instructions: instructions,
        thumbnail: thumbnail,
        tags: tags,
        ingredients,
        source: recipe.sourceUrl,
        servings: recipe.servings,
        readyInMinutes: recipe.readyInMinutes,
        calories,
        protein,
        carbs,
        fat,
        apiSource: 'spoonacular',
    };
}
