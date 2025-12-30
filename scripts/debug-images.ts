
const { blogPosts } = require('./lib/data/blog-posts');
// We need to handle the imports in CommonJS since the project is seemingly TS/ESM.
// Alternatively, we can just cat the files or use a simpler grep check first. 
// Let's try running a tsx script which handles the imports.

console.log("Checking author images...");
blogPosts.forEach(post => {
    console.log(`Title: ${post.title.substring(0, 20)}... | Author: ${post.author} | Image: [${post.authorImage}]`);
});
