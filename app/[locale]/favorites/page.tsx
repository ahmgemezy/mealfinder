"use client";

import { Link } from "@/navigation";
import RecipeCard from "@/components/ui/RecipeCard";
import Button from "@/components/ui/Button";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useTranslations } from "next-intl";

export default function FavoritesPage() {
    const { favorites } = useFavorites();
    const t = useTranslations('Favorites');

    return (
        <div className="min-h-screen py-8 md:py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 gradient-text">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        {favorites.length === 0
                            ? t('empty')
                            : t('count', { count: favorites.length })}
                    </p>
                </div>

                {/* Results */}
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-card rounded-3xl shadow-soft">
                        <div className="text-8xl mb-6">❤️</div>
                        <h3 className="font-display text-2xl font-bold mb-2">
                            {t('emptyTitle')}
                        </h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            {t('emptyDesc')}
                        </p>
                        <Link href="/recipes">
                            <Button size="lg">{t('browseRecipes')}</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
