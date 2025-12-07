import { notFound } from 'next/navigation';

// This catch-all route handles all unmatched URLs within the [locale] route group
// and triggers our custom not-found.tsx page
export default function CatchAllPage() {
    notFound();
}
