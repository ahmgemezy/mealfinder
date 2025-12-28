import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Dish Shuffle",
    description: "Learn how Dish Shuffle collects, uses, and protects your personal data. Compliant with GDPR and CCPA regulations.",
};

export default function PrivacyPolicy() {

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl text-start" lang="en">
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
                        <li>
                            <strong>Advertising Data:</strong> includes information collected by
                            our advertising partners for the purpose of delivering personalized
                            advertisements, including device identifiers, browsing behavior, and
                            interaction with ads.
                        </li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">3. Advertising and Third-Party Services</h2>
                    <p>
                        We display advertisements on our website to support our free service. These
                        advertisements are served by third-party advertising networks and partners,
                        which may include:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>
                            <strong>Google AdSense:</strong> Google uses cookies to serve ads based on
                            your prior visits to our website or other websites. Google&apos;s use of
                            advertising cookies enables it and its partners to serve ads based on your
                            visit to our site and/or other sites on the Internet.
                        </li>
                        <li>
                            <strong>Ezoic:</strong> We may use Ezoic to optimize ad placements and improve
                            user experience. Ezoic uses machine learning technology and may collect data
                            about your browsing behavior to serve relevant advertisements.
                        </li>
                        <li>
                            <strong>Other Ad Networks:</strong> We may partner with additional advertising
                            networks that use cookies and similar technologies to deliver targeted
                            advertisements.
                        </li>
                    </ul>


                    {/* Ezoic Privacy Policy Embed */}
                    <span id="ezoic-privacy-policy-embed"></span>

                    <p className="mt-4">
                        <strong>Opting Out of Personalized Advertising:</strong> You may opt out of
                        personalized advertising by visiting{" "}
                        <a href="https://www.google.com/settings/ads" className="text-primary-500 hover:underline" target="_blank" rel="noopener noreferrer">
                            Google Ads Settings
                        </a>{" "}
                        or{" "}
                        <a href="https://optout.aboutads.info/" className="text-primary-500 hover:underline" target="_blank" rel="noopener noreferrer">
                            www.aboutads.info
                        </a>
                        . You can also visit the Network Advertising Initiative opt-out page at{" "}
                        <a href="https://optout.networkadvertising.org/" className="text-primary-500 hover:underline" target="_blank" rel="noopener noreferrer">
                            networkadvertising.org
                        </a>
                        .
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">4. Cookies and Tracking Technologies</h2>
                    <p>
                        We use cookies and similar tracking technologies to track activity on our
                        website and hold certain information. Cookies are files with a small amount
                        of data which may include an anonymous unique identifier.
                    </p>
                    <p className="mt-4">
                        <strong>Types of Cookies We Use:</strong>
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>
                            <strong>Essential Cookies:</strong> Required for the website to function
                            properly, including authentication and security.
                        </li>
                        <li>
                            <strong>Analytics Cookies:</strong> Help us understand how visitors
                            interact with our website by collecting and reporting information
                            anonymously.
                        </li>
                        <li>
                            <strong>Advertising Cookies:</strong> Used by our advertising partners
                            to deliver relevant advertisements and track ad campaign performance.
                            These cookies remember that you have visited a website and this
                            information is shared with other organizations such as advertisers.
                        </li>
                        <li>
                            <strong>Preference Cookies:</strong> Enable the website to remember
                            choices you make (such as your language preference) and provide
                            enhanced, personalized features.
                        </li>
                    </ul>
                    <p className="mt-4">
                        You can instruct your browser to refuse all cookies or to indicate when a
                        cookie is being sent. However, if you do not accept cookies, you may not be
                        able to use some portions of our website.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">5. How We Use Your Data</h2>
                    <p>
                        We use the data we collect for the following purposes:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>To provide and maintain our service</li>
                        <li>To personalize your experience on our website</li>
                        <li>To display relevant advertisements</li>
                        <li>To analyze how our website is used and improve our services</li>
                        <li>To communicate with you about updates or changes to our service</li>
                        <li>To detect, prevent, and address technical issues</li>
                        <li>To comply with legal obligations</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">6. International Transfers</h2>
                    <p>
                        We share your personal data within our group companies. This will involve transferring your data outside the European Economic Area (EEA). Whenever we transfer your personal data out of the EEA, we ensure a similar degree of protection is afforded to it by ensuring at least one of the following safeguards is implemented:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>We will only transfer your personal data to countries that have been deemed to provide an adequate level of protection for personal data by the European Commission.</li>
                        <li>Where we use certain service providers, we may use specific contracts approved by the European Commission which give personal data the same protection it has in Europe.</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">7. Your Legal Rights (GDPR &amp; CCPA)</h2>
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
                        <li>Right to opt-out of the sale of personal information (CCPA).</li>
                    </ul>
                    <p className="mt-4">
                        <strong>California Residents:</strong> Under the California Consumer Privacy Act (CCPA),
                        you have the right to know what personal information we collect, request deletion of your
                        personal information, and opt-out of the sale of your personal information. We do not
                        sell personal information in the traditional sense, but some data sharing with advertising
                        partners may be considered a &quot;sale&quot; under the CCPA.
                    </p>
                    <p className="mt-4">
                        If you wish to exercise any of the rights set out above, please contact us.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">8. Children&apos;s Privacy</h2>
                    <p>
                        Our website is not intended for children under the age of 13. We do not knowingly
                        collect personal information from children under 13. If you are a parent or guardian
                        and you are aware that your child has provided us with personal data, please contact
                        us so that we can take necessary action.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">9. Changes to This Privacy Policy</h2>
                    <p>
                        We may update our Privacy Policy from time to time. We will notify you of any
                        changes by posting the new Privacy Policy on this page and updating the
                        &quot;Last updated&quot; date at the top of this policy. You are advised to review this
                        Privacy Policy periodically for any changes.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">10. Contact Us</h2>
                    <p>
                        If you have any questions about this privacy policy or our privacy
                        practices, please contact our Data Protection Officer at: contact@dishshuffle.com
                    </p>
                </section>
            </div>
        </div >
    );
}
