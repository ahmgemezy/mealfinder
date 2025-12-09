/**
 * Blog helper utilities
 */

import { BlogPost, BlogPostMetadata, BlogCategory } from "@/lib/types/blog";
import { blogPosts } from "@/lib/data/blog-posts";

/**
 * Get all blog posts
 */
export function getAllPosts(): BlogPost[] {
    return blogPosts;
}

/**
 * Get all blog post metadata (for listing page)
 */
export function getAllPostsMetadata(): BlogPostMetadata[] {
    return blogPosts.map(post => ({
        slug: post.slug,
        title: post.title,
        description: post.description,
        category: post.category,
        tags: post.tags,
        readTime: post.readTime,
        featuredImage: post.featuredImage,
        excerpt: post.excerpt,
        publishedDate: post.publishedDate,
    }));
}

/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
    return blogPosts.find(post => post.slug === slug);
}

/**
 * Get posts by category
 */
export function getPostsByCategory(category: BlogCategory): BlogPost[] {
    return blogPosts.filter(post => post.category === category);
}

/**
 * Get related posts based on category and tags
 */
export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
    const currentPost = getPostBySlug(currentSlug);
    if (!currentPost) return [];

    // Score posts based on shared category and tags
    const scoredPosts = blogPosts
        .filter(post => post.slug !== currentSlug)
        .map(post => {
            let score = 0;

            // Same category gets higher score
            if (post.category === currentPost.category) {
                score += 10;
            }

            // Shared tags
            const sharedTags = post.tags.filter(tag =>
                currentPost.tags.includes(tag)
            );
            score += sharedTags.length * 2;

            return { post, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.post);

    return scoredPosts;
}

/**
 * Calculate read time based on word count
 * Average reading speed: 200 words per minute
 */
export function calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return readTime;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string, locale: string = 'en'): string {
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    return date.toLocaleDateString(locale, options);
}

/**
 * Get all unique tags from all posts
 */
export function getAllTags(): string[] {
    const tagsSet = new Set<string>();
    blogPosts.forEach(post => {
        post.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
}

/**
 * Search posts by query (searches title, excerpt, tags)
 */
export function searchPosts(query: string): BlogPost[] {
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) return blogPosts;

    return blogPosts.filter(post => {
        return (
            post.title.toLowerCase().includes(lowerQuery) ||
            post.excerpt.toLowerCase().includes(lowerQuery) ||
            post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    });
}
