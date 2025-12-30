
import { blogPosts } from '../lib/data/blog-posts';

console.log("Debug Script Started");
console.log(`Total Posts: ${blogPosts.length}`);

blogPosts.forEach(post => {
    if (!post.authorImage) {
        console.log(`MISSING IMAGE for: ${post.title}`);
    } else {
        console.log(`OK: ${post.author} -> ${post.authorImage}`);
    }
});
