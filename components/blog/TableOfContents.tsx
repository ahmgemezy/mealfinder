"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents() {
    const t = useTranslations('Blog');
    const [headings, setHeadings] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        // Use a timeout to schedule state update for next render
        const timer = setTimeout(() => {
            const contentContainer = document.getElementById('blog-content-body');
            const root = contentContainer || document;

            const elements = Array.from(root.querySelectorAll('h2, h3'))
                .filter(elem => !elem.hasAttribute('data-toc-ignore'))
                .map((elem) => ({
                    id: elem.id,
                    text: elem.textContent || '',
                    level: parseInt(elem.tagName.substring(1)),
                }))
                .filter(item => !['Related Articles', 'Quick Links', 'Legal'].includes(item.text.trim()));

            setHeadings(elements);

            // Track which heading is in view
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setActiveId(entry.target.id);
                        }
                    });
                },
                { rootMargin: '-100px 0px -80% 0px' }
            );

            elements.forEach(({ id }) => {
                const elem = document.getElementById(id);
                if (elem) observer.observe(elem);
            });
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    if (headings.length === 0) return null;

    return (
        <nav className="p-6 bg-card rounded-xl border border-border">
            <h4 className="font-bold mb-4">{t('tableOfContents')}</h4>
            <ul className="space-y-2 text-sm">
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
                    >
                        <Link
                            href={`#${heading.id}`}
                            className={`hover:text-primary-600 transition-colors ${activeId === heading.id ? 'text-primary-600 font-semibold' : 'text-muted-foreground'
                                }`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            {heading.text}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
