"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import Button from "@/components/ui/Button";
import { Recipe } from "@/lib/types/recipe";
import { getRecipeUrl } from "@/lib/utils/slugs";

export default function SurpriseMePage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: "",
    area: "",
  });

  const categories = [
    "Beef",
    "Chicken",
    "Dessert",
    "Lamb",
    "Pasta",
    "Pork",
    "Seafood",
    "Vegetarian",
    "Vegan",
  ];

  const areas = [
    "American",
    "British",
    "Chinese",
    "French",
    "Indian",
    "Italian",
    "Japanese",
    "Mexican",
    "Thai",
  ];

  const generateMeal = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.area) params.append("area", filters.area);
      // Add timestamp to prevent browser caching
      params.append("t", Date.now().toString());

      const response = await fetch(`/api/random?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch meal");

      const data = await response.json();
      if (!data.recipe) {
        throw new Error("No recipe found matching your filters");
      }

      setRecipe(data.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ category: "", area: "" });
  };

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 gradient-text">
              Surprise Me!
            </h1>
            <p className="text-xl text-muted-foreground">
              Can&apos;t decide what to eat? Let us pick a delicious meal for
              you!
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-2xl p-6 shadow-soft mb-8">
            <h2 className="font-semibold text-lg mb-4">Filter Your Surprise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Cuisine
                </label>
                <select
                  value={filters.area}
                  onChange={(e) =>
                    setFilters({ ...filters, area: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any Cuisine</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(filters.category || filters.area) && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">
                  Active filters:
                </span>
                {filters.category && (
                  <span className="px-3 py-1 bg-primary-50 dark:bg-primary-950 text-primary-500 dark:text-primary-400 rounded-full text-sm font-medium">
                    {filters.category}
                  </span>
                )}
                {filters.area && (
                  <span className="px-3 py-1 bg-primary-50 dark:bg-primary-950 text-primary-500 dark:text-primary-400 rounded-full text-sm font-medium">
                    {filters.area}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Clear all
                </button>
              </div>
            )}

            <Button
              onClick={generateMeal}
              isLoading={isLoading}
              size="lg"
              className="w-full"
            >
              {recipe ? "Try Another!" : "Generate Meal"}
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Recipe Result */}
          {recipe && (
            <div className="bg-card rounded-2xl overflow-hidden shadow-medium animate-scale-in">
              <div className="relative aspect-[16/9] md:aspect-[21/9]">
                <Image
                  src={recipe.thumbnail}
                  alt={recipe.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                  <h2 className="font-display text-3xl md:text-5xl font-bold mb-3">
                    {recipe.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm md:text-base">
                    <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      {recipe.area}
                    </span>
                    <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      {recipe.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={getRecipeUrl(recipe.name, recipe.id)}
                    className="flex-1"
                  >
                    <Button size="lg" className="w-full">
                      View Full Recipe
                    </Button>
                  </Link>
                  <Button
                    onClick={generateMeal}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    Try Another
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!recipe && !isLoading && !error && (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🎲</div>
              <p className="text-xl text-muted-foreground">
                Click the button above to discover your next meal!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
