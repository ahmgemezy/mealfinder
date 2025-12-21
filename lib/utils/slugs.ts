/**
 * Generates a URL-friendly slug from a recipe name and ID
 * Format: recipe-name-id
 * Example: "Kebab Fries" + "52914" => "kebab-fries-52914"
 */
export function generateRecipeSlug(name: string, id: string): string {
    // 1. Convert to lowercase
    // 2. Replace special characters that are NOT letters or numbers (Unicode aware) with hyphens
    // 3. Remove multiple hyphens
    // 4. Trim hyphens
    const slug = name
        .toLowerCase()
        // Improve regex to allow unicode letters (\p{L}) and numbers (\p{N})
        // NOTE: JS regex with /u flag supports unicode property escapes
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '');

    // Fallback if name becomes empty (e.g. was only special chars)
    const finalSlug = slug || 'recipe';

    return `${finalSlug}-${id}`;
}

/**
 * Extracts the recipe ID from a slug
 * Format: recipe-name-id => id
 * Example: "kebab-fries-52914" => "52914"
 */
export function extractIdFromSlug(slug: string): string {
    const parts = slug.split('-');
    return parts[parts.length - 1];
}

/**
 * Generates the full recipe URL path
 */
export function getRecipeUrl(name: string, id: string): string {
    return `/recipes/${generateRecipeSlug(name, id)}`;
}
