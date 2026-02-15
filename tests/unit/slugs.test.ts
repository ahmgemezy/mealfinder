import {
    generateRecipeSlug,
    extractIdFromSlug,
    getRecipeUrl,
} from "../../lib/utils/slugs";

describe("generateRecipeSlug", () => {
    it("creates a lowercase hyphenated slug with ID appended", () => {
        expect(generateRecipeSlug("Kebab Fries", "52914")).toBe("kebab-fries-52914");
    });

    it("strips special characters", () => {
        expect(generateRecipeSlug("Mac & Cheese!", "100")).toBe("mac-cheese-100");
    });

    it("handles unicode characters", () => {
        const slug = generateRecipeSlug("Crème Brûlée", "200");
        expect(slug).toBe("crème-brûlée-200");
    });

    it("falls back to 'recipe' when name is only special chars", () => {
        expect(generateRecipeSlug("!@#$%", "300")).toBe("recipe-300");
    });

    it("trims leading/trailing hyphens", () => {
        expect(generateRecipeSlug(" - Hello - ", "1")).toBe("hello-1");
    });
});

describe("extractIdFromSlug", () => {
    it("extracts the last segment as the ID", () => {
        expect(extractIdFromSlug("kebab-fries-52914")).toBe("52914");
    });

    it("handles single-segment slugs", () => {
        expect(extractIdFromSlug("12345")).toBe("12345");
    });

    it("handles slugs with many hyphens", () => {
        expect(extractIdFromSlug("a-b-c-d-99")).toBe("99");
    });
});

describe("getRecipeUrl", () => {
    it("returns a path with /recipes/ prefix", () => {
        expect(getRecipeUrl("Kebab Fries", "52914")).toBe("/recipes/kebab-fries-52914");
    });

    it("works with special characters in name", () => {
        expect(getRecipeUrl("Mac & Cheese", "10")).toBe("/recipes/mac-cheese-10");
    });
});
