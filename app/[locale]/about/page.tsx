import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'About' });

    return {
        title: "About Us | Dish Shuffle",
        description: "Learn about the team behind Dish Shuffle and our mission to help you discover delicious recipes from around the world.",
        alternates: {
            canonical: `https://dishshuffle.com/${locale}/about`,
        }
    };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'About' });

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 gradient-text text-center">
                About Dish Shuffle
            </h1>

            <div className="prose dark:prose-invert mx-auto text-lg leading-relaxed space-y-8">
                <p>
                    Welcome to Dish Shuffle, your ultimate destination for culinary inspiration!
                    We believe that cooking should be an adventure, not a chore. Our mission is to break you out of your food rut
                    by shuffling through thousands of delicious recipes from every corner of the globe.
                </p>

                <div className="relative w-full h-64 md:h-96 rounded-3xl overflow-hidden shadow-2xl my-12">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white text-9xl">
                        👨‍🍳
                    </div>
                </div>

                <h2 className="text-3xl font-bold font-display text-primary-500">Our Story</h2>
                <p>
                    Dish Shuffle started with a simple question: "What should I eat today?"
                    Frustrated by the endless scrolling through recipe sites and the paralysis of choice,
                    we built a tool to make decision-making fun again. Whether you're looking for a quick weeknight dinner,
                    exploring a new cuisine, or just want to be surprised, we've got you covered.
                </p>

                <h2 className="text-3xl font-bold font-display text-primary-500">Why Use Dish Shuffle?</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0">
                    <li className="bg-card p-6 rounded-2xl shadow-sm border border-border/50">
                        <span className="text-2xl mr-2">🎲</span>
                        <strong>Surprise Me:</strong> Let fate decide your next meal with our random recipe generator.
                    </li>
                    <li className="bg-card p-6 rounded-2xl shadow-sm border border-border/50">
                        <span className="text-2xl mr-2">🌍</span>
                        <strong>Global Flavors:</strong> Explore authentic dishes from Italian to Japanese, Mexican to Indian.
                    </li>
                    <li className="bg-card p-6 rounded-2xl shadow-sm border border-border/50">
                        <span className="text-2xl mr-2">🛒</span>
                        <strong>Smart Shopping:</strong> Generate instant shopping lists for any recipe.
                    </li>
                    <li className="bg-card p-6 rounded-2xl shadow-sm border border-border/50">
                        <span className="text-2xl mr-2">📱</span>
                        <strong>Save Favorites:</strong> Keep track of the recipes you love.
                    </li>
                </ul>

                <hr className="my-12 border-border" />

                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
                    <p className="mb-8">
                        We're constantly adding new recipes and features. Have a suggestion or a favorite recipe to share?
                    </p>
                    <a
                        href={`/${locale}/contact`}
                        className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold transition-transform hover:scale-105"
                    >
                        Contact Us
                    </a>
                </div>
            </div>
        </div>
    );
}
