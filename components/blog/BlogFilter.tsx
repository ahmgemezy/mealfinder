"use client";

import { useState } from "react";
import { BlogPostMetadata } from "@/lib/types/blog";
import BlogCard from "./BlogCard";

interface BlogFilterProps {
    posts: BlogPostMetadata[];
    tags: string[];
    locale: string;
}

export default function BlogFilter({ posts, tags, locale }: BlogFilterProps) {
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Filter posts by selected tag
    const filteredPosts = selectedTag
        ? posts.filter(post => post.tags.includes(selectedTag))
        : posts;

    // Sort by date (newest first)
    const sortedPosts = [...filteredPosts].sort(
        (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );

    const handleTagClick = (tag: string) => {
        setSelectedTag(selectedTag === tag ? null : tag);
    };

    return (
        <>
            {/* Featured Tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
                {tags.slice(0, 12).map(tag => (
                    <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors cursor-pointer ${selectedTag === tag
                                ? "bg-primary-600 text-white"
                                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        #{tag}
                    </button>
                ))}
                {selectedTag && (
                    <button
                        onClick={() => setSelectedTag(null)}
                        className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors cursor-pointer"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Results info */}
            {selectedTag && (
                <p className="text-center text-muted-foreground mb-8">
                    Showing {sortedPosts.length} post{sortedPosts.length !== 1 ? "s" : ""} tagged with <span className="font-semibold text-foreground">#{selectedTag}</span>
                </p>
            )}

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedPosts.map((post) => (
                    <BlogCard
                        key={post.slug}
                        post={post}
                        locale={locale}
                    />
                ))}
            </div>

            {/* No results message */}
            {sortedPosts.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No posts found for this tag.</p>
                    <button
                        onClick={() => setSelectedTag(null)}
                        className="mt-4 text-primary-600 hover:underline"
                    >
                        View all posts
                    </button>
                </div>
            )}
        </>
    );
}
