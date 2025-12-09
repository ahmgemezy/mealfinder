import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAllPostsMetadata, getAllTags } from "@/lib/utils/blog-helpers";
import BlogFilter from "@/components/blog/BlogFilter";
import BlogSearch from "@/components/blog/BlogSearch";

export const dynamic = 'force-dynamic';

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
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Blog" });
    const posts = getAllPostsMetadata();
    const tags = getAllTags();

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

            {/* Blog Filter and Grid */}
            <BlogSearch locale={locale} />
            <BlogFilter posts={posts} tags={tags} locale={locale} />
        </div>
    );
}
