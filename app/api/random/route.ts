import { NextRequest, NextResponse } from "next/server";
import {
    getRandomMeal,
    getRandomMealWithFilters,
} from "@/lib/api";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get("category") || undefined;
        const area = searchParams.get("area") || undefined;

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

        return NextResponse.json(
            { recipe },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
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
