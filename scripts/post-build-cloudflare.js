#!/usr/bin/env node

/**
 * Post-build script for Cloudflare Pages
 * Verifies static export output files
 */

const fs = require("fs");
const path = require("path");

const outDir = path.join(process.cwd(), "out");

// Verify _redirects file exists (should be copied from public/ by Next.js)
const redirectsPath = path.join(outDir, "_redirects");
if (fs.existsSync(redirectsPath)) {
  console.log("✅ _redirects file found in output directory");
} else {
  console.log("⚠️  _redirects file not found, creating it...");
  const redirectsContent = `# Default locale redirect
/  /en/  301

# Ads.txt redirect
/ads.txt https://srv.adstxtmanager.com/19390/dishshuffle.com 301
`;
  fs.writeFileSync(redirectsPath, redirectsContent);
  console.log("✅ Created _redirects file");
}

// Verify en directory exists
const enDir = path.join(outDir, "en");
if (fs.existsSync(enDir)) {
  console.log(
    `✅ /en/ directory found (${fs.readdirSync(enDir).length} files)`
  );
} else {
  console.log("❌ ERROR: /en/ directory not found in build output");
}

// Create a root index.html as a fallback
const indexPath = path.join(outDir, "index.html");
const indexContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0;url=/en/" />
    <title>Redirecting...</title>
</head>
<body>
    Redirecting to /en/...
</body>
</html>
`;
fs.writeFileSync(indexPath, indexContent);
console.log("✅ Created root index.html redirect");
