import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAllPostsMetadata, getAllTags } from "@/lib/utils/blog-helpers";
import BlogCard from "@/components/blog/BlogCard";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Blog" });

    return {
        title: t("title") || "Blog - Dish Shuffle",
        description: t("subtitle") || "Cooking tips, nutrition guides, and culinary inspiration.",
        openGraph: {
            title: t("title") || "Blog - Dish Shuffle",
            description: t("subtitle") || "Cooking tips, nutrition guides, and culinary inspiration.",
            url: `https://dishshuffle.com/${locale}/blog`,
            type: "website",
        },
    };
}

export default async function BlogPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams; // Await searchParams as required by Next.js 15+

    const t = await getTranslations({ locale, namespace: "Blog" });
    const posts = getAllPostsMetadata();
    const tags = getAllTags();

    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort((a, b) =>
        new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );

    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
            {/* Header */}
            <div className="text-center mb-16">
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    {t("title") || "Dish Shuffle Blog"}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t("subtitle") || "Discover cooking tips, nutrition advice, and culinary inspiration from our experts."}
                </p>
            </div>

            {/* Featured Tags (Optional filtering could go here) */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
                {tags.slice(0, 8).map(tag => (
                    <span
                        key={tag}
                        className="px-3 py-1 bg-muted/50 hover:bg-muted text-sm text-muted-foreground hover:text-foreground rounded-full transition-colors cursor-default"
                    >
                        #{tag}
                    </span>
                ))}
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedPosts.map((post) => (
                    <BlogCard
                        key={post.slug}
                        post={post}
                        locale={locale}
                    />
                ))}
            </div>
        </div>
    );
}
