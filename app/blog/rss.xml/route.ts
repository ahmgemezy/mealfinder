import { getAllPostsMetadata } from '@/lib/utils/blog-helpers';

export async function GET() {
    const posts = getAllPostsMetadata();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dishshuffle.com';

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Dish Shuffle Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Cooking tips, nutrition guides, and culinary inspiration</description>
    <language>en</language>
    <atom:link href="${baseUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/en/blog/${post.slug}</link>
      <guid>${baseUrl}/en/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedDate).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
      <category>${post.category}</category>
    </item>`).join('')}
  </channel>
</rss>`;

    return new Response(rss, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
    });
}
