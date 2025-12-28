
import "dotenv/config";
import { enrichRecipeSEO } from "../lib/services/seo-enricher";
import { Recipe } from "../lib/types/recipe";

const dummyRecipe: Recipe = {
    id: "test-123",
    name: "Spaghetti Carbonara",
    category: "Pasta",
    area: "Italian",
    instructions: "Boil pasta. Fry pancetta. Mix eggs and cheese. Combine.",
    thumbnail: "",
    tags: ["Pasta", "Italian"],
    youtube: "",
    ingredients: [
        { name: "Spaghetti", measure: "500g" },
        { name: "Pancetta", measure: "150g" },
        { name: "Eggs", measure: "3" },
        { name: "Pecorino Romano", measure: "100g" },
        { name: "Black Pepper", measure: "to taste" }
    ],
    source: "",
};

async function main() {
    console.log("🚀 Starting SEO Enrichment Test...");
    try {
        const result = await enrichRecipeSEO(dummyRecipe);
        console.log("✅ Enrichment Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

main();
