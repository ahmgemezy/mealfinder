import { notFound } from "next/navigation";

// Generate static params for all locales - catch-all route requires this
export function generateStaticParams() {
  // Return all locales - unmatched rest segments will 404 dynamically
  return ["en", "fr", "es", "pt-br", "de", "ar"].map((locale) => ({
    locale,
    rest: [],
  }));
}

// This catch-all route handles all unmatched URLs within the [locale] route group
// and triggers our custom not-found.tsx page
export default function CatchAllPage() {
  notFound();
}
