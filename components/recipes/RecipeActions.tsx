"use client";

import FavoriteButton from "@/components/ui/FavoriteButton";
import ShareButton from "@/components/recipes/ShareButton";
import { Recipe } from "@/lib/types/recipe";
import { useTranslations } from "next-intl";

interface RecipeActionsProps {
  recipe: Recipe;
}

export default function RecipeActions({ recipe }: RecipeActionsProps) {
  const t = useTranslations("Recipe");

  return (
    <div className="bg-linear-to-br from-card to-card/50 rounded-2xl p-6 shadow-soft border border-primary-100 dark:border-primary-900/30 sticky top-20">
      <div className="text-center mb-4">
        <span className="text-3xl mb-2 block">❤️</span>
        <h3 className="font-bold text-xl bg-linear-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          {t("loveThisRecipe")}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          {t("saveToFavorites")}
        </p>
      </div>
      <FavoriteButton recipe={recipe} className="w-full justify-center mb-4" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border/50"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-2 text-xs text-muted-foreground uppercase tracking-wider">
            or
          </span>
        </div>
      </div>

      <div className="mt-4">
        <ShareButton recipe={recipe} />
      </div>
    </div>
  );
}
