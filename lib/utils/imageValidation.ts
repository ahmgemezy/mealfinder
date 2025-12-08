/**
 * Image URL validation and fallback utilities
 */

const VALID_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
const VALID_PROTOCOLS = ["http:", "https:"];

/**
 * Validates if a URL is a valid image URL
 * @param url - URL to validate
 * @returns true if valid image URL
 */
export function isValidImageUrl(url: unknown): url is string {
    if (typeof url !== "string" || url.trim().length === 0) {
        return false;
    }

    try {
        const urlObj = new URL(url);

        // Check protocol
        if (!VALID_PROTOCOLS.includes(urlObj.protocol)) {
            return false;
        }

        // Check if URL has a valid image extension or is from known recipe image domains
        const pathname = urlObj.pathname.toLowerCase();
        const hasValidExtension = VALID_IMAGE_EXTENSIONS.some((ext) =>
            pathname.endsWith(ext)
        );

        // Known recipe image domains that might not have extensions in URL
        const knownImageDomains = [
            "themealdb.com",
            "spoonacular.com",
            "edamam.com",
            "cloudinary.com",
            "imgur.com",
        ];

        const isKnownDomain = knownImageDomains.some((domain) =>
            urlObj.hostname.includes(domain)
        );

        return hasValidExtension || isKnownDomain;
    } catch {
        return false;
    }
}

/**
 * Returns primary URL if valid, otherwise returns fallback
 * @param primaryUrl - Primary image URL
 * @param fallbackUrl - Fallback image URL
 * @returns Valid image URL
 */
export function getImageWithFallback(
    primaryUrl: string | null | undefined,
    fallbackUrl: string
): string {
    if (primaryUrl && isValidImageUrl(primaryUrl)) {
        return primaryUrl;
    }
    return fallbackUrl;
}

/**
 * Generates a placeholder image URL (SVG data URI)
 * @param width - Image width
 * @param height - Image height
 * @param text - Optional text to display
 * @returns SVG data URI
 */
export function generatePlaceholderImageUrl(
    width: number = 300,
    height: number = 200,
    text: string = "No Image"
): string {
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="18"
        fill="#9ca3af"
      >${text}</text>
    </svg>
  `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Gets a recipe image with automatic fallback to placeholder
 * @param imageUrl - Recipe image URL
 * @param recipeName - Recipe name for placeholder text
 * @returns Valid image URL or placeholder
 */
export function getRecipeImageUrl(
    imageUrl: string | null | undefined,
    recipeName?: string
): string {
    if (imageUrl && isValidImageUrl(imageUrl)) {
        return imageUrl;
    }

    return generatePlaceholderImageUrl(
        400,
        300,
        recipeName ? recipeName.substring(0, 20) : "Recipe"
    );
}
