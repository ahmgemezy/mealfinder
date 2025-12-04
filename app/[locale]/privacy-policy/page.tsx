import React from "react";
import { Metadata } from "next";
// import { useTranslations } from "next-intl";

export const metadata: Metadata = {
    title: "Privacy Policy | Dish Shuffle",
    description: "Learn how Dish Shuffle collects, uses, and protects your personal data. Compliant with GDPR and CCPA regulations.",
};

export default function PrivacyPolicy() {

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
                Privacy Policy
            </h1>

            <div className="prose dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                        1. Introduction
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Welcome to Dish Shuffle (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We respect your
                        privacy and are committed to protecting your personal data. This
                        privacy policy will inform you as to how we look after your personal
                        data when you visit our website and tell you about your privacy
                        rights and how the law protects you.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">2. Data We Collect</h2>
                    <p>
                        We may collect, use, store and transfer different kinds of personal
                        data about you which we have grouped together follows:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>
                            <strong>Identity Data:</strong> includes first name, last name,
                            username or similar identifier.
                        </li>
                        <li>
                            <strong>Contact Data:</strong> includes email address.
                        </li>
                        <li>
                            <strong>Technical Data:</strong> includes internet protocol (IP)
                            address, your login data, browser type and version, time zone
                            setting and location, browser plug-in types and versions,
                            operating system and platform and other technology on the devices
                            you use to access this website.
                        </li>
                        <li>
                            <strong>Usage Data:</strong> includes information about how you use
                            our website, products and services.
                        </li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">3. International Transfers</h2>
                    <p>
                        We share your personal data within our group companies. This will involve transferring your data outside the European Economic Area (EEA). Whenever we transfer your personal data out of the EEA, we ensure a similar degree of protection is afforded to it by ensuring at least one of the following safeguards is implemented:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>We will only transfer your personal data to countries that have been deemed to provide an adequate level of protection for personal data by the European Commission.</li>
                        <li>Where we use certain service providers, we may use specific contracts approved by the European Commission which give personal data the same protection it has in Europe.</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">4. Your Legal Rights (GDPR & CCPA)</h2>
                    <p>
                        Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>Request access to your personal data.</li>
                        <li>Request correction of your personal data.</li>
                        <li>Request erasure of your personal data.</li>
                        <li>Object to processing of your personal data.</li>
                        <li>Request restriction of processing your personal data.</li>
                        <li>Request transfer of your personal data.</li>
                        <li>Right to withdraw consent.</li>
                    </ul>
                    <p className="mt-4">
                        If you wish to exercise any of the rights set out above, please contact us.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">5. Contact Us</h2>
                    <p>
                        If you have any questions about this privacy policy or our privacy
                        practices, please contact our Data Protection Officer at: privacy@whattoeat.com
                    </p>
                </section>
            </div>
        </div>
    );
}
