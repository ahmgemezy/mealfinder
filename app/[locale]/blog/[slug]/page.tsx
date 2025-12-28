import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import BlogContent from "@/components/blog/BlogContent";
import RelatedPosts from "@/components/blog/RelatedPosts";
import TableOfContents from "@/components/blog/TableOfContents";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ShareButtons from "@/components/blog/ShareButtons";
import { getRandomMealWithFilters, getMultipleRandomMeals } from "@/lib/api";
import TryThisRecipe from "@/components/blog/TryThisRecipe";
import { supabase } from "@/lib/supabase";
import { translateBlogPostFull, translateBlogPosts } from "@/lib/services/translation";
import { DBBlogPost } from "@/lib/types/blog";



type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

// Force dynamic rendering to avoid DYNAMIC_SERVER_USAGE error with getTranslations
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    // Fetch post from Supabase
    const { data: post } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: "article",
            publishedTime: post.published_date,
            modifiedTime: post.updated_at,
            authors: [post.author],
            section: post.category,
            tags: post.tags,
            images: [
                {
                    url: post.featured_image,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
            images: [post.featured_image],
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const { locale } = await params; // Keeping locale for now as it is used in Links
    const t = await getTranslations('Blog');

    // Fetch post from Supabase
    const { data: post } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!post) {
        notFound();
    }

    // Translate content if not English
    // Translate content if not English
    const translatedPost = (locale !== 'en' && post)
        ? await translateBlogPostFull(post as unknown as DBBlogPost, locale)
        : (post as unknown as DBBlogPost);

    // Fetch Related Posts from Supabase (same category, exclude current)
    const { data: relatedPostsData } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category', post.category)
        .neq('slug', slug)
        .limit(3);

    // Map DB posts to component format
    // Map DB posts to component format
    // Map DB posts to component format
    const relatedPostsTranslated = (locale !== 'en' && relatedPostsData)
        ? await translateBlogPosts(relatedPostsData as unknown as DBBlogPost[], locale)
        : (relatedPostsData as unknown as DBBlogPost[]);

    const relatedPosts = (relatedPostsTranslated || []).map(p => ({
        slug: p.slug,
        title: p.title,
        description: p.excerpt,
        category: p.category,
        tags: p.tags || [],
        readTime: p.read_time,
        featuredImage: p.featured_image,
        excerpt: p.excerpt,
        publishedDate: p.published_date
    }));

    const formattedDate = new Date(translatedPost.published_date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Try to find a relevant recipe based on post tags
    let suggestedRecipe = null;

    // 1. Try first tag
    if (post.tags && post.tags[0]) {
        suggestedRecipe = await getRandomMealWithFilters({ search: post.tags[0] });
    }

    // 2. Try category if no tag match
    if (!suggestedRecipe && post.category) {
        suggestedRecipe = await getRandomMealWithFilters({ category: post.category });
    }

    // 3. Robust Fallback: Use getMultipleRandomMeals which checks local DB first
    if (!suggestedRecipe) {
        // getMultipleRandomMeals is more reliable than getRandomMeal because it prioritizes 
        // high-quality recipes from our Supabase database before hitting external APIs.
        const randomMeals = await getMultipleRandomMeals(1);
        if (randomMeals.length > 0) {
            suggestedRecipe = randomMeals[0];
        }
    }

    // JSON-LD Structured Data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        image: [post.featured_image], // In a real app, this should be a full URL
        datePublished: post.published_date,
        dateModified: post.updated_at,
        author: [{
            "@type": "Person",
            name: post.author,
        }],
        description: post.excerpt,
        articleBody: post.content, // Strip markdown or use description for brevity? Full body is fine for schema.
    };

    return (
        <article className="min-h-screen pb-20 relative">
            <ReadingProgress />
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Header */}
            <div className="bg-muted/30 border-b border-border/50 pt-12 pb-16 md:pt-20 md:pb-24">
                <div className="w-full px-5 mx-auto md:w-auto md:container md:px-4 max-w-4xl text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="px-3 py-1 text-sm font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full">
                            {translatedPost.category}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground text-sm font-medium">
                            {translatedPost.read_time} min read
                        </span>
                    </div>

                    <h1 className="font-display text-xl md:text-3xl lg:text-4xl font-bold mb-6 text-foreground leading-tight">
                        {translatedPost.title}
                    </h1>

                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <span className="font-medium text-foreground">{translatedPost.author}</span>
                        <span>•</span>
                        <time dateTime={translatedPost.published_date}>{formattedDate}</time>
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            <div className="w-full px-5 mx-auto md:w-auto md:container md:px-4 max-w-5xl -mt-8 mb-12 relative z-10">
                <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                    <Image
                        src={translatedPost.featured_image}
                        alt={translatedPost.title}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 1200px) 100vw, 1200px"
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full px-5 mx-auto md:w-auto md:container md:px-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 max-w-6xl">
                <div className="max-w-3xl mx-auto lg:mx-0 min-w-0">
                    <BlogContent content={translatedPost.content} />

                    {/* Tags */}
                    <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-2">
                        {translatedPost.tags.map((tag: string) => (
                            <Link
                                key={tag}
                                href={`/${locale}/blog?tag=${tag}`} // Assuming we might add filtering later
                                className="px-3 py-1 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
                            >
                                #{tag}
                            </Link>
                        ))}
                    </div>


                    {/* Social Share */}
                    <div className="mt-8">
                        <ShareButtons
                            title={translatedPost.title}
                            url={`https://dishshuffle.com/${locale}/blog/${translatedPost.slug}`}
                            excerpt={translatedPost.excerpt}
                            tags={translatedPost.tags}
                        />
                    </div>

                    {/* Mobile Recipe Suggestion */}
                    <div className="mt-12 lg:hidden">
                        {suggestedRecipe && <TryThisRecipe recipe={suggestedRecipe} />}
                    </div>
                </div>

                {/* Sidebar (Related Posts & TOC) */}
                <div className="hidden lg:block">
                    <div className="sticky top-24 space-y-8">
                        <TableOfContents />
                        {suggestedRecipe && <TryThisRecipe recipe={suggestedRecipe} />}
                    </div>
                </div>
            </div>

            {/* Related Posts (Below content) */}
            <div className="w-[80vw] mx-auto px-4 mt-16 pb-8">
                <h3 className="font-display font-bold text-2xl mb-6">{t('relatedArticles')}</h3>
                <RelatedPosts posts={relatedPosts} locale={locale} />
            </div>
        </article>
    );
}
