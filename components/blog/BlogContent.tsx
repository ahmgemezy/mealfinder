"use client";

import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import Markdown from 'react-markdown';
import Link from 'next/link';


interface BlogContentProps {
    content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
    return (
        <article id="blog-content-body" className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-h1:text-2xl md:prose-h1:text-3xl prose-h2:text-xl md:prose-h2:text-2xl prose-h3:text-lg md:prose-h3:text-xl prose-a:text-primary-600 hover:prose-a:text-primary-700 prose-img:rounded-xl overflow-x-hidden">
            <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
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
                    // styled headings (ids are now handled by rehype-slug)
                    h2: ({ node, ...props }) => <h2 className="scroll-mt-24" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="scroll-mt-24" {...props} />
                }}
            >
                {content}
            </Markdown>
        </article>
    );
}
