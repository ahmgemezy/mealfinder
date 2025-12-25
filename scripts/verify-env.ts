import 'dotenv/config';

console.log('--- ENV VERIFICATION ---');
const key = process.env.OPENAI_API_KEY;

if (key) {
    console.log('✅ OPENAI_API_KEY found');
    console.log('Length:', key.length);
    console.log('Start:', key.substring(0, 7) + '...');
    // Check for invisible characters
    if (key.trim() !== key) {
        console.warn('⚠️  WARNING: Key has whitespace/newline characters!');
    }
} else {
    console.error('❌ OPENAI_API_KEY is MISSING in process.env');
}

console.log('SUPABASE_URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('--- END ---');
