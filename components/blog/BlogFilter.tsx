"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BlogPostMetadata } from "@/lib/types/blog";
import BlogCard from "./BlogCard";

interface BlogFilterProps {
    posts: BlogPostMetadata[];
    categories: readonly string[];
    locale: string;
}

export default function BlogFilter({ posts, categories, locale }: BlogFilterProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const router = useRouter();

    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search')?.toLowerCase() || '';

    // Filter posts by selected category and search query
    const filteredPosts = posts.filter(post => {
        const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
        const matchesSearch = searchQuery
            ? post.title.toLowerCase().includes(searchQuery) ||
            post.excerpt.toLowerCase().includes(searchQuery) ||
            post.description.toLowerCase().includes(searchQuery)
            : true;
        return matchesCategory && matchesSearch;
    });

    // Sort by date (newest first)
    const sortedPosts = [...filteredPosts].sort(
        (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(selectedCategory === category ? null : category);
    };

    return (
        <>
            {/* Featured Categories */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all cursor-pointer ${selectedCategory === category
                            ? "bg-primary-600 text-white shadow-md transform scale-105"
                            : "bg-white dark:bg-card border border-border hover:border-primary-500 hover:text-primary-500 text-muted-foreground"
                            }`}
                    >
                        {category}
                    </button>
                ))}
                {selectedCategory && (
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="px-4 py-2 text-sm font-medium rounded-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-colors cursor-pointer"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Results info */}
            {selectedCategory && (
                <p className="text-center text-muted-foreground mb-8">
                    Showing {sortedPosts.length} post{sortedPosts.length !== 1 ? "s" : ""} in <span className="font-semibold text-foreground">{selectedCategory}</span>
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
                    <p className="text-muted-foreground">
                        {searchQuery
                            ? `No posts found matching "${searchQuery}"`
                            : "No posts found for this category."}
                    </p>
                    <button
                        onClick={() => {
                            setSelectedCategory(null);
                            if (searchQuery) {
                                router.push(`/${locale}/blog`);
                            }
                        }}
                        className="mt-4 text-primary-600 hover:underline"
                    >
                        View all posts
                    </button>
                </div>
            )}
        </>
    );
}
