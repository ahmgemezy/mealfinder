"use client";

import Link from "next/link";
import Image from "next/image";
import { BlogPostMetadata } from "@/lib/types/blog";
// The `cn` utility was not used in the original code, so it's removed.
// The `useTranslations` import was not used in the original code, so it's removed.

interface BlogCardProps {
    post: BlogPostMetadata;
    className?: string;
    locale: string;
}

export default function BlogCard({ post, className, locale }: BlogCardProps) { // Removed 'async' keyword as it's not used

    // Format date based on locale
    const formattedDate = new Date(post.publishedDate).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <article className={`group flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className || ''}`}>
            <Link href={`/${locale}/blog/${post.slug}`} className="block relative aspect-video overflow-hidden">
                <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-xs font-semibold bg-primary-600 text-white rounded-full shadow-md">
                        {post.category}
                    </span>
                </div>
            </Link>

            <div className="flex flex-col flex-grow p-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <time dateTime={post.publishedDate} className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formattedDate}
                    </time>
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {post.readTime} min read
                    </span>
                </div>

                <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    <Link href={`/${locale}/blog/${post.slug}`}>
                        {post.title}
                    </Link>
                </h3>

                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
                    {post.excerpt}
                </p>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                    <Link
                        href={`/${locale}/blog/${post.slug}`}
                        className="text-sm font-semibold text-primary-600 flex items-center gap-1 hover:gap-2 transition-all"
                    >
                        Read Post
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </article>
    );
}
