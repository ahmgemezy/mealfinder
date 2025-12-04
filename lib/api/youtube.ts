/**
 * YouTube Data API v3 integration for searching cooking tutorial videos
 */

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
        const searchQuery = `${recipeName} recipe cooking tutorial`;

        const params = new URLSearchParams({
            part: 'snippet',
            q: searchQuery,
            type: 'video',
            maxResults: '1',
            videoEmbeddable: 'true', // Only return embeddable videos
            videoCategoryId: '26', // Category 26 is "Howto & Style"
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
            console.log(`No YouTube videos found for: ${recipeName}`);
            return null;
        }

        const videoId = data.items[0].id.videoId;
        console.log(`Found YouTube video for ${recipeName}: ${videoId}`);

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
