
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const AUTHORS_DATA: Record<string, string> = {
    "Chef Alex": "/images/team/chef-alex.jpg",
    "Sarah Jenkins": "/images/team/sarah-jenkins.jpg",
    "Dr. Emily Foodsci": "/images/team/dr--emily-foodsci.jpg",
    "Giulia Rossi": "/images/team/giulia-rossi.jpg",
    "Marcus Chen": "/images/team/marcus-chen.jpg",
    "Elena Rodriguez": "/images/team/elena-rodriguez.jpg",
    "James Oliver": "/images/team/james-oliver.jpg",
    "Priya Patel": "/images/team/priya-patel.jpg",
    "Sophie Dubois": "/images/team/sophie-dubois.jpg",
    "Kenji Yamamoto": "/images/team/kenji-yamamoto.jpg",
    "Kenji Tanaka": "/images/team/kenji-yamamoto.jpg" // Handling potential alias/error from before
};

async function updateAuthorImages() {
    console.log("Starting DB update for author images...");

    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, slug, author');

    if (error) {
        console.error("Error fetching posts:", error);
        return;
    }

    console.log(`Found ${posts.length} posts.`);

    let updatedCount = 0;

    for (const post of posts) {
        const imageUrl = AUTHORS_DATA[post.author];
        if (imageUrl) {
            const { error: updateError } = await supabase
                .from('blog_posts')
                .update({ author_image: imageUrl })
                .eq('id', post.id);

            if (updateError) {
                console.error(`Failed to update post ${post.slug}:`, updateError);
            } else {
                updatedCount++;
                // console.log(`Updated ${post.slug} (${post.author}) -> ${imageUrl}`);
            }
        } else {
            console.warn(`No image found for author: ${post.author} (Post: ${post.slug})`);
        }
    }

    console.log(`Successfully updated ${updatedCount} posts.`);
}

updateAuthorImages().catch(console.error);
