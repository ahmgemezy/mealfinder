/**
 * YouTube Data API v3 integration for searching cooking tutorial videos
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Recipe } from '@/lib/types/recipe';
import { devLog } from '@/lib/utils/logger';

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';



/**
 * Search YouTube for a cooking tutorial video based on recipe name
 * @param recipeName - Name of the recipe to search for
 * @returns YouTube video ID if found, null otherwise
 */
export async function searchRecipeVideo(recipeName: string): Promise<string | null> {
    // Return null if API key is not configured
    if (!YOUTUBE_API_KEY) {
        console.warn('YouTube API key not configured. Skipping video search.');
        return null;
    }

    try {
        // Optimize search query for cooking tutorials
        // Simplified query to increase match rate
        const searchQuery = `${recipeName} recipe`;

        const params = new URLSearchParams({
            part: 'snippet',
            q: searchQuery,
            type: 'video',
            maxResults: '1',
            videoEmbeddable: 'true', // Only return embeddable videos
            // videoCategoryId: '26', // Removed to broaden search results
            relevanceLanguage: 'en',
            key: YOUTUBE_API_KEY,
        });

        const response = await fetch(`${YOUTUBE_API_BASE_URL}/search?${params.toString()}`);

        if (!response.ok) {
            // Handle quota exceeded or other API errors
            if (response.status === 403) {
                console.error('YouTube API quota exceeded or access denied');
            } else {
                console.error(`YouTube API error: ${response.status} ${response.statusText}`);
            }
            return null;
        }

        const data = await response.json();

        // Check if we got any results
        if (!data.items || data.items.length === 0) {
            devLog.log(`No YouTube videos found for: ${recipeName}`);
            return null;
        }

        const videoId = data.items[0].id.videoId;
        devLog.log(`Found YouTube video for ${recipeName}: ${videoId}`);

        return videoId;
    } catch (error) {
        console.error('Error searching YouTube:', error);
        return null;
    }
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param url - YouTube URL (full URL or embed URL)
 * @returns Video ID if found, null otherwise
 */
export function extractYouTubeVideoId(url: string): string | null {
    if (!url) return null;

    try {
        // Handle various YouTube URL formats:
        // - https://www.youtube.com/watch?v=VIDEO_ID
        // - https://youtu.be/VIDEO_ID
        // - https://www.youtube.com/embed/VIDEO_ID

        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        return null;
    } catch (error) {
        console.error('Error extracting YouTube video ID:', error);
        return null;
    }
}

/**
 * Update a recipe's YouTube URL in Supabase cache
 * This saves the found video so we don't need to search again
 * @param recipeId - The recipe ID to update
 * @param videoId - The YouTube video ID that was found
 */
export async function updateRecipeYoutubeUrl(
    recipeId: string,
    videoId: string
): Promise<void> {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured. Cannot cache YouTube video.');
        return;
    }

    try {
        // Construct full YouTube URL
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // Fetch the current recipe data
        const { data: existingData, error: fetchError } = await supabase
            .from('recipes')
            .select('data')
            .eq('id', recipeId)
            .single();

        if (fetchError) {
            // Recipe might not be cached yet - that's okay
            devLog.log(`Recipe ${recipeId} not in cache, cannot update YouTube URL`);
            return;
        }

        // Update the recipe with the YouTube URL and current timestamp
        const updatedRecipe: Recipe = {
            ...(existingData.data as Recipe),
            youtube: youtubeUrl,
            videoLastChecked: new Date().toISOString(),
        };

        // Save back to Supabase
        const { error: updateError } = await supabase
            .from('recipes')
            .upsert({
                id: recipeId,
                data: updatedRecipe,
                created_at: new Date().toISOString(),
            }, { onConflict: 'id' });

        if (updateError) {
            console.error('Error updating recipe YouTube URL:', updateError);
            return;
        }

        devLog.log(`Cached YouTube video for recipe ${recipeId}: ${youtubeUrl}`);
    } catch (error) {
        console.error('Error caching YouTube video:', error);
    }
}

/**
 * Update the last checked timestamp for a recipe's video
 * Call this when a video is confirmed to be valid to reset the 30-day timer
 */
export async function touchRecipeVideoTimestamp(recipeId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
        const { data: existingData, error: fetchError } = await supabase
            .from('recipes')
            .select('data')
            .eq('id', recipeId)
            .single();

        if (fetchError || !existingData) return;

        const updatedRecipe: Recipe = {
            ...(existingData.data as Recipe),
            videoLastChecked: new Date().toISOString(),
        };

        await supabase
            .from('recipes')
            .upsert({
                id: recipeId,
                data: updatedRecipe,
                created_at: new Date().toISOString(), // Keeping created_at current for cache freshness if needed
            }, { onConflict: 'id' });

        devLog.log(`Updated video check timestamp for recipe ${recipeId}`);
    } catch (error) {
        console.error('Error touching video timestamp:', error);
    }
}
/**
 * Check if a YouTube video is valid, public, and embeddable
 * @param videoId - The YouTube video ID to check
 * @returns true if video is valid and playable, false otherwise
 */
export async function checkVideoStatus(videoId: string): Promise<boolean> {
    // Return true (assume valid) if API key is not configured to avoid breaking UI
    if (!YOUTUBE_API_KEY) {
        return true;
    }

    try {
        const params = new URLSearchParams({
            part: 'status,contentDetails',
            id: videoId,
            key: YOUTUBE_API_KEY,
        });

        const response = await fetch(`${YOUTUBE_API_BASE_URL}/videos?${params.toString()}`);

        if (!response.ok) {
            console.error(`YouTube API error checking video status: ${response.status}`);
            return false; // Fail safe
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return false; // Video not found (deleted/private)
        }

        const item = data.items[0];
        const status = item.status;

        // Check if playable
        if (status.uploadStatus !== 'processed') return false;
        if (status.privacyStatus !== 'public') return false;
        if (status.embeddable === false) return false;

        return true;
    } catch (error) {
        console.error(`Error checking video status for ${videoId}:`, error);
        return false;
    }
}
