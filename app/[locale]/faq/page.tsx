import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FAQClient from "./FAQClient";
import { Link } from "@/navigation";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dishshuffle.com";

// Make FAQ static for export
export const dynamic = "force-static";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FAQ" });

  return {
    title: t("title"),
    description: t("subtitle"),
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url: `${baseUrl}/${locale}/faq`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("subtitle"),
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/faq`,
      languages: {
        en: `${baseUrl}/en/faq`,
        fr: `${baseUrl}/fr/faq`,
        es: `${baseUrl}/es/faq`,
      },
    },
  };
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FAQ" });

  // Generate FAQ structured data for Google
  const categories = [
    {
      key: "cooking",
      questions: [
        "essentialTools",
        "readRecipe",
        "miseEnPlace",
        "pantryStaples",
        "seasoningTips",
        "howToBoilEgg",
        "howToCookPasta",
        "howToCookRice",
        "howToCookSteak",
        "bakingPowderVsSoda",
        "preventSticking",
        "checkMeatDoneness",
        "saltPastaWater",
        "tenderizeMeat",
        "bakingMeasure",
        "cookingMistakes",
        "tastingFood",
        "knifeSkills",
        "restingSteak",
        "boilingVsSimmering",
      ],
    },
    {
      key: "safety",
      questions: [
        "handwashing",
        "crossContamination",
        "dangerZone",
        "fridgeTemp",
        "shouldWashChicken",
        "howLongFoodLeftOut",
        "thawingFood",
        "leftoverSafety",
        "frozenVsFresh",
        "cheeseGoneBad",
        "restMeatAfterCooking",
        "washingMeat",
        "refreezing",
        "safeTemps",
        "produceTech",
        "useByVsBestBy",
        "fridgeStorage",
        "coolingFood",
        "kitchenHygiene",
        "visualCues",
      ],
    },
    {
      key: "substitutions",
      questions: [
        "substitutionRules",
        "buttermilkSub",
        "butterVsOil",
        "glutenFreeFlour",
        "butterSaltedOrUnsalted",
        "sugarTypes",
        "honeyVsSugar",
        "breadcrumbsSub",
        "cornstarchSub",
        "freshVsDriedHerbs",
        "brothSub",
        "oliveOilForBaking",
        "wholeWheatFlour",
        "dairyFreeMilk",
        "cheeseSub",
        "bakingChocolate",
        "lemonJuice",
        "yogurtSourCream",
        "eggSubstitutes",
        "freshVsDried",
      ],
    },
    {
      key: "planning",
      questions: [
        "startMealPlanning",
        "benefitsMealPlan",
        "planningSchedule",
        "whatIsMealPlanning",
        "howOftenMealPlan",
        "mealPlanSaveMoney",
        "pickyEaters",
        "saveMoneyGroceries",
        "mealPrepVsPlan",
        "themeNights",
        "handleLeftovers",
        "backupMeals",
        "balancedPlan",
        "shoppingTips",
        "batchCooking",
        "familyInvolvement",
        "fridgeFreezerLife",
        "convenienceItems",
        "mealPrepStorage",
        "portionSizes",
      ],
    },
    {
      key: "platform",
      questions: [
        "howToSaveRecipes",
        "howToSearchRecipes",
        "surpriseMeFeature",
        "recipesFromWhere",
        "canIShareRecipes",
      ],
    },
    {
      key: "health",
      questions: [
        "weightGainAfter40",
        "dietaryChanges40",
        "proteinNeeds40",
        "boneHealth",
        "metabolismBoost",
        "intermittentFasting",
        "cognitiveFoods",
        "vitaminB12",
        "manageCravings",
        "adultAllergies",
        "allergyVsIntolerance",
        "commonIntolerances",
        "oralAllergySyndrome",
        "suspectAllergy",
        "heartHealth40",
        "heartRiskFactors",
        "agingHeart",
        "heartWarningSigns",
        "protectHeart",
        "digestiveIssues40",
        "commonDidgestiveProbs",
        "gutHealthSigns",
        "improveGutHealth",
        "foodSensitivities40",
        "supplements40",
        "hydration40",
        "caloricNeeds40",
        "prioritizeFoods40",
        "managingSugar",
      ],
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categories.flatMap((category) =>
      category.questions.map((questionKey) => ({
        "@type": "Question",
        name: t(`questions.${questionKey}.q`),
        acceptedAnswer: {
          "@type": "Answer",
          text: t(`questions.${questionKey}.a`),
        },
      }))
    ),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* FAQ Content */}
        <FAQClient />

        {/* CTA Section */}
        <div className="mt-16 text-center p-8 bg-linear-to-br from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 rounded-2xl border border-primary-200 dark:border-primary-800">
          <h2 className="font-display text-2xl font-bold mb-3 text-foreground">
            Still have questions?
          </h2>
          <p className="text-muted-foreground mb-6">
            Explore our recipe collection or try the Surprise Me feature to
            discover something new!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/recipes"
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              Browse Recipes
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
