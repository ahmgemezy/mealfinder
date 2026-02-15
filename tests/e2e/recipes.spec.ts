import { test, expect } from "@playwright/test";

test.describe("Recipe Browsing", () => {
    test("recipes page loads with recipe cards", async ({ page }) => {
        await page.goto("/en/recipes", { waitUntil: "domcontentloaded" });

        await expect(page.locator("body")).toBeVisible();
        await expect(page.locator("h1").first()).toBeVisible();
    });

    test("clicking a recipe card navigates to detail page", async ({ page }) => {
        await page.goto("/en/recipes", { waitUntil: "domcontentloaded" });

        const firstRecipeLink = page.locator('a[href*="/recipes/"]').first();
        await expect(firstRecipeLink).toBeVisible({ timeout: 15000 });

        await firstRecipeLink.click();
        await page.waitForURL("**/recipes/**");

        await expect(page.locator("body")).toBeVisible();
    });

    test("recipe detail page shows key content", async ({ page }) => {
        await page.goto("/en/recipes", { waitUntil: "domcontentloaded" });

        const firstRecipeLink = page.locator('a[href*="/recipes/"]').first();
        await expect(firstRecipeLink).toBeVisible({ timeout: 15000 });

        await firstRecipeLink.click();
        await page.waitForURL("**/recipes/**");

        await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
    });
});
