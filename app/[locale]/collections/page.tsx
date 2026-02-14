import { Metadata } from 'next';
import { Link } from '@/navigation'; // Use localized Link
import { COLLECTIONS_CONFIG } from '@/lib/collections';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { getTranslations } from 'next-intl/server';

// Static page, revalidate daily
export const dynamic = 'force-static';
export const revalidate = 86400;

interface CollectionsIndexProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CollectionsIndexProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'CollectionsPage' });

    return {
        title: `${t('title')} | Dish Shuffle`,
        description: t('subtitle'),
        alternates: {
            canonical: `https://dishshuffle.com/${locale}/collections`,
        }
    };
}

export default async function CollectionsIndexPage({ params }: CollectionsIndexProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'CollectionsPage' });
    const navT = await getTranslations({ locale, namespace: 'Navigation' });

    return (
        <div className="container mx-auto px-4 pt-8 pb-16">
            <Breadcrumb
                items={[
                    { label: navT('home'), href: '/' },
                    { label: navT('collections') },
                ]}
            />

            <div className="py-12 text-center max-w-3xl mx-auto">
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-foreground">
                    {t('title')}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    {t('subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {COLLECTIONS_CONFIG.map((collection) => (
                    <Link
                        key={collection.slug}
                        href={`/collections/${collection.slug}`}
                        className="group block h-full"
                    >
                        <div className="bg-card rounded-3xl p-8 shadow-soft border border-border/50 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-800">
                            {/* Icon/Emoji Placeholder based on collection type */}
                            <div className="mb-6 w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                                {collection.filters?.category === 'Vegetarian' ? '🥗' :
                                    collection.filters?.category === 'Chicken' ? '🍗' :
                                        collection.filters?.category === 'Dessert' ? '🍰' :
                                            collection.filters?.category === 'Seafood' ? '🦐' :
                                                collection.filters?.category === 'Breakfast' ? '🍳' :
                                                    collection.filters?.area === 'Italian' ? '🍝' :
                                                        collection.filters?.area === 'Mexican' ? '🌮' :
                                                            collection.filters?.area === 'Chinese' ? '🥢' :
                                                                collection.searchQuery?.includes('gluten') ? '🌾' :
                                                                    '🍽️'}
                            </div>

                            <h2 className="font-display text-2xl font-bold mb-3 group-hover:text-primary-600 transition-colors">
                                {t(`collections.${collection.slug}.title`)}
                            </h2>

                            <p className="text-muted-foreground leading-relaxed">
                                {t(`collections.${collection.slug}.description`)}
                            </p>

                            <div className="mt-6 font-medium text-primary-500 flex items-center gap-2">
                                {t('browseCollection')}
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
