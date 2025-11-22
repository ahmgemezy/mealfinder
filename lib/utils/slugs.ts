/**
 * Generates a URL-friendly slug from a recipe name and ID
 * Format: recipe-name-id
 * Example: "Kebab Fries" + "52914" => "kebab-fries-52914"
 */
export function generateRecipeSlug(name: string, id: string): string {
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens

    return `${slug}-${id}`;
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
