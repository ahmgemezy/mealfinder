import { test, expect } from "@playwright/test";

test.describe("Blog Browsing", () => {
    test("blog page loads with post cards", async ({ page }) => {
        await page.goto("/en/blog", { waitUntil: "domcontentloaded" });

        await expect(page.locator("h1").first()).toBeVisible();
        const articleLinks = page.locator('a[href*="/blog/"]');
        await expect(articleLinks.first()).toBeVisible({ timeout: 10000 });
    });

    test("clicking a blog post navigates to article page", async ({ page }) => {
        await page.goto("/en/blog", { waitUntil: "domcontentloaded" });

        const firstPostLink = page.locator('a[href*="/blog/"]').first();
        await expect(firstPostLink).toBeVisible({ timeout: 15000 });

        await Promise.all([
            page.waitForURL("**/blog/**", { timeout: 15000 }),
            firstPostLink.click(),
        ]);

        await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
    });
});
