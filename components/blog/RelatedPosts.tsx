"use client";

import { BlogPost } from "@/lib/types/blog";
import Link from "next/link";
import Image from "next/image";

interface RelatedPostsProps {
    posts: BlogPost[];
    locale: string;
}

export default function RelatedPosts({ posts, locale }: RelatedPostsProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
                <Link
                    key={post.slug}
                    href={`/${locale}/blog/${post.slug}`}
                    className="group flex gap-4 md:block hover:bg-muted/50 p-3 rounded-xl transition-colors"
                >
                    <div className="relative w-24 h-24 md:w-full md:aspect-video rounded-lg overflow-hidden flex-shrink-0 md:mb-3">
                        <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 96px, 100vw"
                        />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-primary-600 mb-1 block">
                            {post.category}
                        </span>
                        <h4 className="font-bold text-sm md:text-base line-clamp-2 md:line-clamp-2 group-hover:text-primary-700 transition-colors">
                            {post.title}
                        </h4>
                        <div className="text-xs text-muted-foreground mt-1">
                            {post.readTime} min read
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
