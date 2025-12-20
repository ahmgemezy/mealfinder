import { translateToEnglish } from '../lib/services/translation';

async function main() {
    const arabic = "دجاج";
    const spanish = "pollo";
    const german = "Hähnchen";
    const english = "chicken";

    console.log("--- Extracting Translations ---");

    const t1 = await translateToEnglish(arabic);
    console.log(`Arabic 'دجاج' -> '${t1}'`);

    const t2 = await translateToEnglish(spanish);
    console.log(`Spanish 'pollo' -> '${t2}'`);

    const t3 = await translateToEnglish(german);
    console.log(`German 'Hähnchen' -> '${t3}'`);

    const t4 = await translateToEnglish(english);
    console.log(`English 'chicken' -> '${t4}'`);

    if (t1.toLowerCase().includes("chicken") && t2.toLowerCase().includes("chicken")) {
        console.log("\n✅ Translation Service Logic Verification Passed");
    } else {
        console.error("\n❌ Translation Service Validation Failed");
        process.exit(1);
    }
}

main().catch(console.error);
