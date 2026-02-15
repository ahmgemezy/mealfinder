import { test, expect } from "@playwright/test";

test.describe("Contact Page", () => {
    test("contact form renders with all fields", async ({ page }) => {
        await page.goto("/en/contact", { waitUntil: "domcontentloaded" });

        await expect(page.locator("h1").first()).toBeVisible();

        const nameInput = page.locator('input[name="name"], input[type="text"]').first();
        const emailInput = page.locator('input[name="email"], input[type="email"]').first();
        const messageField = page.locator("textarea").first();

        await expect(nameInput).toBeVisible();
        await expect(emailInput).toBeVisible();
        await expect(messageField).toBeVisible();
    });

    test("submit button is present", async ({ page }) => {
        await page.goto("/en/contact", { waitUntil: "domcontentloaded" });

        const submitBtn = page.locator('button[type="submit"]');
        await expect(submitBtn).toBeVisible();
    });
});
