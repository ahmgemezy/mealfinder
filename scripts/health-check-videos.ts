import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Load env vars
const envPath = path.join(process.cwd(), '.env.local');
const env: Record<string, string> = {};

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            env[key] = value;
        }
    });
    console.log('Environment variables loaded.');
} catch (e) {
    console.error('Error loading .env.local', e);
    process.exit(1);
}

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_KEY = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const YOUTUBE_API_KEY = env['NEXT_PUBLIC_YOUTUBE_API_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY || !YOUTUBE_API_KEY) {
    console.error('Missing required env vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function extractVideoId(url: string): string | null {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
}

async function checkVideoStatus(videoId: string): Promise<boolean> {
    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=status,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
        // Add referrer to pass API restriction
        const res = await fetch(url, { headers: { 'Referer': 'http://localhost:3000' } });
        const data = await res.json();

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
        console.error(`Error checking video ${videoId}:`, error);
        return false; // Assume broken on error safely? Or maybe true to avoid churn. Let's assume broken for now if API works.
    }
}

async function findReplacement(recipeName: string): Promise<string | null> {
    try {
        console.log(`  Searching replacement for: "${recipeName}"...`);
        const params = new URLSearchParams({
            part: 'snippet',
            q: `${recipeName} recipe`,
            type: 'video',
            maxResults: '1',
            videoEmbeddable: 'true',
            relevanceLanguage: 'en',
            key: YOUTUBE_API_KEY!,
        });

        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`, {
            headers: { 'Referer': 'http://localhost:3000' }
        });
        const data = await res.json();

        if (data.items && data.items.length > 0) {
            return data.items[0].id.videoId;
        }
    } catch (error) {
        console.error('  Search failed:', error);
    }
    return null;
}

async function main() {
    console.log('--- Starting Video Health Check ---');

    // 1. Fetch recipes with videos
    // Fetch recipes where data->youtube is not null
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, data');
    // Note: Filtering JSONB via .not('data->>youtube', 'is', null) can be tricky in some Supabase versions/client libs
    // So we'll fetch ID/data and filter in memory since dataset is small.

    if (error || !recipes) {
        console.error('Failed to fetch recipes:', error);
        return;
    }

    // Filter for recipes that actually have a youtube link
    const validRecipes = recipes.filter(r => r.data && r.data.youtube);

    console.log(`Found ${validRecipes.length} recipes with videos.`);

    let checked = 0;
    let fixed = 0;
    let failed = 0;

    // Process sequentially to be nice to API limits
    for (const record of validRecipes) {
        checked++;
        const recipe = record.data;
        const videoId = extractVideoId(recipe.youtube);

        if (!videoId) {
            console.log(`[${checked}/${validRecipes.length}] Invalid URL for "${recipe.name}": ${recipe.youtube}`);
            continue;
        }

        process.stdout.write(`[${checked}/${validRecipes.length}] Checking "${recipe.name}" (${videoId})... `);

        const isHealthy = await checkVideoStatus(videoId);

        if (isHealthy) {
            console.log('OK ✅');
        } else {
            console.log('BROKEN ❌');
            console.log(`  -> Video ${videoId} is unavailable.`);

            // Auto-repair
            const newVideoId = await findReplacement(recipe.name);

            if (newVideoId) {
                const newUrl = `https://www.youtube.com/watch?v=${newVideoId}`;
                console.log(`  -> Found new video: ${newVideoId}`);

                // Update the data object
                const updatedData = { ...recipe, youtube: newUrl };

                const { error: updateError } = await supabase
                    .from('recipes')
                    .update({ data: updatedData })
                    .eq('id', record.id);

                if (!updateError) {
                    console.log('  -> Database updated ✅');
                    fixed++;
                } else {
                    console.error('  -> DB Update Failed:', updateError);
                    failed++;
                }
            } else {
                console.log('  -> No replacement found. leaving as is.');
                failed++;
            }
        }

        // Slight delay to avoid burst limits
        await new Promise(r => setTimeout(r, 200));
    }

    console.log('\n--- Health Check Complete ---');
    console.log(`Total Checked: ${checked}`);
    console.log(`Fixed: ${fixed}`);
    console.log(`Failed/Skipped: ${failed}`);
}

main();
