
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { blogPosts } from '../lib/data/blog-posts';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migratePosts() {
    console.log(`Starting migration of ${blogPosts.length} posts...`);

    let successCount = 0;
    let errorCount = 0;

    for (const post of blogPosts) {
        console.log(`Migrating: ${post.title}`);

        const { error } = await supabase
            .from('blog_posts')
            .upsert({
                slug: post.slug,
                title: post.title,
                excerpt: post.excerpt || post.description, // Handle potential messy types
                content: post.content,
                category: post.category,
                author: post.author,
                featured_image: post.featuredImage,
                published_date: post.publishedDate,
                tags: post.tags,
                read_time: post.readTime,
                // created_at and updated_at will default to now()
            }, { onConflict: 'slug' });

        if (error) {
            console.error(`Error migrating ${post.title}:`, error.message);
            errorCount++;
        } else {
            console.log(`Successfully migrated: ${post.title}`);
            successCount++;
        }
    }

    console.log('\nMigration complete!');
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
}

migratePosts().catch(console.error);
