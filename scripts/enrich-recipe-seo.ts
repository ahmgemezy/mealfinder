/**
 * Recipe SEO Enrichment CLI
 * 
 * Usage:
 *   npx tsx scripts/enrich-recipe-seo.ts --recipe-id 52772
 *   npx tsx scripts/enrich-recipe-seo.ts --limit 10
 *   npx tsx scripts/enrich-recipe-seo.ts --dry-run
 */

import 'dotenv/config';
import * as fs from 'fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { enrichRecipeSEO } from '../lib/services/seo-enricher';
import { Recipe } from '../lib/types/recipe';

// Load .env.local if it exists
if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local', override: true });
}

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// CLI Argument Parsing
// ============================================================================

interface CLIArgs {
    recipeId?: string;
    limit: number;
    dryRun: boolean;
}

function parseArgs(): CLIArgs {
    const args = process.argv.slice(2);
    const result: CLIArgs = { limit: 10, dryRun: false };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--recipe-id' && args[i + 1]) {
            result.recipeId = args[++i];
        } else if (args[i] === '--limit' && args[i + 1]) {
            result.limit = parseInt(args[++i], 10);
        } else if (args[i] === '--dry-run') {
            result.dryRun = true;
        }
    }

    return result;
}

// ============================================================================
// Main Script
// ============================================================================

async function main() {
    console.log('\n🚀 Recipe SEO Enrichment Tool\n');

    const args = parseArgs();

    // Fetch recipes to enrich
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let recipesToEnrich: any[] = [];

    if (args.recipeId) {
        console.log(`📌 Targeting specific recipe: ${args.recipeId}`);
        const { data, error } = await supabase
            .from('recipes')
            .select('id, data')
            .eq('id', args.recipeId)
            .single();

        if (error || !data) {
            console.error(`❌ Recipe ${args.recipeId} not found`);
            process.exit(1);
        }

        recipesToEnrich = [data];
    } else {
        console.log(`📊 Fetching up to ${args.limit} recipes...`);

        // Use RPC to efficiently find unenriched recipes
        const { data: unenriched, error } = await supabase
            .rpc('get_unenriched_recipes', { limit_count: args.limit });

        if (error) {
            console.error('❌ Error fetching unenriched recipes via RPC:', error.message);
            console.error('👉 Have you applied the migration "supabase/migrations/20250118_get_unenriched_recipes.sql"?');
            process.exit(1);
        }

        if (!unenriched || unenriched.length === 0) {
            console.log('✅ All recipes already enriched! Use --recipe-id to refresh specific recipe.');
            process.exit(0);
        }

        recipesToEnrich = unenriched;
        console.log(`🎯 Found ${recipesToEnrich.length} unenriched recipes`);
    }

    // Enrich recipes
    let successCount = 0;
    let failCount = 0;

    for (const [index, recipeData] of recipesToEnrich.entries()) {
        const recipe: Recipe = recipeData.data;
        const progress = `[${index + 1}/${recipesToEnrich.length}]`;

        console.log(`\n${progress} Enriching: ${recipe.name}`);

        if (args.dryRun) {
            console.log(`   ⏭️  DRY RUN - Skipping actual enrichment`);
            continue;
        }

        try {
            const enrichment = await enrichRecipeSEO(recipe);

            if (enrichment) {
                console.log(`   ✅ Success!`);
                console.log(`      - FAQ: ${enrichment.faq.length} questions`);
                console.log(`      - Meta: ${enrichment.metaDescription.slice(0, 50)}...`);
                console.log(`      - Keywords: ${enrichment.keywords.length} keywords`);
                successCount++;
            } else {
                console.log(`   ⚠️  No enrichment generated`);
                failCount++;
            }
        } catch (error) {
            console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            failCount++;
        }

        // Rate limiting - wait 2 seconds between recipes
        if (index < recipesToEnrich.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Summary
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total: ${recipesToEnrich.length}`);
    console.log(`${'='.repeat(50)}\n`);
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
