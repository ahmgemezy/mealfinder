import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getRelatedPosts, getAllPosts } from "@/lib/utils/blog-helpers";
import BlogContent from "@/components/blog/BlogContent";
import RelatedPosts from "@/components/blog/RelatedPosts";

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
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

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPostPage({ params }: Props) {
    const { locale, slug } = await params;
    const post = getPostBySlug(slug);
    const t = await getTranslations({ locale, namespace: "Blog" });

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
        <article className="min-h-screen pb-20">
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

                    {/* Social Share (Placeholder for now) */}
                    <div className="mt-8 flex items-center gap-4">
                        <span className="font-semibold">Share this post:</span>
                        <div className="flex gap-2">
                            {/* Add actual share buttons here if needed */}
                            <button className="p-2 bg-muted rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </button>
                            <button className="p-2 bg-muted rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 2.848-6.326 6.16-6.326 1.587 0 3.23.119 4.757.418v4.275l-2.614.004c-1.93.001-2.52.92-2.52 2.222v1.036h5.364l-.946 3.667h-4.418v7.98H9.101z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Related Posts) */}
                <div className="hidden lg:block">
                    <div className="sticky top-24">
                        <h3 className="font-display font-bold text-xl mb-6">Related Articles</h3>
                        <div className="grid gap-6">
                            {relatedPosts.map(post => (
                                <Link key={post.slug} href={`/${locale}/blog/${post.slug}`} className="group block">
                                    <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                                        <Image
                                            src={post.featuredImage}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <h4 className="font-bold group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
                                        {post.title}
                                    </h4>
                                    <div className="text-xs text-muted-foreground">{post.readTime} min read</div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Related Posts (Below content) */}
            <div className="lg:hidden container mx-auto px-4 mt-16 max-w-4xl">
                <h3 className="font-display font-bold text-2xl mb-6">Related Articles</h3>
                <RelatedPosts posts={relatedPosts} locale={locale} />
            </div>
        </article>
    );
}
