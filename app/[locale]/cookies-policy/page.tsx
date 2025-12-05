import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cookie Policy | Dish Shuffle",
    description: "Understand how Dish Shuffle uses cookies to improve your experience. Manage your cookie preferences.",
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
                        Cookies are small text files that are placed on your computer or mobile
                        device by websites that you visit. They are widely used in order to make
                        websites work, or work more efficiently, as well as to provide information
                        to the owners of the site. Cookies enable websites to remember your actions
                        and preferences over a period of time.
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
                            <h3 className="text-xl font-bold mb-2 text-foreground">Advertising / Targeting Cookies</h3>
                            <p className="text-muted-foreground">
                                These cookies are set through our site by our advertising partners to serve you relevant advertisements. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites. They do not store directly personal information, but are based on uniquely identifying your browser and internet device.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">3. Third-Party Advertising Cookies</h2>
                    <p>
                        We display advertisements on our website to support our free service. Our advertising partners may use cookies to serve personalized ads. These partners include:
                    </p>

                    <div className="space-y-6 mt-4">
                        <div className="bg-card p-6 rounded-2xl border border-border">
                            <h3 className="text-xl font-bold mb-2 text-foreground">Google AdSense</h3>
                            <p className="text-muted-foreground mb-3">
                                Google uses cookies to serve ads based on your prior visits to our website or other websites. Google&apos;s use of the DoubleClick cookie enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet.
                            </p>
                            <p className="text-muted-foreground">
                                <strong>Cookies used:</strong> __gads, __gpi, __Secure-3PAPISID, NID, CONSENT, and others.
                            </p>
                        </div>

                        <div className="bg-card p-6 rounded-2xl border border-border">
                            <h3 className="text-xl font-bold mb-2 text-foreground">Ezoic</h3>
                            <p className="text-muted-foreground mb-3">
                                Ezoic uses machine learning technology to optimize ad placements and improve user experience. Ezoic may collect data about your browsing behavior to serve relevant advertisements and improve website performance.
                            </p>
                            <p className="text-muted-foreground">
                                <strong>Cookies used:</strong> ezoadgid, ezoref, ezosuiba498, ezopvc, ezouspvh, and others.
                            </p>
                        </div>

                        <div className="bg-card p-6 rounded-2xl border border-border">
                            <h3 className="text-xl font-bold mb-2 text-foreground">Other Ad Networks</h3>
                            <p className="text-muted-foreground">
                                We may partner with additional advertising networks that use cookies and similar technologies to deliver targeted advertisements. These partners comply with industry standards and offer opt-out mechanisms.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">4. Opt-Out of Personalized Advertising</h2>
                    <p>
                        You can opt out of personalized advertising by visiting the following links:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>
                            <a href="https://www.google.com/settings/ads" className="text-primary-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                Google Ads Settings
                            </a>
                            {" "}- Manage your Google ad personalization preferences
                        </li>
                        <li>
                            <a href="https://optout.aboutads.info/" className="text-primary-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                Digital Advertising Alliance (DAA)
                            </a>
                            {" "}- Opt out of interest-based advertising
                        </li>
                        <li>
                            <a href="https://optout.networkadvertising.org/" className="text-primary-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                Network Advertising Initiative (NAI)
                            </a>
                            {" "}- Opt out of targeted advertising
                        </li>
                        <li>
                            <a href="https://youronlinechoices.eu/" className="text-primary-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                Your Online Choices (EU)
                            </a>
                            {" "}- For European users
                        </li>
                    </ul>
                    <p className="mt-4 text-muted-foreground">
                        Please note that opting out does not mean you will no longer see ads; it means the ads you see will be less relevant to your interests.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">5. Managing Cookies in Your Browser</h2>
                    <p>
                        Most web browsers allow you to control cookies through their settings. You can set your browser to:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>Block all cookies</li>
                        <li>Accept all cookies</li>
                        <li>Block third-party cookies</li>
                        <li>Clear all cookies when you close the browser</li>
                        <li>Open a &quot;private browsing&quot; / &quot;incognito&quot; session</li>
                        <li>Install add-ons and plugins to extend browser privacy features</li>
                    </ul>
                    <p className="mt-4">
                        Here are links to manage cookies in popular browsers:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>
                            <a href="https://support.google.com/chrome/answer/95647" className="text-primary-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                Google Chrome
                            </a>
                        </li>
                        <li>
                            <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" className="text-primary-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                Mozilla Firefox
                            </a>
                        </li>
                        <li>
                            <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" className="text-primary-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                Safari
                            </a>
                        </li>
                        <li>
                            <a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies" className="text-primary-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                Microsoft Edge
                            </a>
                        </li>
                    </ul>
                    <p className="mt-4 text-muted-foreground">
                        Please note that blocking cookies may impact your experience on our website and limit certain functionality.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">6. Cookie Retention</h2>
                    <p>
                        Cookies have varying lifespans:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>
                            <strong>Session Cookies:</strong> These are temporary cookies that expire when you close your browser.
                        </li>
                        <li>
                            <strong>Persistent Cookies:</strong> These cookies remain on your device until they expire or you delete them. They can last from a few days to several years.
                        </li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">7. Updates to This Policy</h2>
                    <p>
                        We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Please revisit this page regularly to stay informed about our use of cookies.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">8. Contact Us</h2>
                    <p>
                        If you have any questions about our use of cookies or this policy, please contact us at:
                    </p>
                    <p className="mt-4">
                        <strong>Email:</strong> contact@dishshuffle.com
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">More Information</h2>
                    <p>
                        To learn more about cookies, visit:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>
                            <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
                                www.aboutcookies.org
                            </a>
                        </li>
                        <li>
                            <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
                                www.allaboutcookies.org
                            </a>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
