/**
 * Generate RSS feed at build time for static export
 */
const fs = require("fs");
const path = require("path");

// Import blog helpers (we'll need to read the MDX files directly)
const BLOG_DIR = path.join(process.cwd(), "lib/data/blog");
const PUBLIC_DIR = path.join(process.cwd(), "public");

function getAllPostsMetadata() {
  const posts = [];

  if (!fs.existsSync(BLOG_DIR)) {
    console.log("Blog directory not found, skipping RSS generation");
    return posts;
  }

  const files = fs.readdirSync(BLOG_DIR);

  for (const file of files) {
    if (!file.endsWith(".mdx")) continue;

    const filePath = path.join(BLOG_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");

    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) continue;

    const frontmatter = frontmatterMatch[1];
    const metadata = {};

    frontmatter.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length) {
        let value = valueParts.join(":").trim();
        // Remove quotes
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        metadata[key.trim()] = value;
      }
    });

    posts.push({
      slug: file.replace(".mdx", ""),
      title: metadata.title || "Untitled",
      excerpt: metadata.excerpt || "",
      publishedDate: metadata.publishedDate || new Date().toISOString(),
      category: metadata.category || "General",
      featuredImage: metadata.featuredImage || "",
    });
  }

  // Sort by date
  return posts.sort(
    (a, b) =>
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );
}

function generateRSS() {
  const posts = getAllPostsMetadata();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dishshuffle.com";

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Dish Shuffle Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Cooking tips, nutrition guides, and culinary inspiration</description>
    <language>en</language>
    <atom:link href="${baseUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/en/blog/${post.slug}</link>
      <guid>${baseUrl}/en/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedDate).toUTCString()}</pubDate>
      <description><![CDATA[${post.featuredImage ? `<img src="${post.featuredImage}" alt="${post.title}" />` : ""}${post.excerpt}]]></description>
      <category>${(post.category || "").replace(/&/g, "&amp;")}</category>
      ${post.featuredImage ? `<media:content url="${post.featuredImage.replace(/&/g, "&amp;")}" medium="image" />` : ""}
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  // Create blog directory in public if it doesn't exist
  const blogDir = path.join(PUBLIC_DIR, "blog");
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }

  fs.writeFileSync(path.join(blogDir, "rss.xml"), rss.trim());
  console.log("✅ Generated blog/rss.xml");
}

generateRSS();
