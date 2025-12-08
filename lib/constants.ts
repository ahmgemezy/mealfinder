// TheMealDB Categories (kept for backward compatibility)
export const MEALDB_CATEGORIES = [
    "Beef",
    "Chicken",
    "Dessert",
    "Lamb",
    "Pasta",
    "Pork",
    "Seafood",
    "Vegetarian",
    "Vegan",
    "Goat",
    "Side",
    "Starter",
    "Breakfast",
    "Miscellaneous"
] as const;

// TheMealDB Areas (kept for backward compatibility)
export const MEALDB_AREAS = [
    "American",
    "British",
    "Canadian",
    "Chinese",
    "Croatian",
    "Dutch",
    "Egyptian",
    "Filipino",
    "French",
    "Greek",
    "Indian",
    "Irish",
    "Italian",
    "Jamaican",
    "Japanese",
    "Kenyan",
    "Malaysian",
    "Mexican",
    "Moroccan",
    "Polish",
    "Portuguese",
    "Russian",
    "Spanish",
    "Thai",
    "Tunisian",
    "Turkish",
    "Ukrainian",
    "Vietnamese",
] as const;

// Spoonacular Cuisines (more comprehensive)
export const SPOONACULAR_CUISINES = [
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
] as const;

// Spoonacular Dish Types (replaces categories)
export const SPOONACULAR_CATEGORIES = [
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
] as const;

// Spoonacular Diet Filters (NEW!)
export const SPOONACULAR_DIETS = [
    "Gluten Free",
    "Ketogenic",
    "Vegetarian",
    "Lacto-Vegetarian",
    "Ovo-Vegetarian",
    "Vegan",
    "Pescetarian",
    "Paleo",
    "Primal",
    "Low FODMAP",
    "Whole30",
] as const;

// Spoonacular Intolerances (NEW!)
export const SPOONACULAR_INTOLERANCES = [
    "Dairy",
    "Egg",
    "Gluten",
    "Grain",
    "Peanut",
    "Seafood",
    "Sesame",
    "Shellfish",
    "Soy",
    "Sulfite",
    "Tree Nut",
    "Wheat",
] as const;

// Type-safe exports
export type RecipeCategory = typeof MEALDB_CATEGORIES[number];
export type RecipeArea = typeof MEALDB_AREAS[number] | typeof SPOONACULAR_CUISINES[number];

// Combined/Unified lists (for current API provider)
export const RECIPE_CATEGORIES = MEALDB_CATEGORIES;

// Merge and deduplicate areas/cuisines
export const RECIPE_AREAS = Array.from(new Set([...MEALDB_AREAS, ...SPOONACULAR_CUISINES])).sort();

/**
 * Type guard to check if a value is a valid recipe category
 */
export function isValidCategory(value: unknown): value is RecipeCategory {
    return typeof value === "string" && MEALDB_CATEGORIES.includes(value as RecipeCategory);
}

/**
 * Type guard to check if a value is a valid recipe area
 */
export function isValidArea(value: unknown): value is RecipeArea {
    if (typeof value !== "string") return false;

    const allAreas = [...MEALDB_AREAS, ...SPOONACULAR_CUISINES];
    return allAreas.includes(value as RecipeArea);
}
