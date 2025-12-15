"use client";

import remarkGfm from 'remark-gfm';
import Markdown from 'react-markdown';
import Link from 'next/link';


interface BlogContentProps {
    content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
    return (
        <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-h1:text-2xl md:prose-h1:text-3xl prose-h2:text-xl md:prose-h2:text-2xl prose-h3:text-lg md:prose-h3:text-xl prose-a:text-primary-600 hover:prose-a:text-primary-700 prose-img:rounded-xl">
            <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom link component to handle internal vs external links
                    a: ({ href, children }) => {
                        const isInternal = href?.startsWith('/') || href?.startsWith('#');

                        if (isInternal) {
                            return (
                                <Link href={href as string}>
                                    {children}
                                </Link>
                            );
                        }

                        return (
                            <a href={href} target="_blank" rel="noopener noreferrer">
                                {children}
                            </a>
                        );
                    },
                    // Add IDs to headings for table of contents (future proofing)
                    h2: ({ children }) => {
                        const id = children?.toString().toLowerCase().replace(/[^\w]+/g, '-');
                        return <h2 id={id} className="scroll-mt-24">{children}</h2>;
                    },
                    h3: ({ children }) => {
                        const id = children?.toString().toLowerCase().replace(/[^\w]+/g, '-');
                        return <h3 id={id} className="scroll-mt-24">{children}</h3>;
                    }
                }}
            >
                {content}
            </Markdown>
        </article>
    );
}
