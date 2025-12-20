import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BLOG_CATEGORIES } from "@/lib/types/blog";
import BlogFilter from "@/components/blog/BlogFilter";
import BlogSearch from "@/components/blog/BlogSearch";
import { supabase } from "@/lib/supabase";
import { translateBlogPosts } from "@/lib/services/translation";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });

  return {
    title: t("title") || "Blog - Dish Shuffle",
    description:
      t("subtitle") ||
      "Cooking tips, nutrition guides, and culinary inspiration.",
    openGraph: {
      title: t("title") || "Blog - Dish Shuffle",
      description:
        t("subtitle") ||
        "Cooking tips, nutrition guides, and culinary inspiration.",
      url: `https://dishshuffle.com/${locale}/blog`,
      type: "website",
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });

  // Fetch posts from Supabase
  const { data: dbPosts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('published_date', { ascending: false });

  if (error) {
    console.error("Error fetching blog posts:", error);
  }

  // Translate posts if not English
  const translatedDbPosts = (locale !== 'en' && dbPosts)
    // @ts-ignore - Supabase types mismatch with our strict BlogPost interface but structure is compatible
    ? await translateBlogPosts(dbPosts as any[], locale)
    : dbPosts;

  // Map DB result to BlogPostMetadata
  const posts = (translatedDbPosts || []).map(post => ({
    slug: post.slug,
    title: post.title,
    description: post.excerpt, // map excerpt to description for metadata
    category: post.category,
    tags: post.tags || [],
    readTime: post.read_time,
    featuredImage: post.featured_image,
    excerpt: post.excerpt,
    publishedDate: post.published_date,
  }));

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          {t("title") || "Dish Shuffle Blog"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("subtitle") ||
            "Discover cooking tips, nutrition advice, and culinary inspiration from our experts."}
        </p>
      </div>

      {/* Blog Filter and Grid */}
      <BlogSearch locale={locale} />
      <BlogFilter posts={posts} categories={BLOG_CATEGORIES} locale={locale} />
    </div>
  );
}
