import Link from "next/link";
import Image from "next/image";
import { Recipe } from "@/lib/types/recipe";
import { useLocale, useTranslations } from "next-intl";

interface TryThisRecipeProps {
  recipe: Recipe;
}

export default function TryThisRecipe({ recipe }: TryThisRecipeProps) {
  const t = useTranslations('Blog');
  const locale = useLocale();

  if (!recipe) return null;

  return (
    <div className="bg-card rounded-3xl p-6 md:p-8 shadow-soft border border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">👨‍🍳</span>
        <h3
          data-toc-ignore="true"
          className="font-display text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary-600 to-accent-600"
        >
          {t('tryThisRecipe.title')}
        </h3>
      </div>

      <p className="text-muted-foreground mb-6">
        {t('tryThisRecipe.description')}
      </p>

      <Link href={`/${locale}/recipes/${recipe.id}`} className="block group">
        {/* Image Card */}
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg mb-4">
          {recipe.thumbnail ? (
            <Image
              src={recipe.thumbnail}
              alt={recipe.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary-100 to-accent-100 flex items-center justify-center text-4xl">
              🍽️
            </div>
          )}

          {/* Floating Info */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            {recipe.readyInMinutes && (
              <span className="bg-black/70 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                ⏱️ {recipe.readyInMinutes}m
              </span>
            )}
            {recipe.calories && (
              <span className="bg-black/70 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                🔥 {Math.round(recipe.calories)}
              </span>
            )}
          </div>
        </div>

        <h4 className="font-display text-xl font-bold group-hover:text-primary-600 transition-colors mb-2">
          {recipe.name}
        </h4>

        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.category && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              {recipe.category}
            </span>
          )}
          {recipe.area && (
            <span className="text-xs px-2 py-1 rounded-full bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300">
              {recipe.area}
            </span>
          )}
        </div>

        <div className="w-full py-3 rounded-xl bg-primary-600 text-white font-medium text-center shadow-lg shadow-primary-500/20 group-hover:bg-primary-700 group-hover:shadow-primary-500/30 transition-all transform group-hover:-translate-y-0.5">
          {t('tryThisRecipe.viewRecipe')}
        </div>
      </Link>
    </div>
  );
}
