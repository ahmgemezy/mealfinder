
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyRpc() {
    console.log('Testing find_recipes_by_ingredients RPC...');

    // Search for common ingredients that should likely be in the cache if it has data
    // Strict Mode: Expecting recipes that have BOTH chicken AND rice
    const ingredients = ['chicken', 'rice'];
    console.log(`Searching for strict match: ${ingredients.join(' + ')}`);

    const { data, error } = await supabase.rpc('find_recipes_by_ingredients', {
        search_ingredients: ingredients
    });

    if (error) {
        console.error('RPC Error:', error);
        process.exit(1);
    }

    console.log('RPC Success!');
    console.log(`Found ${data?.length || 0} recipes.`);

    if (data && data.length > 0) {
        console.log('Sample result:', data[0].id);
    } else {
        console.log('No recipes found (this is okay if cache is empty, but RPC worked).');
    }
}

verifyRpc();
