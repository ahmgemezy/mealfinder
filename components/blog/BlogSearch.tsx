"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface BlogSearchProps {
  locale: string;
}

export default function BlogSearch({ locale }: BlogSearchProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") || "";
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  useEffect(() => {
    const val = searchParams.get("search") || "";
    // This effect synchronizes the local `query` state with URL search params.
    // It's safe to set state here because it only runs when `searchParams`
    // changes (i.e., navigation) and uses a functional update to avoid
    // unnecessary re-renders. Disable the lint rule for this intentional
    // synchronous update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery((prev) => (prev === val ? prev : val));
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/blog?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search blog posts..."
          className="w-full px-6 py-4 pr-14 rounded-full border-2 border-border focus:border-primary-500 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
          aria-label="Search"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
