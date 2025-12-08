/**
 * Input validation utilities for recipe application
 */

const SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /(\bOR\b.*=.*|1=1|'=')/i,
];

/**
 * Validates a recipe ID
 * @param id - Recipe ID to validate
 * @returns true if valid, false otherwise
 */
export function validateRecipeId(id: unknown): id is string {
    if (typeof id !== "string") {
        console.warn("Invalid recipe ID: not a string", id);
        return false;
    }

    if (id.trim().length === 0) {
        console.warn("Invalid recipe ID: empty string");
        return false;
    }

    if (id.length > 50) {
        console.warn("Invalid recipe ID: exceeds max length of 50 characters");
        return false;
    }

    return true;
}

/**
 * Validates a search query
 * @param query - Search query to validate
 * @returns true if valid, false otherwise
 */
export function validateSearchQuery(query: unknown): query is string {
    if (typeof query !== "string") {
        console.warn("Invalid search query: not a string", query);
        return false;
    }

    const trimmed = query.trim();

    if (trimmed.length === 0) {
        return true; // Empty queries are allowed (will return all results)
    }

    if (trimmed.length > 500) {
        console.warn("Invalid search query: exceeds max length of 500 characters");
        return false;
    }

    // Check for SQL injection patterns
    for (const pattern of SQL_INJECTION_PATTERNS) {
        if (pattern.test(trimmed)) {
            console.warn("Invalid search query: contains suspicious pattern", query);
            return false;
        }
    }

    return true;
}

/**
 * Validates a category name
 * @param category - Category to validate
 * @returns true if valid, false otherwise
 */
export function validateCategory(category: unknown): category is string {
    if (typeof category !== "string") {
        console.warn("Invalid category: not a string", category);
        return false;
    }

    if (category.trim().length === 0) {
        console.warn("Invalid category: empty string");
        return false;
    }

    if (category.length > 50) {
        console.warn("Invalid category: exceeds max length of 50 characters");
        return false;
    }

    return true;
}

/**
 * Validates an area/cuisine name
 * @param area - Area to validate
 * @returns true if valid, false otherwise
 */
export function validateArea(area: unknown): area is string {
    if (typeof area !== "string") {
        console.warn("Invalid area: not a string", area);
        return false;
    }

    if (area.trim().length === 0) {
        console.warn("Invalid area: empty string");
        return false;
    }

    if (area.length > 50) {
        console.warn("Invalid area: exceeds max length of 50 characters");
        return false;
    }

    return true;
}

/**
 * Sanitizes user input by trimming and limiting length
 * @param input - Input to sanitize
 * @param maxLength - Maximum allowed length (default: 500)
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, maxLength: number = 500): string {
    if (typeof input !== "string") {
        return "";
    }

    // Trim whitespace
    let sanitized = input.trim();

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, "");

    // Limit length
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
}

/**
 * Validates a diet type
 * @param diet - Diet type to validate
 * @returns true if valid, false otherwise
 */
export function validateDiet(diet: unknown): diet is string {
    if (typeof diet !== "string") {
        console.warn("Invalid diet: not a string", diet);
        return false;
    }

    if (diet.trim().length === 0) {
        console.warn("Invalid diet: empty string");
        return false;
    }

    if (diet.length > 50) {
        console.warn("Invalid diet: exceeds max length of 50 characters");
        return false;
    }

    return true;
}
