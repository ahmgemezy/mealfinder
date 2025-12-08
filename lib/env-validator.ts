/**
 * Environment Variable Validator
 * Ensures all required environment variables are set before the app starts
 */

export function validateEnvVars() {
    // Check if we're on the server side
    if (typeof window !== 'undefined') {
        return; // Skip validation on client side
    }

    const requiredPublicVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    const missingPublic = requiredPublicVars.filter(
        key => !process.env[key] || process.env[key] === 'placeholder-key' || process.env[key]?.includes('placeholder')
    );

    if (missingPublic.length > 0) {
        console.error(
            '❌ Missing required environment variables:\n' +
            missingPublic.map(v => `  - ${v}`).join('\n') +
            '\n\nPlease check your .env.local file and ensure all variables are set correctly.'
        );

        // In production, this is critical - throw error
        if (process.env.NODE_ENV === 'production') {
            throw new Error(`Missing required environment variables: ${missingPublic.join(', ')}`);
        }
    }

    // Warn about optional but recommended variables
    const optionalVars = ['RECIPE_API_PROVIDER', 'SPOONACULAR_API_KEY'];
    const missingOptional = optionalVars.filter(key => !process.env[key]);

    if (missingOptional.length > 0) {
        console.warn(
            '⚠️  Optional environment variables not set:\n' +
            missingOptional.map(v => `  - ${v}`).join('\n') +
            '\n\nThe app will use default values.'
        );
    }
}
