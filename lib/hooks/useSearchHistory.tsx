"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "meal_finder_search_history";
const MAX_HISTORY_ITEMS = 10;

/**
 * Hook for managing search history in localStorage
 */
export function useSearchHistory() {
    const [history, setHistory] = useState<string[]>([]);

    // Load history from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setHistory(parsed.slice(0, MAX_HISTORY_ITEMS));
                }
            }
        } catch (error) {
            console.error("Failed to load search history:", error);
        }
    }, []);

    // Add a search query to history
    const addToHistory = useCallback((query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;

        setHistory((prev) => {
            // Remove duplicate if exists
            const filtered = prev.filter((item) => item !== trimmed);

            // Add to beginning and limit to MAX_HISTORY_ITEMS
            const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);

            // Save to localStorage
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (error) {
                console.error("Failed to save search history:", error);
            }

            return updated;
        });
    }, []);

    // Clear all search history
    const clearHistory = useCallback(() => {
        setHistory([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error("Failed to clear search history:", error);
        }
    }, []);

    return {
        history,
        addToHistory,
        clearHistory,
    };
}
