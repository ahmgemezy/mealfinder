"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { submitContactForm } from "@/actions/submit-contact";

export default function ContactForm() {
    const t = useTranslations('Footer'); // Reusing footer keys or fallback
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setStatus('idle');
        setErrorMessage('');

        const result = await submitContactForm(formData);

        if (result.success) {
            setStatus('success');
            // Reset form
            const form = document.querySelector('form') as HTMLFormElement;
            form?.reset();
        } else {
            setStatus('error');
            setErrorMessage(result.error || "Something went wrong. Please try again.");
        }
        setIsLoading(false);
    }

    return (
        <div className="bg-card rounded-3xl p-8 shadow-soft border border-border/50">
            {status === 'success' ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4 animate-in fade-in zoom-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-4">
                        ✅
                    </div>
                    <h3 className="text-2xl font-bold text-green-700">Message Sent!</h3>
                    <p className="text-muted-foreground">
                        Thank you for reaching out. We'll get back to you soon.
                    </p>
                    <button
                        onClick={() => setStatus('idle')}
                        className="mt-6 text-primary-600 font-medium hover:underline"
                    >
                        Send another message
                    </button>
                </div>
            ) : (
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                            placeholder="Your Name"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                            placeholder="What is this regarding?"
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            required
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                            placeholder="Your message here..."
                        ></textarea>
                    </div>

                    {status === 'error' && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Message'
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
