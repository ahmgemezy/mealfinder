import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | Dish Shuffle",
    description: "Read the Terms of Service for Dish Shuffle. Understand your rights and responsibilities when using our recipe discovery platform.",
};

export default function TermsOfService() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl text-start" lang="en">
            <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
                Terms of Service
            </h1>

            <div className="prose dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                        1. Acceptance of Terms
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        By accessing and using Dish Shuffle (&quot;Service&quot;), you accept and agree to be bound by
                        these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please
                        do not use our Service. We reserve the right to update these Terms at any time,
                        and your continued use of the Service constitutes acceptance of those changes.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">2. Description of Service</h2>
                    <p>
                        Dish Shuffle is a recipe discovery platform that helps users find, explore, and save
                        recipes from various sources. Our Service includes:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>Recipe search and browsing functionality</li>
                        <li>Random recipe suggestions (&quot;Surprise Me&quot; feature)</li>
                        <li>User account creation and authentication via Google Sign-In</li>
                        <li>Saving favorite recipes to your personal collection</li>
                        <li>Recipe filtering by cuisine, category, and dietary preferences</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">3. User Accounts</h2>
                    <p>
                        To access certain features of the Service, you may create an account using Google Sign-In.
                        By creating an account, you agree to:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>Provide accurate, current, and complete information</li>
                        <li>Maintain the security of your account credentials</li>
                        <li>Accept responsibility for all activities that occur under your account</li>
                        <li>Notify us immediately of any unauthorized use of your account</li>
                    </ul>
                    <p className="mt-4">
                        We reserve the right to suspend or terminate accounts that violate these Terms
                        or engage in fraudulent or abusive behavior.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">4. Acceptable Use</h2>
                    <p>
                        When using Dish Shuffle, you agree NOT to:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>Violate any applicable laws or regulations</li>
                        <li>Infringe upon the intellectual property rights of others</li>
                        <li>Attempt to gain unauthorized access to our systems or networks</li>
                        <li>Use automated tools to scrape or collect data from the Service</li>
                        <li>Interfere with or disrupt the Service or servers</li>
                        <li>Upload or transmit viruses or malicious code</li>
                        <li>Harass, abuse, or harm other users</li>
                        <li>Use the Service for any commercial purposes without our consent</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">5. Intellectual Property</h2>
                    <p>
                        The Service and its original content, features, and functionality are owned by
                        Dish Shuffle and are protected by international copyright, trademark, patent,
                        trade secret, and other intellectual property laws.
                    </p>
                    <p className="mt-4">
                        Recipe content displayed on Dish Shuffle may be sourced from third-party APIs
                        including TheMealDB and Spoonacular. We do not claim ownership of this content,
                        and it remains the property of the respective content owners.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">6. Third-Party Services</h2>
                    <p>
                        Our Service integrates with third-party services, including:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>
                            <strong>Google Sign-In:</strong> For user authentication. Your use of Google
                            Sign-In is subject to Google&apos;s Terms of Service and Privacy Policy.
                        </li>
                        <li>
                            <strong>Recipe APIs:</strong> We source recipe data from TheMealDB and Spoonacular
                            APIs. The accuracy and availability of recipe content is dependent on these services.
                        </li>
                        <li>
                            <strong>Supabase:</strong> For database and authentication services.
                        </li>
                        <li>
                            <strong>Advertising Partners:</strong> We partner with third-party advertising
                            networks including Google AdSense and Ezoic to display advertisements on our
                            Service. These partners may use cookies and similar technologies to serve
                            personalized ads based on your browsing behavior.
                        </li>
                    </ul>
                    <p className="mt-4">
                        We are not responsible for the content, privacy practices, or actions of these
                        third-party services. Your use of third-party services is at your own risk and
                        subject to the terms and policies of those services.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">7. Advertising</h2>
                    <p>
                        Dish Shuffle displays advertisements to support our free service. By using our
                        Service, you agree to the following:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>
                            Advertisements may be displayed throughout the Service, including on recipe
                            pages, search results, and other areas.
                        </li>
                        <li>
                            Our advertising partners may use cookies, web beacons, and similar technologies
                            to collect information about your browsing activity to serve you personalized
                            advertisements.
                        </li>
                        <li>
                            We do not endorse or guarantee the products or services advertised on our
                            Service. Any transactions with advertisers are solely between you and the
                            advertiser.
                        </li>
                        <li>
                            You may opt out of personalized advertising by visiting the advertising
                            opt-out links provided in our Privacy Policy and Cookie Policy.
                        </li>
                        <li>
                            You agree not to use ad-blocking software or technologies to circumvent
                            advertisements on our Service, as advertising revenue supports the free
                            availability of our Service.
                        </li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">8. Disclaimer of Warranties</h2>
                    <p>
                        The Service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties
                        of any kind, either express or implied, including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>Implied warranties of merchantability and fitness for a particular purpose</li>
                        <li>Accuracy, reliability, or completeness of recipe information</li>
                        <li>Uninterrupted or error-free operation of the Service</li>
                        <li>Suitability of recipes for specific dietary needs or allergies</li>
                    </ul>
                    <p className="mt-4 font-semibold">
                        Always verify ingredients and cooking instructions, especially if you have food allergies
                        or dietary restrictions. Dish Shuffle is not responsible for any adverse reactions
                        or health issues resulting from the use of recipes found through our Service.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">9. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by law, Dish Shuffle shall not be liable for any
                        indirect, incidental, special, consequential, or punitive damages, or any loss of
                        profits or revenues, whether incurred directly or indirectly, or any loss of data,
                        use, goodwill, or other intangible losses, resulting from:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>Your access to or use of (or inability to access or use) the Service</li>
                        <li>Any conduct or content of any third party on the Service</li>
                        <li>Any content obtained from the Service</li>
                        <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">10. Indemnification</h2>
                    <p>
                        You agree to defend, indemnify, and hold harmless Dish Shuffle and its officers,
                        directors, employees, and agents from and against any claims, liabilities, damages,
                        losses, and expenses, including reasonable legal fees, arising out of or in any
                        way connected with your access to or use of the Service, or your violation of
                        these Terms.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">11. Termination</h2>
                    <p>
                        We may terminate or suspend your access to the Service immediately, without prior
                        notice or liability, for any reason whatsoever, including without limitation if
                        you breach these Terms. Upon termination, your right to use the Service will
                        immediately cease.
                    </p>
                    <p className="mt-4">
                        You may also delete your account at any time. Upon account deletion, we will
                        remove your personal data in accordance with our Privacy Policy, though some
                        information may be retained as required by law or for legitimate business purposes.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">12. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of
                        the jurisdiction in which Dish Shuffle operates, without regard to its conflict
                        of law provisions. Any disputes arising from these Terms or the Service shall
                        be resolved in the competent courts of that jurisdiction.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">13. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify or replace these Terms at any time at our sole
                        discretion. If a revision is material, we will provide at least 30 days&apos; notice
                        prior to any new terms taking effect. What constitutes a material change will
                        be determined at our sole discretion.
                    </p>
                    <p className="mt-4">
                        By continuing to access or use our Service after any revisions become effective,
                        you agree to be bound by the revised terms.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">14. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms of Service, please contact us at:
                    </p>
                    <p className="mt-4">
                        <strong>Email:</strong> contact@dishshuffle.com
                    </p>
                </section>
            </div>
        </div>
    );
}
