import {
    validateRecipeId,
    validateSearchQuery,
    validateCategory,
    validateArea,
    sanitizeInput,
    validateDiet,
} from "../../lib/utils/validation";

describe("validateRecipeId", () => {
    it("accepts a valid string ID", () => {
        expect(validateRecipeId("52914")).toBe(true);
    });

    it("rejects non-string values", () => {
        expect(validateRecipeId(123)).toBe(false);
        expect(validateRecipeId(null)).toBe(false);
        expect(validateRecipeId(undefined)).toBe(false);
    });

    it("rejects empty or whitespace-only strings", () => {
        expect(validateRecipeId("")).toBe(false);
        expect(validateRecipeId("   ")).toBe(false);
    });

    it("rejects IDs exceeding 50 characters", () => {
        expect(validateRecipeId("a".repeat(51))).toBe(false);
    });

    it("accepts IDs at the 50-char boundary", () => {
        expect(validateRecipeId("a".repeat(50))).toBe(true);
    });
});

describe("validateSearchQuery", () => {
    it("accepts a valid search query", () => {
        expect(validateSearchQuery("chicken pasta")).toBe(true);
    });

    it("allows empty strings (returns all results)", () => {
        expect(validateSearchQuery("")).toBe(true);
        expect(validateSearchQuery("   ")).toBe(true);
    });

    it("rejects non-string values", () => {
        expect(validateSearchQuery(42)).toBe(false);
        expect(validateSearchQuery(null)).toBe(false);
    });

    it("rejects queries exceeding 500 characters", () => {
        expect(validateSearchQuery("a".repeat(501))).toBe(false);
    });

    it("rejects SQL injection patterns", () => {
        expect(validateSearchQuery("SELECT * FROM users")).toBe(false);
        expect(validateSearchQuery("DROP TABLE recipes")).toBe(false);
        expect(validateSearchQuery("1=1")).toBe(false);
        expect(validateSearchQuery("value; DELETE")).toBe(false);
        expect(validateSearchQuery("test -- comment")).toBe(false);
    });

    it("accepts normal queries that happen to contain substrings", () => {
        expect(validateSearchQuery("delicious chicken")).toBe(true);
    });
});

describe("validateCategory", () => {
    it("accepts a valid category", () => {
        expect(validateCategory("Seafood")).toBe(true);
    });

    it("rejects non-string values", () => {
        expect(validateCategory(123)).toBe(false);
        expect(validateCategory(null)).toBe(false);
    });

    it("rejects empty strings", () => {
        expect(validateCategory("")).toBe(false);
        expect(validateCategory("   ")).toBe(false);
    });

    it("rejects categories exceeding 50 characters", () => {
        expect(validateCategory("a".repeat(51))).toBe(false);
    });
});

describe("validateArea", () => {
    it("accepts a valid area", () => {
        expect(validateArea("Italian")).toBe(true);
    });

    it("rejects non-string values", () => {
        expect(validateArea(undefined)).toBe(false);
    });

    it("rejects empty strings", () => {
        expect(validateArea("")).toBe(false);
    });

    it("rejects areas exceeding 50 characters", () => {
        expect(validateArea("a".repeat(51))).toBe(false);
    });
});

describe("validateDiet", () => {
    it("accepts a valid diet", () => {
        expect(validateDiet("Vegetarian")).toBe(true);
    });

    it("rejects non-string values", () => {
        expect(validateDiet(false)).toBe(false);
    });

    it("rejects empty strings", () => {
        expect(validateDiet("")).toBe(false);
    });

    it("rejects diets exceeding 50 characters", () => {
        expect(validateDiet("a".repeat(51))).toBe(false);
    });
});

describe("sanitizeInput", () => {
    it("trims whitespace", () => {
        expect(sanitizeInput("  hello  ")).toBe("hello");
    });

    it("removes null bytes", () => {
        expect(sanitizeInput("hello\0world")).toBe("helloworld");
    });

    it("truncates to maxLength", () => {
        expect(sanitizeInput("a".repeat(600))).toBe("a".repeat(500));
    });

    it("uses custom maxLength", () => {
        expect(sanitizeInput("a".repeat(20), 10)).toBe("a".repeat(10));
    });

    it("returns empty string for non-string input", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(sanitizeInput(123 as any)).toBe("");
    });
});
