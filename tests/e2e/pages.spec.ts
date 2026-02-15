import { test, expect } from "@playwright/test";

const PAGES = [
  "/en",
  "/en/recipes",
  "/en/blog",
  "/en/about",
  "/en/contact",
  "/en/collections",
  "/en/faq",
  "/en/pantry",
  "/en/surprise-me",
  "/en/privacy-policy",
  "/en/terms-of-service",
  "/en/cookies-policy",
];

for (const path of PAGES) {
  test(`page ${path} loads without console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(path, { waitUntil: "domcontentloaded" });

    await expect(page.locator("body")).toBeVisible();
    expect(errors).toEqual([]);
  });
}
