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
        author: post.author,
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
 * Get related posts based on tags (for Recipe pages)
 * Returns posts that share the most tags with the input list
 */
export function getRelatedPostsByTags(tags: string[], limit: number = 3): BlogPost[] {
    if (!tags || tags.length === 0) return [];

    const normalizedTags = tags.map(t => t.toLowerCase());

    const scoredPosts = blogPosts
        .map(post => {
            let score = 0;
            const postTags = post.tags.map(t => t.toLowerCase());

            // Count overlapping tags
            const matches = postTags.filter(tag =>
                normalizedTags.some(inputTag => inputTag.includes(tag) || tag.includes(inputTag))
            );

            // Also check if category matches any tag
            if (normalizedTags.some(t => t === post.category.toLowerCase())) {
                matches.push(post.category);
            }

            score = matches.length;
            return { post, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.post);

    // If we don't have enough matches, fill with recent posts
    if (scoredPosts.length < limit) {
        const existingIds = new Set(scoredPosts.map(p => p.slug));
        const fillerPosts = blogPosts
            .filter(p => !existingIds.has(p.slug))
            .slice(0, limit - scoredPosts.length);

        return [...scoredPosts, ...fillerPosts];
    }

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
