/**
 * Stub for google-translate-api-x to reduce Cloudflare Worker bundle size
 * Returns original text without translation - translations are pre-cached in Supabase
 */

async function translate(text, options) {
  return {
    text: text,
    from: {
      language: {
        didYouMean: false,
        iso: options?.from || "en",
      },
      text: {
        autoCorrected: false,
        value: "",
        didYouMean: false,
      },
    },
    raw: "",
  };
}

// ES module export
export default translate;
// Also support named export
export { translate };
