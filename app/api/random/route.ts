import { NextRequest, NextResponse } from "next/server";
import {
    getRandomMeal,
    getRandomMealWithFilters,
} from "@/lib/api";
import { translateRecipe } from "@/lib/services/translation";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get("category") || undefined;
        const area = searchParams.get("area") || undefined;
        const locale = searchParams.get("locale") || "en";

        let recipe;

        if (category || area) {
            recipe = await getRandomMealWithFilters({
                category,
                area,
            });
        } else {
            recipe = await getRandomMeal();
        }

        if (!recipe) {
            return NextResponse.json(
                { error: "No recipe found matching your criteria" },
                { status: 404 }
            );
        }

        // Translate if needed
        if (locale && locale !== 'en') {
            recipe = await translateRecipe(recipe, locale);
        }

        return NextResponse.json(
            { recipe },
            {
                headers: {
                    "Cache-Control": "no-store, max-age=0",
                },
            }
        );
    } catch (error) {
        console.error("Error in random meal API:", error);
        return NextResponse.json(
            { error: "Failed to fetch random meal" },
            { status: 500 }
        );
    }
}
