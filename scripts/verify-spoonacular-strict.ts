
import dotenv from 'dotenv';
import path from 'path';
import { findByIngredients } from '../lib/api/spoonacular';

// Load environment variables (order matters: first one wins)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function verifySpoonacular() {
    console.log('Testing Spoonacular Strict Search...');
    const hasKey = !!process.env.SPOONACULAR_API_KEY;
    console.log(`API Key configured: ${hasKey}`);

    if (!hasKey) {
        console.error('Missing SPOONACULAR_API_KEY in .env or .env.local');
        return;
    }

    // "Chicken + Rice" should return some strict matches (e.g. Chicken Rice Soup)
    const ingredients = ['chicken', 'rice'];
    console.log(`Searching for strict match: ${ingredients.join(' + ')}`);

    try {
        const results = await findByIngredients(ingredients);
        console.log(`Found ${results.length} strict matches.`);

        if (results.length > 0) {
            console.log('Sample result:', results[0].name);
        } else {
            console.log('No strict matches found. This might be due to strict filtering working (if API returned loose matches).');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

verifySpoonacular();
