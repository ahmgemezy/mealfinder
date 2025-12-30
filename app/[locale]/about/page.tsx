import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });

  return {
    title: "About Us | Dish Shuffle",
    description:
      "Meet the team behind Dish Shuffle and learn about our mission to help you discover delicious recipes from around the world.",
    alternates: {
      canonical: `https://dishshuffle.com/${locale}/about`,
    },
  };
}

// Team members/authors who contribute to Dish Shuffle
const TEAM_MEMBERS = [
  {
    name: "Chef Alex",
    role: "Head Chef & Recipe Curator",
    bio: "A classically trained chef with over 15 years of experience in professional kitchens across Europe and Asia. Alex brings authentic techniques and flavors to every recipe.",
    avatar: "👨‍🍳",
  },
  {
    name: "Sarah Jenkins",
    role: "Nutrition Specialist",
    bio: "Registered dietitian passionate about making healthy eating accessible. Sarah ensures our recipes balance flavor with nutritional value.",
    avatar: "👩‍🔬",
  },
  {
    name: "Marcus Chen",
    role: "Food Writer & Recipe Developer",
    bio: "Award-winning food writer who has contributed to major culinary publications. Marcus crafts engaging content that makes cooking approachable for everyone.",
    avatar: "✍️",
  },
  {
    name: "Giulia Rossi",
    role: "Mediterranean Cuisine Expert",
    bio: "Born and raised in Tuscany, Giulia shares authentic Italian recipes passed down through generations of her family.",
    avatar: "🇮🇹",
  },
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-background to-accent-50 dark:from-primary-950/30 dark:via-background dark:to-accent-950/30 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text">
            About Dish Shuffle
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Where culinary inspiration meets everyday cooking. We&apos;re on a mission
            to help you discover your next favorite meal.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Our Story */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-display text-3xl font-bold text-primary-600">
                Our Story
              </h2>
              <div className="prose dark:prose-invert text-lg leading-relaxed space-y-4">
                <p>
                  Dish Shuffle was born from a simple frustration we&apos;ve all
                  experienced: standing in front of the fridge, wondering what to
                  cook tonight. The endless scrolling through recipe sites, the
                  paralysis of too many choices—we knew there had to be a better way.
                </p>
                <p>
                  Founded in 2024, our platform combines thousands of carefully
                  curated recipes with intelligent discovery tools to make meal
                  planning exciting again. Whether you&apos;re a seasoned home cook
                  or just starting your culinary journey, we&apos;re here to inspire
                  your next masterpiece.
                </p>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-9xl">🍳</span>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="mb-20 bg-card rounded-3xl p-8 md:p-12 border border-border/50 shadow-lg">
          <h2 className="font-display text-3xl font-bold text-center mb-8 text-primary-600">
            Our Mission
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-3xl">
                🌍
              </div>
              <h3 className="font-bold text-lg">Global Flavors</h3>
              <p className="text-muted-foreground">
                Bringing authentic recipes from every corner of the world to your kitchen.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-accent-100 dark:bg-accent-900/30 rounded-2xl flex items-center justify-center text-3xl">
                ✨
              </div>
              <h3 className="font-bold text-lg">Quality Content</h3>
              <p className="text-muted-foreground">
                Every recipe is tested and written by experienced culinary professionals.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-3xl">
                💡
              </div>
              <h3 className="font-bold text-lg">Cooking Made Easy</h3>
              <p className="text-muted-foreground">
                Clear instructions and helpful tips that make any dish achievable.
              </p>
            </div>
          </div>
        </section>

        {/* Meet the Team */}
        <section className="mb-20">
          <h2 className="font-display text-3xl font-bold text-center mb-4 text-primary-600">
            Meet Our Team
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            The talented food enthusiasts behind Dish Shuffle&apos;s recipes and content.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.name}
                className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center text-3xl shrink-0">
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{member.name}</h3>
                    <p className="text-primary-600 text-sm font-medium mb-2">
                      {member.role}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Dish Shuffle */}
        <section className="mb-20">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-primary-600">
            Why Choose Dish Shuffle?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border/50 text-center">
              <span className="text-4xl mb-4 block">🎲</span>
              <h3 className="font-bold mb-2">Surprise Me</h3>
              <p className="text-sm text-muted-foreground">
                Let fate decide your next meal with our random recipe generator.
              </p>
            </div>
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border/50 text-center">
              <span className="text-4xl mb-4 block">🌎</span>
              <h3 className="font-bold mb-2">10+ Cuisines</h3>
              <p className="text-sm text-muted-foreground">
                From Italian classics to Asian delights, explore global flavors.
              </p>
            </div>
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border/50 text-center">
              <span className="text-4xl mb-4 block">📚</span>
              <h3 className="font-bold mb-2">Expert Content</h3>
              <p className="text-sm text-muted-foreground">
                Articles and guides written by culinary professionals.
              </p>
            </div>
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border/50 text-center">
              <span className="text-4xl mb-4 block">❤️</span>
              <h3 className="font-bold mb-2">Save Favorites</h3>
              <p className="text-sm text-muted-foreground">
                Build your personal cookbook with recipes you love.
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-8 md:p-12 text-white">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Have Questions or Suggestions?
          </h2>
          <p className="mb-8 opacity-90 max-w-lg mx-auto">
            We&apos;d love to hear from you! Whether you have a recipe request,
            feedback, or just want to say hello.
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-full font-bold transition-transform hover:scale-105 shadow-lg"
          >
            Contact Us
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </section>
      </div>
    </div>
  );
}
