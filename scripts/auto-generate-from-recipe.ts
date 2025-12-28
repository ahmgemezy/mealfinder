
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from "openai";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getRandomRecipe() {
    // 1. Get count
    const { count } = await supabase.from('recipes').select('*', { count: 'exact', head: true });
    console.log(`Debug: Total recipes found: ${count}`);
    if (!count) throw new Error("No recipes found in DB");

    // 2. Random offset
    const randomOffset = Math.floor(Math.random() * count);
    console.log(`Debug: Querying offset: ${randomOffset}`);

    // 3. Fetch 1 recipe
    const { data, error } = await supabase
        .from('recipes')
        .select('data')
        .order('id', { ascending: true }) // Essential for range()
        .range(randomOffset, randomOffset)
        .limit(1)
        .single();

    if (error) {
        console.error("Supabase Error:", error);
        throw new Error("Failed to fetch random recipe");
    }
    if (!data) throw new Error("No data returned");

    // Prefer data.name if available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recipeData = data.data as any;
    const recipeName = recipeData?.name;
    const recipeImage = recipeData?.image || recipeData?.strMealThumb || recipeData?.thumbnail;

    if (!recipeName) throw new Error("Recipe has no name");

    return { name: recipeName, image: recipeImage };
}

async function generateTopicFromRecipe(recipeName: string) {
    console.log(`🤔 Brainstorming topic for recipe: "${recipeName}"...`);

    const prompt = `You are a Content Strategist for a professional food magazine.
    We have a recipe for: "${recipeName}".
    
    Generate 1 highly clickable, SEO-optimized "Authority Article" topic based on this recipe.
    The topic should not just be the recipe itself, but a broader, deep-dive subject.
    
    Examples:
    - Recipe: "Carbonara" -> Topic: "The Science of Carbonara: Why Cream Belongs in the Trash"
    - Recipe: "Sourdough" -> Topic: "The Ultimate Guide to Sourdough: From Starter to Loaf"
    - Recipe: "Cast Iron Steak" -> Topic: "Why Professional Chefs Obsess Over Cast Iron Skillets"
    
    Output ONLY the raw topic string. No quotes.`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
    });

    return completion.choices[0].message.content?.trim() || recipeName;
}

async function main() {
    try {
        console.log("🎲 Picking a random recipe...");
        const { name: recipeName, image: recipeImage } = await getRandomRecipe();
        console.log(`   Selected: ${recipeName}`);
        if (recipeImage) console.log(`   Image found: ${recipeImage.slice(0, 50)}...`);

        const topic = await generateTopicFromRecipe(recipeName);
        console.log(`✨ Generated Topic: "${topic}"`);

        // Infer Category (Simple heuristic or random)
        const categories = [
            "Cooking Fundamentals", "Cuisine Exploration", "Cooking Tips & Trends",
            "Ingredient Deep Dive", "Seasonal Spotlight"
        ];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];

        console.log(`🚀 Launching Generator for category: "${randomCategory}"...`);

        // Execute the main generator script
        // We utilize the existing CLI interface
        const isDryRun = process.argv.includes("--dry-run");
        let command = `npx tsx scripts/generate-blog-post.ts --topic "${topic.replace(/"/g, '\\"')}" --category "${randomCategory}"`;
        if (recipeImage) command += ` --featured-image "${recipeImage}"`;
        if (isDryRun) command += " --dry-run";

        console.log(`> ${command}`);

        const { stdout, stderr } = await execAsync(command);
        console.log(stdout);
        if (stderr) console.error(stderr);

        console.log("✅ Auto-Generation Complete!");

    } catch (error) {
        console.error("❌ Auto-Generation Failed:", error);
        process.exit(1);
    }
}

main();
