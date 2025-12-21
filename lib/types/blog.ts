/**
 * Blog post types and interfaces
 */
export const BLOG_CATEGORIES = [
    "Cooking Fundamentals",
    "Diet & Nutrition",
    "Cuisine Exploration",
    "Cooking Tips & Trends",
    "Budget-Friendly Eats",
    "Quick & Easy",
    "Seasonal Spotlight",
    "Kitchen Gear & Gadgets",
    "Entertaining & Hosting",
    "Ingredient Deep Dive",
] as const;

export type BlogCategory = typeof BLOG_CATEGORIES[number];

export interface BlogPost {
    slug: string;
    title: string;
    description: string; // Meta description for SEO
    category: BlogCategory;
    tags: string[];
    author: string;
    publishedDate: string; // ISO 8601 format
    updatedDate?: string; // ISO 8601 format
    readTime: number; // in minutes
    featuredImage: string; // Path to image
    excerpt: string; // Short summary for cards
    content: string; // Full markdown content
    relatedPosts?: string[]; // Array of slugs
}

export interface DBBlogPost {
    slug: string;
    title: string;
    description?: string;
    category: BlogCategory;
    tags: string[];
    author: string;
    published_date: string;
    updated_at?: string;
    read_time: number;
    featured_image: string;
    excerpt: string;
    content: string;
}

export interface BlogPostMetadata {
    slug: string;
    title: string;
    description: string;
    category: BlogCategory;
    tags: string[];
    readTime: number;
    featuredImage: string;
    excerpt: string;
    publishedDate: string;
}
