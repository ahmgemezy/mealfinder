"use client";

import { useState } from "react";
import IngredientInput from "@/components/features/IngredientInput";
import PantryResults from "@/components/features/PantryResults";
import { searchByIngredients } from "@/lib/api";
import { Recipe } from "@/lib/types/recipe";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SmartPantryPage() {
    const t = useTranslations("SmartPantry");
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchedIngredients, setSearchedIngredients] = useState<string[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (ingredients: string[]) => {
        setIsLoading(true);
        setSearchedIngredients(ingredients);
        setHasSearched(true);
        setRecipes([]);

        try {
            const results = await searchByIngredients(ingredients);
            setRecipes(results);
        } catch (error) {
            console.error("Failed to fetch recipes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-orange-50/30 pb-20">
            {/* Hero Section */}
            <div className="relative bg-white border-b border-orange-100 pb-16 pt-32 px-6 notranslate text-start">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-bold text-sm mb-4">
                        <Sparkles size={16} />
                        <span>{t("newFeatureTag")}</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                        {t("heroTitle")} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                            {t("heroTitleHighlight")}
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        {t("heroSubtitle")}
                    </p>

                    <div className="mt-12">
                        <IngredientInput onSearch={handleSearch} isLoading={isLoading} />
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {hasSearched && !isLoading && recipes.length === 0 && (
                    <div className="text-center py-20 notranslate text-start">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("noResults")}</h3>
                        <p className="text-gray-500">{t("noResultsDesc")}</p>
                    </div>
                )}

                <PantryResults recipes={recipes} searchedIngredients={searchedIngredients} />
            </div>
        </div>
    );
}
