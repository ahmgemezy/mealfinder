"use client";

import { useState, useEffect } from 'react';
import { Recipe } from '@/lib/types/recipe';
import { searchRecipeVideo, extractYouTubeVideoId, updateRecipeYoutubeUrl, checkVideoStatus } from '@/lib/api/youtube';
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
            let currentVideoId: string | null = null;
            let needsReplacement = false;

            // 1. Check if recipe already has a linked YouTube video
            if (recipe.youtube) {
                const existingVideoId = extractYouTubeVideoId(recipe.youtube);
                if (existingVideoId) {
                    // Verify if the video is still valid/public
                    const isValid = await checkVideoStatus(existingVideoId);
                    if (isValid) {
                        setVideoId(existingVideoId);
                        setSearchAttempted(true);
                        return; // Existing video is good
                    } else {
                        console.warn(`[RecipeVideo] Video ${existingVideoId} is unavailable. Searching for replacement...`);
                        needsReplacement = true;
                    }
                }
            }

            // 2. If no video exists OR existing one is broken, search for one
            if (!searchAttempted || needsReplacement) {
                setIsLoading(true);
                try {
                    const foundVideoId = await searchRecipeVideo(recipe.name);

                    if (foundVideoId) {
                        console.log(`[RecipeVideo] Found ${needsReplacement ? 'replacement' : 'new'} video ID for "${recipe.name}":`, foundVideoId);
                        setVideoId(foundVideoId);
                        // Cache the found video URL to Supabase (Healing/Caching)
                        updateRecipeYoutubeUrl(recipe.id, foundVideoId);
                    } else {
                        console.warn(`[RecipeVideo] No video found for "${recipe.name}"`);
                        setVideoId(null);
                    }
                } catch (error) {
                    console.error('[RecipeVideo] Error loading recipe video:', error);
                    setVideoId(null);
                } finally {
                    setIsLoading(false);
                    setSearchAttempted(true);
                }
            }
        }

        loadVideo();
    }, [recipe.id, recipe.youtube, recipe.name, searchAttempted]);

    // Optimized Video Player (Facade Pattern)
    const [isPlaying, setIsPlaying] = useState(false);

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
                            <p className="text-muted-foreground">{t('videoTutorial')}</p>
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
                <div className="aspect-video relative group">
                    {isPlaying ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title={`${recipe.name} video tutorial`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        />
                    ) : (
                        <button
                            onClick={() => setIsPlaying(true)}
                            className="w-full h-full relative cursor-pointer block"
                            aria-label={`Play video for ${recipe.name}`}
                        >
                            {/* Thumbnail */}
                            <img
                                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                                alt={recipe.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                {/* Play Button */}
                                <div className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                                    <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
