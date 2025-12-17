"use client";

import { useState } from "react";
import { FAQItem } from "@/lib/services/seo-enricher";

interface RecipeFAQProps {
    questions: FAQItem[];
    recipeName: string;
}

export default function RecipeFAQ({ questions, recipeName }: RecipeFAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (!questions || questions.length === 0) {
        return null;
    }

    const toggleQuestion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="bg-muted py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {questions.map((item, index) => (
                            <div
                                key={index}
                                className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-medium"
                            >
                                <button
                                    onClick={() => toggleQuestion(index)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left group"
                                    aria-expanded={openIndex === index}
                                    aria-controls={`faq-answer-${index}`}
                                >
                                    <span className="font-semibold text-lg pr-4 group-hover:text-primary-600 transition-colors">
                                        {item.question}
                                    </span>
                                    <svg
                                        className={`w-6 h-6 text-primary-500 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>
                                <div
                                    id={`faq-answer-${index}`}
                                    className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-96" : "max-h-0"
                                        }`}
                                >
                                    <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                                        {item.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
