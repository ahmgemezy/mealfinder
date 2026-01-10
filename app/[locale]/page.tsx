import { Link } from "@/navigation";
import RecipeCard from "@/components/ui/RecipeCard";
import { RecipeCardSkeleton } from "@/components/ui/Skeleton";
import { getMultipleRandomMeals } from "@/lib/api";
import { Suspense } from "react";
import HeroSection from "@/components/sections/HeroSection";
import CTASection from "@/components/sections/CTASection";
import { getTranslations } from "next-intl/server";
import { translateRecipesList } from "@/lib/services/translation";

// Enable Incremental Static Regeneration (ISR)
export const revalidate = 604800; // Revalidate every 7 days

export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "fr" },
    { locale: "es" },
    { locale: "pt-br" },
    { locale: "de" },
    { locale: "ar" },
  ];
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Home' });

  // Generate a unique key for each request to force React to re-render
  // eslint-disable-next-line react-hooks/purity
  const requestKey = `featured-${Date.now()}-${Math.random()}`;

  // JSON-LD structured data for homepage
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dish Shuffle",
    url: "https://dishshuffle.com",
    description: "Discover your next favorite meal with Dish Shuffle. Browse thousands of recipes from around the world.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://dishshuffle.com/en/recipes?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dish Shuffle",
    url: "https://dishshuffle.com",
    logo: "https://dishshuffle.com/logo-final.png",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: "https://dishshuffle.com"
    }
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <section className="py-16 md:py-24 notranslate text-start">
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
            <div className="flex items-center justify-between mb-12 notranslate text-start">
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
              <FeaturedRecipes key={requestKey} locale={locale} />
            </Suspense>
          </div>
        </section>

        {/* Privacy & Legal Notice - Required for Google OAuth Verification */}
        <section className="py-8 bg-muted/50 notranslate text-start">
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
    </>
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

async function FeaturedRecipes({ locale }: { locale: string }) {
  let recipes = await getMultipleRandomMeals(9);

  // Translate recipes if needed
  if (locale && locale !== "en" && recipes.length > 0) {
    recipes = await translateRecipesList(recipes, locale);
  }

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
