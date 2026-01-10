/**
 * Stub for google-translate-api-x to reduce Cloudflare Worker bundle size
 * Returns original text without translation
 */

module.exports = async function translate(text, options) {
  return {
    text: text,
    from: {
      language: {
        didYouMean: false,
        iso: "en",
      },
      text: {
        autoCorrected: false,
        value: "",
        didYouMean: false,
      },
    },
    raw: "",
  };
};

module.exports.default = module.exports;
