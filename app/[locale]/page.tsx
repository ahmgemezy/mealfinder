import { Link } from "@/navigation";
import RecipeCard from "@/components/ui/RecipeCard";
import { RecipeCardSkeleton } from "@/components/ui/Skeleton";
import { getMultipleRandomMeals } from "@/lib/api";
import { Suspense } from "react";
import HeroSection from "@/components/sections/HeroSection";
import CTASection from "@/components/sections/CTASection";
import { getTranslations } from "next-intl/server";
import { unstable_noStore as noStore } from 'next/cache';
import { headers } from 'next/headers';

// Force dynamic rendering and disable all caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // Force dynamic rendering
  noStore();

  // Read headers to ensure this is treated as a dynamic request
  await headers();

  const t = await getTranslations('Home');

  // Generate a unique key for each request to force React to re-render
  // eslint-disable-next-line react-hooks/purity
  const requestKey = `featured-${Date.now()}-${Math.random()}`;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            {t('howItWorks')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎲"
              title={t('features.surprise.title')}
              description={t('features.surprise.description')}
            />
            <FeatureCard
              icon="🔍"
              title={t('features.browse.title')}
              description={t('features.browse.description')}
            />
            <FeatureCard
              icon="❤️"
              title={t('features.favorites.title')}
              description={t('features.favorites.description')}
            />
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {t('featuredRecipes')}
            </h2>
            <Link
              href="/recipes"
              className="text-primary-500 hover:text-primary-400 font-medium flex items-center gap-2"
            >
              {t('viewAll')}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          <Suspense key={requestKey} fallback={<FeaturedRecipesSkeleton />}>
            <FeaturedRecipes key={requestKey} />
          </Suspense>
        </div>
      </section>

      {/* Privacy & Legal Notice - Required for Google OAuth Verification */}
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              By using Dish Shuffle, you agree to our{' '}
              <Link href="/privacy-policy" className="text-primary-500 hover:underline font-medium">
                Privacy Policy
              </Link>
              {' '}and{' '}
              <Link href="/terms-of-service" className="text-primary-500 hover:underline font-medium">
                Terms of Service
              </Link>
              . We respect your privacy and protect your data.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="font-display text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

async function FeaturedRecipes() {
  // Disable caching for this component
  noStore();

  const recipes = await getMultipleRandomMeals(9);

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Unable to load recipes. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe, index) => (
        <RecipeCard key={recipe.id} recipe={recipe} priority={index < 3} />
      ))}
    </div>
  );
}

function FeaturedRecipesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}
