"use client";

import { useState, useEffect } from 'react';
import { Recipe } from '@/lib/types/recipe';
import { searchRecipeVideo, extractYouTubeVideoId } from '@/lib/api/youtube';
import { useTranslations } from 'next-intl';

interface RecipeVideoProps {
    recipe: Recipe;
}

export default function RecipeVideo({ recipe }: RecipeVideoProps) {
    const t = useTranslations('Recipe');
    const [videoId, setVideoId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchAttempted, setSearchAttempted] = useState(false);

    useEffect(() => {
        async function loadVideo() {
            // First, check if recipe already has a YouTube video
            if (recipe.youtube) {
                const existingVideoId = extractYouTubeVideoId(recipe.youtube);
                if (existingVideoId) {
                    setVideoId(existingVideoId);
                    setSearchAttempted(true);
                    return;
                }
            }

            // If no video exists, search for one
            if (!searchAttempted) {
                setIsLoading(true);
                try {
                    const foundVideoId = await searchRecipeVideo(recipe.name);
                    setVideoId(foundVideoId);
                } catch (error) {
                    console.error('Error loading recipe video:', error);
                    setVideoId(null);
                } finally {
                    setIsLoading(false);
                    setSearchAttempted(true);
                }
            }
        }

        loadVideo();
    }, [recipe.youtube, recipe.name, searchAttempted]);

    // Don't render anything if loading or no video found
    if (isLoading) {
        return (
            <section>
                <h2 className="font-display text-3xl font-bold mb-6">
                    {t('videoTutorial')}
                </h2>
                <div className="bg-card rounded-2xl overflow-hidden shadow-soft">
                    <div className="aspect-video flex items-center justify-center bg-muted">
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-muted-foreground">Searching for video tutorial...</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Don't render section if no video found after search
    if (!videoId) {
        return null;
    }

    // Render the video
    return (
        <section>
            <h2 className="font-display text-3xl font-bold mb-6">
                {t('videoTutorial')}
            </h2>
            <div className="bg-card rounded-2xl overflow-hidden shadow-soft">
                <div className="aspect-video">
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={`${recipe.name} video tutorial`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
            </div>
        </section>
    );
}
