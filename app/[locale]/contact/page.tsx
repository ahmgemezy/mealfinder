import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
        title: "Contact Us | Dish Shuffle",
        description: "Get in touch with the Dish Shuffle team. We'd love to hear your feedback, recipe suggestions, or partnership inquiries.",
        alternates: {
            canonical: `https://dishshuffle.com/${locale}/contact`,
        }
    };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });

    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 gradient-text text-center">
                Contact Us
            </h1>

            <div className="bg-card rounded-3xl p-8 shadow-soft border border-border/50">
                <p className="text-lg text-center mb-8 text-muted-foreground">
                    Have questions, feedback, or just want to say hello?
                    <br />We'd love to hear from you!
                </p>

                <div className="space-y-8">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border">
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-2xl">
                            📧
                        </div>
                        <div>
                            <h3 className="font-bold">Email Us</h3>
                            <a href="mailto:hello@dishshuffle.com" className="text-primary-600 hover:underline">
                                hello@dishshuffle.com
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
                            🐦
                        </div>
                        <div>
                            <h3 className="font-bold">Follow Us</h3>
                            <a href="https://twitter.com/dishshuffle" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                @dishshuffle
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center text-sm text-muted-foreground">
                    <p> Dish Shuffle<br /> Cairo, Egypt</p>
                </div>
            </div>
        </div>
    );
}
