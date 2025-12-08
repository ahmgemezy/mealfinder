"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Recipe } from "@/lib/types/recipe";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import AuthModal from "@/components/features/AuthModal";
import { useToast } from "@/lib/contexts/ToastContext";

interface FavoritesContextType {
    favorites: Recipe[];
    addFavorite: (recipe: Recipe) => void;
    removeFavorite: (recipeId: string) => void;
    isFavorite: (recipeId: string) => boolean;
    toggleFavorite: (recipe: Recipe) => void;
    isLoading: boolean;
    openAuthModal: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<Recipe[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { addToast } = useToast();

    // Get current user and listen for auth changes
    useEffect(() => {
        // Get initial user
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error("Error getting session:", error);
                // If the refresh token is invalid, sign out to clear the stale session
                if (error.message.includes("Refresh Token")) {
                    supabase.auth.signOut();
                }
            }
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load favorites from Supabase whenever user changes
    useEffect(() => {
        const loadFavorites = async () => {
            if (!user) {
                setFavorites([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from("favorites")
                    .select("*")
                    .eq("user_id", user.id);

                if (error) throw error;

                // Transform favorites data to Recipe format with full data
                const recipesFromFavorites: Recipe[] = await Promise.all(
                    (data || []).map(async (fav) => {
                        // Try to fetch full recipe data from recipes table
                        const { data: fullRecipe } = await supabase
                            .from("recipes")
                            .select("data")
                            .eq("id", fav.recipe_id)
                            .single();

                        if (fullRecipe?.data) {
                            // Use full recipe data if available
                            return fullRecipe.data as Recipe;
                        }

                        // Fall back to basic data from favorites table
                        return {
                            id: fav.recipe_id,
                            name: fav.recipe_name,
                            thumbnail: fav.recipe_thumbnail || "",
                            category: fav.recipe_category || "",
                            area: fav.recipe_area || "",
                            instructions: "",
                            tags: [],
                            ingredients: [],
                        };
                    })
                );

                setFavorites(recipesFromFavorites);
            } catch (error) {
                console.error("Error loading favorites:", error);
                setFavorites([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadFavorites();
    }, [user]);

    const addFavorite = async (recipe: Recipe) => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        // Check if already favorited
        if (favorites.some((fav) => fav.id === recipe.id)) {
            addToast(`${recipe.name} is already in your favorites`, "info");
            return;
        }

        // Optimistically update UI
        setFavorites((prev) => [...prev, recipe]);

        try {
            const { error } = await supabase.from("favorites").insert({
                user_id: user.id,
                recipe_id: recipe.id,
                recipe_name: recipe.name,
                recipe_thumbnail: recipe.thumbnail,
                recipe_category: recipe.category,
                recipe_area: recipe.area,
            });

            if (error) throw error;
            addToast(`${recipe.name} added to favorites!`, "success");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error adding favorite:", error);
            // Revert optimistic update on error
            setFavorites((prev) => prev.filter((fav) => fav.id !== recipe.id));

            if (error.code === "23505") {
                // Duplicate key error - already favorited
                addToast(`${recipe.name} is already in your favorites`, "info");
                return;
            }
            addToast("Failed to add favorite. Please try again.", "error");
        }
    };

    const removeFavorite = async (recipeId: string) => {
        if (!user) return;

        // Get recipe name for toast message
        const recipe = favorites.find((fav) => fav.id === recipeId);
        const recipeName = recipe?.name || "Recipe";

        // Optimistically update UI
        const previousFavorites = favorites;
        setFavorites((prev) => prev.filter((fav) => fav.id !== recipeId));

        try {
            const { error } = await supabase
                .from("favorites")
                .delete()
                .eq("user_id", user.id)
                .eq("recipe_id", recipeId);

            if (error) throw error;
            addToast(`${recipeName} removed from favorites`, "success");
        } catch (error) {
            console.error("Error removing favorite:", error);
            // Revert optimistic update on error
            setFavorites(previousFavorites);
            addToast("Failed to remove favorite. Please try again.", "error");
        }
    };

    const isFavorite = (recipeId: string) => {
        return favorites.some((fav) => fav.id === recipeId);
    };

    const toggleFavorite = (recipe: Recipe) => {
        if (isFavorite(recipe.id)) {
            removeFavorite(recipe.id);
        } else {
            addFavorite(recipe);
        }
    };

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                addFavorite,
                removeFavorite,
                isFavorite,
                toggleFavorite,
                isLoading,
                openAuthModal: () => setIsAuthModalOpen(true)
            }}
        >
            {children}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
}
