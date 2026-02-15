import {
    calculateReadTime,
    formatDate,
    searchPosts,
    getAllPosts,
    getAllTags,
} from "../../lib/utils/blog-helpers";

describe("calculateReadTime", () => {
    it("returns 1 minute for short content", () => {
        expect(calculateReadTime("Hello world")).toBe(1);
    });

    it("calculates correctly for longer content (~200 words = 1 min)", () => {
        const words = Array(400).fill("word").join(" ");
        expect(calculateReadTime(words)).toBe(2);
    });

    it("rounds up to nearest minute", () => {
        const words = Array(250).fill("word").join(" ");
        expect(calculateReadTime(words)).toBe(2);
    });
});

describe("formatDate", () => {
    it("formats a date string for 'en' locale", () => {
        const result = formatDate("2024-01-15", "en");
        expect(result).toContain("2024");
        expect(result).toContain("January");
        expect(result).toContain("15");
    });

    it("defaults to 'en' locale", () => {
        const result = formatDate("2024-06-01");
        expect(result).toContain("June");
    });
});

describe("searchPosts", () => {
    it("returns all posts for empty query", () => {
        const all = getAllPosts();
        expect(searchPosts("")).toHaveLength(all.length);
    });

    it("returns all posts for whitespace-only query", () => {
        const all = getAllPosts();
        expect(searchPosts("   ")).toHaveLength(all.length);
    });

    it("filters posts by title match", () => {
        const all = getAllPosts();
        if (all.length === 0) return; // skip if no blog posts

        const firstTitle = all[0].title;
        const keyword = firstTitle.split(" ")[0];
        const results = searchPosts(keyword);
        expect(results.length).toBeGreaterThanOrEqual(1);
        expect(results.some((p) => p.title.toLowerCase().includes(keyword.toLowerCase()))).toBe(true);
    });

    it("returns empty array for nonsense query", () => {
        expect(searchPosts("xyzzyspoonnooneislistening123")).toHaveLength(0);
    });
});

describe("getAllTags", () => {
    it("returns a sorted array of unique strings", () => {
        const tags = getAllTags();
        expect(Array.isArray(tags)).toBe(true);

        const sorted = [...tags].sort();
        expect(tags).toEqual(sorted);

        const unique = [...new Set(tags)];
        expect(tags).toEqual(unique);
    });
});
