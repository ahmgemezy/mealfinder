import {
    isValidImageUrl,
    getImageWithFallback,
    generatePlaceholderImageUrl,
    getRecipeImageUrl,
} from "../../lib/utils/imageValidation";

describe("isValidImageUrl", () => {
    it("accepts valid image URLs with known extensions", () => {
        expect(isValidImageUrl("https://example.com/photo.jpg")).toBe(true);
        expect(isValidImageUrl("https://example.com/photo.png")).toBe(true);
        expect(isValidImageUrl("https://example.com/photo.webp")).toBe(true);
    });

    it("accepts URLs from known recipe image domains", () => {
        expect(isValidImageUrl("https://www.themealdb.com/images/media/meals/abc.jpg")).toBe(true);
        expect(isValidImageUrl("https://spoonacular.com/recipeImages/123")).toBe(true);
    });

    it("rejects non-string values", () => {
        expect(isValidImageUrl(null)).toBe(false);
        expect(isValidImageUrl(123)).toBe(false);
        expect(isValidImageUrl(undefined)).toBe(false);
        expect(isValidImageUrl("")).toBe(false);
    });

    it("rejects URLs with invalid protocols", () => {
        expect(isValidImageUrl("ftp://example.com/photo.jpg")).toBe(false);
    });

    it("rejects URLs without image extension or known domain", () => {
        expect(isValidImageUrl("https://random-site.com/page")).toBe(false);
    });

    it("rejects completely invalid URLs", () => {
        expect(isValidImageUrl("not-a-url")).toBe(false);
    });
});

describe("getImageWithFallback", () => {
    const FALLBACK = "/fallback.png";

    it("returns primary URL if valid", () => {
        expect(getImageWithFallback("https://example.com/photo.jpg", FALLBACK)).toBe(
            "https://example.com/photo.jpg"
        );
    });

    it("returns fallback for invalid primary URL", () => {
        expect(getImageWithFallback("not-valid", FALLBACK)).toBe(FALLBACK);
    });

    it("returns fallback for null/undefined", () => {
        expect(getImageWithFallback(null, FALLBACK)).toBe(FALLBACK);
        expect(getImageWithFallback(undefined, FALLBACK)).toBe(FALLBACK);
    });
});

describe("generatePlaceholderImageUrl", () => {
    it("returns a data URI", () => {
        const url = generatePlaceholderImageUrl();
        expect(url).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it("accepts custom dimensions and text", () => {
        const url = generatePlaceholderImageUrl(500, 400, "Test");
        expect(url).toMatch(/^data:image\/svg\+xml;base64,/);
    });
});

describe("getRecipeImageUrl", () => {
    it("returns the image URL when valid", () => {
        const url = "https://www.themealdb.com/images/media/meals/abc.jpg";
        expect(getRecipeImageUrl(url, "Pasta")).toBe(url);
    });

    it("returns a placeholder when image URL is null", () => {
        const result = getRecipeImageUrl(null, "Pasta");
        expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it("returns a placeholder when image URL is invalid", () => {
        const result = getRecipeImageUrl("invalid-url", "Pasta");
        expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it("works without a recipe name", () => {
        const result = getRecipeImageUrl(null);
        expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    });
});
