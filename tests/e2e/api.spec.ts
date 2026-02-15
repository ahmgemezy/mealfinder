import { test, expect } from "@playwright/test";

test.describe("API /api/random", () => {
    test("returns 200 with a recipe object", async ({ request }) => {
        const response = await request.get("/api/random");
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body).toHaveProperty("recipe");
        expect(body.recipe).toHaveProperty("id");
    });

    test("accepts category query parameter", async ({ request }) => {
        const response = await request.get("/api/random?category=Seafood");
        // Could be 200 or 404 depending on availability
        expect([200, 404]).toContain(response.status());
    });

    test("accepts area query parameter", async ({ request }) => {
        const response = await request.get("/api/random?area=Italian");
        expect([200, 404]).toContain(response.status());
    });

    test("accepts locale query parameter for translation", async ({ request }) => {
        const response = await request.get("/api/random?locale=fr");
        // Should still return a valid response (translated or not)
        expect([200, 404]).toContain(response.status());
    });
});
