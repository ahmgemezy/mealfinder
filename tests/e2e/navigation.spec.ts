import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
    test("nav renders with logo and key nav links", async ({ page }) => {
        await page.goto("/en", { waitUntil: "domcontentloaded" });

        const nav = page.locator("nav.fixed").first();
        await expect(nav).toBeVisible({ timeout: 10000 });

        await expect(page.locator("text=Dish Shuffle").first()).toBeVisible();
    });

    test("recipes link navigates to recipes page", async ({ page }) => {
        await page.goto("/en", { waitUntil: "domcontentloaded" });

        const recipesLink = page.locator('a[href*="/recipes"]').first();
        await expect(recipesLink).toBeVisible({ timeout: 10000 });

        await recipesLink.click();
        await page.waitForURL("**/recipes**");

        await expect(page.locator("body")).toBeVisible();
    });

    test("blog link navigates to blog page", async ({ page }) => {
        await page.goto("/en", { waitUntil: "domcontentloaded" });

        const blogLink = page.locator('a[href*="/blog"]').first();
        await expect(blogLink).toBeVisible({ timeout: 10000 });

        await blogLink.click();
        await page.waitForURL("**/blog**");

        await expect(page.locator("body")).toBeVisible();
    });

    test("footer renders with expected content", async ({ page }) => {
        await page.goto("/en", { waitUntil: "domcontentloaded" });

        const footer = page.locator("footer");
        await expect(footer).toBeVisible();
    });
});
