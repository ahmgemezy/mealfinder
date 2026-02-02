import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dishshuffle.com";

    return {
        rules: [
            {
                userAgent: [
                    "GPTBot",
                    "ChatGPT-User",
                    "Google-Extended",
                    "Bytespider",
                    "CCBot",
                    "ClaudeBot",
                    "AnthropicAI",
                    "FacebookBot",
                    "Diffbot"
                ],
                disallow: "/",
            },
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
