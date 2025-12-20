import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/types/blog";
import { useLocale, useTranslations } from "next-intl";

interface RelatedArticlesProps {
  posts: BlogPost[];
}

export default function RelatedArticles({ posts }: RelatedArticlesProps) {
  const locale = useLocale();
  const t = useTranslations("Blog");

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="bg-linear-to-br from-background to-muted py-16 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold mb-2 notranslate text-start h2">
              {t("exploreMore")}
            </h2>
            <p className="text-muted-foreground text-start">
              {t("exploreSubtitle")}
            </p>
          </div>
          <Link
            href={`/${locale}/blog`}
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 group"
          >
            {t("viewAll")}
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/${locale}/blog/${post.slug}`}
              className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary-500/50 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              {/* Image Container */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-medium">
                  {post.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="text-xs text-muted-foreground mb-3 font-medium flex items-center gap-2">
                  <span>
                    {new Date(post.publishedDate).toLocaleDateString(locale, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>•</span>
                  <span>{post.readTime} {t("minRead")}</span>
                </div>
                <h3 className="font-display text-xl font-bold mb-3 group-hover:text-primary-600 transition-colors line-clamp-2 text-start">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1 text-start">
                  {post.excerpt}
                </p>
                <span className="text-primary-600 font-medium text-sm flex items-center gap-1 mt-auto group/btn">
                  {t("readPost")}
                  <svg
                    className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
