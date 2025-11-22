import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cookie Policy | What To Eat?",
    description: "Understand how What To Eat? uses cookies to improve your experience. Manage your cookie preferences.",
};

export default function CookiesPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 gradient-text">Cookie Policy</h1>
            <div className="prose prose-lg prose-stone dark:prose-invert max-w-none">
                <p className="text-muted-foreground mb-8 text-lg">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">1. What Are Cookies?</h2>
                    <p>
                        Cookies are small text files that are placed on your computer or
                        mobile device by websites that you visit. They are widely used in
                        order to make websites work, or work more efficiently, as well as to
                        provide information to the owners of the site.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">2. How We Use Cookies</h2>
                    <p>We use different types of cookies for various purposes:</p>

                    <div className="space-y-6 mt-4">
                        <div className="bg-card p-6 rounded-2xl border border-border">
                            <h3 className="text-xl font-bold mb-2 text-foreground">Essential Cookies</h3>
                            <p className="text-muted-foreground">
                                These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms.
                            </p>
                        </div>

                        <div className="bg-card p-6 rounded-2xl border border-border">
                            <h3 className="text-xl font-bold mb-2 text-foreground">Performance Cookies</h3>
                            <p className="text-muted-foreground">
                                These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.
                            </p>
                        </div>

                        <div className="bg-card p-6 rounded-2xl border border-border">
                            <h3 className="text-xl font-bold mb-2 text-foreground">Functional Cookies</h3>
                            <p className="text-muted-foreground">
                                These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages.
                            </p>
                        </div>

                        <div className="bg-card p-6 rounded-2xl border border-border">
                            <h3 className="text-xl font-bold mb-2 text-foreground">Targeting Cookies</h3>
                            <p className="text-muted-foreground">
                                These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">3. Managing Cookies</h2>
                    <p>
                        You can change your cookie preferences at any time by clicking the "Cookie Settings" button in our banner. You can also adjust your browser settings to block or delete cookies.
                    </p>
                    <p className="mt-4">
                        To find out more about cookies, including how to see what cookies have been set, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">www.aboutcookies.org</a> or <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">www.allaboutcookies.org</a>.
                    </p>
                </section>
            </div>
        </div>
    );
}
