import { notFound } from "next/navigation";

// Generate empty static params - this catch-all handles 404s dynamically
// but we need this function for static export compatibility
export function generateStaticParams() {
  // Return empty array - all unmatched routes will 404
  return [];
}

// This catch-all route handles all unmatched URLs within the [locale] route group
// and triggers our custom not-found.tsx page
export default function CatchAllPage() {
  notFound();
}
