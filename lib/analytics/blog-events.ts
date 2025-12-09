// Extend Window interface for gtag
declare global {
    interface Window {
        gtag?: (
            command: string,
            action: string,
            params?: Record<string, string | number | boolean>
        ) => void;
    }
}

export const trackBlogView = (slug: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'blog_view', {
            event_category: 'Blog',
            event_label: slug,
            page_location: window.location.href,
        });
    }
};

export const trackBlogShare = (slug: string, platform: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'blog_share', {
            event_category: 'Blog',
            event_label: slug,
            method: platform,
        });
    }
};

export const trackBlogReadingTime = (slug: string, timeInSeconds: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'blog_reading_time', {
            event_category: 'Blog',
            event_label: slug,
            value: timeInSeconds,
        });
    }
};
