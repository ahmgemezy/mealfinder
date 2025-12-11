"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
    return (
        <div className="border-b border-border last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-5 px-6 text-left hover:bg-muted/30 transition-colors"
                aria-expanded={isOpen}
            >
                <h3 className="font-display text-lg font-semibold pr-8 text-foreground">
                    {question}
                </h3>
                <svg
                    className={`w-6 h-6 text-primary-500 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                        }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
}

export default function FAQClient() {
    const t = useTranslations("FAQ");
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const toggleItem = (key: string) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(key)) {
            newOpenItems.delete(key);
        } else {
            newOpenItems.add(key);
        }
        setOpenItems(newOpenItems);
    };

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
                "freshVsDried"
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

    return (
        <div className="space-y-12">
            {categories.map((category) => (
                <section key={category.key}>
                    <h2 className="font-display text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
                        <span className="w-1 h-8 bg-primary-500 rounded-full"></span>
                        {t(`categories.${category.key}`)}
                    </h2>
                    <div className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden">
                        {category.questions.map((questionKey) => (
                            <FAQItem
                                key={questionKey}
                                question={t(`questions.${questionKey}.q`)}
                                answer={t(`questions.${questionKey}.a`)}
                                isOpen={openItems.has(questionKey)}
                                onToggle={() => toggleItem(questionKey)}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
