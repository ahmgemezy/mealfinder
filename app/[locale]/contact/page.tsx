import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactForm from "@/components/contact/ContactForm";

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
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 gradient-text text-center">
                Contact Us
            </h1>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Contact Info Side */}
                <div className="space-y-8">
                    <div className="bg-card rounded-3xl p-8 shadow-soft border border-border/50 h-full">
                        <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                        <p className="text-muted-foreground mb-8">
                            Have questions, feedback, or just want to say hello?
                            We'd love to hear from you!
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-2xl">
                                    📧
                                </div>
                                <div>
                                    <h3 className="font-bold">Email Us</h3>
                                    <a href="mailto:contact@dishshuffle.com" className="text-primary-600 hover:underline">
                                        contact@dishshuffle.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
                                    🌍
                                </div>
                                <div>
                                    <h3 className="font-bold">Location</h3>
                                    <p className="text-muted-foreground">Cairo, Egypt</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <ContactForm />
            </div>
        </div>
    );
}
