import { BlogPost } from "@/lib/types/blog";
import { fundamentalsPosts } from "./blog/fundamentals";
import { nutritionPosts } from "./blog/nutrition";
import { cuisinePosts } from "./blog/cuisine";
import { tipsPosts } from "./blog/tips";

/**
 * All blog posts aggregated
 * Sorted by date (newest first) by default
 */
export const blogPosts: BlogPost[] = [
    ...fundamentalsPosts,
    ...nutritionPosts,
    ...cuisinePosts,
    ...tipsPosts
].sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
