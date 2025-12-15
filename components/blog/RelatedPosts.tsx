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
          className="group flex flex-col h-full bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div className="relative w-full aspect-16/10 overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="p-5 flex flex-col grow">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100/50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50">
                {post.category}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                {post.readTime} min read
              </span>
            </div>
            <h4 className="font-display font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h4>
            {/* Optionally add description if available in prop type, but currently not used. */}
            <div className="mt-auto pt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              Read Article <span className="ml-1">→</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
