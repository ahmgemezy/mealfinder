import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getRelatedPosts } from "@/lib/utils/blog-helpers";
import BlogContent from "@/components/blog/BlogContent";
import RelatedPosts from "@/components/blog/RelatedPosts";
import TableOfContents from "@/components/blog/TableOfContents";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ShareButtons from "@/components/blog/ShareButtons";

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

// Force dynamic rendering to avoid DYNAMIC_SERVER_USAGE error with getTranslations
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: `${post.title} | Dish Shuffle`,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            type: "article",
            publishedTime: post.publishedDate,
            modifiedTime: post.publishedDate, // or updatedDate if available
            authors: [post.author],
            section: post.category,
            tags: post.tags,
            images: [
                {
                    url: post.featuredImage,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.description,
            images: [post.featuredImage],
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const { locale } = await params; // Keeping locale for now as it is used in Links
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = getRelatedPosts(slug);
    const formattedDate = new Date(post.publishedDate).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // JSON-LD Structured Data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        image: [post.featuredImage], // In a real app, this should be a full URL
        datePublished: post.publishedDate,
        dateModified: post.publishedDate,
        author: [{
            "@type": "Person",
            name: post.author,
        }],
        description: post.description,
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
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="px-3 py-1 text-sm font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full">
                            {post.category}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground text-sm font-medium">
                            {post.readTime} min read
                        </span>
                    </div>

                    <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <span className="font-medium text-foreground">{post.author}</span>
                        <span>•</span>
                        <time dateTime={post.publishedDate}>{formattedDate}</time>
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            <div className="container mx-auto px-4 max-w-5xl -mt-8 mb-12 relative z-10">
                <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                    <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 1200px) 100vw, 1200px"
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 max-w-6xl">
                <div className="max-w-3xl mx-auto lg:mx-0">
                    <BlogContent content={post.content} />

                    {/* Tags */}
                    <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-2">
                        {post.tags.map(tag => (
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
                        <ShareButtons title={post.title} url={`https://dishshuffle.com/${locale}/blog/${post.slug}`} />
                    </div>
                </div>

                {/* Sidebar (Related Posts & TOC) */}
                <div className="hidden lg:block">
                    <div className="sticky top-24 space-y-8">
                        <TableOfContents />
                    </div>
                </div>
            </div>

            {/* Related Posts (Below content) */}
            <div className="container mx-auto px-4 mt-16 max-w-4xl pb-12">
                <h3 className="font-display font-bold text-2xl mb-6">Related Articles</h3>
                <RelatedPosts posts={relatedPosts} locale={locale} />
            </div>
        </article>
    );
}
