
import chalk from "chalk";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

// ============================================================================
// Configuration
// ============================================================================

const BANNED_WORDS = [
    "delve",
    "tapestry",
    "landscape",
    "myriad",
    "crucial",
    "paramount",
    "realm",
    "game-changer",
    "unlock",
    "elevate",
    "unleash",
    "testament",
    "nestled",
    "arguably",
    "bustling",
];

// ============================================================================
// Logic
// ============================================================================

/**
 * Splits text into sentences using simple regex.
 * Not perfect but good enough for rhythm analysis.
 */
function splitSentences(text: string): string[] {
    return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Checks for banned words.
 */
function checkBannedWords(text: string) {
    const lower = text.toLowerCase();
    const found: string[] = [];

    for (const word of BANNED_WORDS) {
        // Regex to match whole words only
        const regex = new RegExp(`\\b${word}\\b`, "i");
        if (regex.test(lower)) {
            found.push(word);
        }
    }

    return found;
}

/**
 * Analyzes sentence rhythm (Standard Deviation of sentence lengths).
 * Low deviation = Robotic/Monotone.
 * High deviation = Human/Dynamic.
 */
function checkRhythm(sentences: string[]) {
    if (sentences.length < 3) return { score: 10, variance: 0, mean: 0, stdDev: 0, lengths: [] }; // Not enough data

    const lengths = sentences.map(s => s.split(/\s+/).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;

    const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);

    // Heuristic: StdDev < 3 is very robotic. > 5 is good.
    return { stdDev, mean, lengths };
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
    const argv = await yargs(hideBin(process.argv))
        .option("text", { type: "string", description: "Text to evaluate" })
        .option("file", { type: "string", description: "File path to evaluate" })
        .help()
        .argv;

    let content = "";

    if (argv.text) {
        content = argv.text;
    } else if (argv.file) {
        // dynamic import fs to avoid issues if not needed
        const fs = await import("fs");
        if (fs.existsSync(argv.file)) {
            content = fs.readFileSync(argv.file, "utf-8");
        } else {
            console.error(chalk.red(`File not found: ${argv.file}`));
            process.exit(1);
        }
    } else {
        console.log(chalk.yellow("Usage: npx tsx scripts/eval-style.ts --text \"Your text here\""));
        process.exit(0);
    }

    console.log(chalk.bold("\n🕵️  AI Style Evaluator\n"));

    // 1. Banned Words
    const bannedFound = checkBannedWords(content);
    if (bannedFound.length > 0) {
        console.log(chalk.red("❌ Banned Words Detected:"));
        bannedFound.forEach(w => console.log(`   - ${w}`));
    } else {
        console.log(chalk.green("✅ No Banned Words Found"));
    }

    // 2. Rhythm
    const sentences = splitSentences(content);
    const rhythm = checkRhythm(sentences);

    console.log(chalk.bold("\n🎵 Rhythm Analysis:"));
    console.log(`   Avg Sentence Length: ${rhythm.mean.toFixed(1)} words`);
    console.log(`   Length Variation (StdDev): ${rhythm.stdDev.toFixed(1)}`);

    if (rhythm.stdDev < 3) {
        console.log(chalk.red("   ⚠️  ROBOTIC TONE DETECTED (Sentences are too uniform in length)"));
    } else {
        console.log(chalk.green("   ✅ Good Sentence Variety"));
    }

    // Summary
    console.log("\n" + "=".repeat(30));
    if (bannedFound.length === 0 && rhythm.stdDev >= 3) {
        console.log(chalk.green.bold("🎉 PASS: Text sounds human-like!"));
        process.exit(0);
    } else {
        console.log(chalk.red.bold("💥 FAIL: Text needs editing."));
        process.exit(1);
    }
}

main().catch(console.error);
