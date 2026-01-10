#!/usr/bin/env node

/**
 * Post-build script for Cloudflare Pages
 * Copies and creates necessary files for static export deployment
 */

const fs = require("fs");
const path = require("path");

const outDir = path.join(process.cwd(), "out");

// Create _redirects file for Cloudflare Pages
const redirectsContent = `# Redirect root to default locale (English)
/  /en/  302

# API routes should 404 since we're static export
/api/*  404

# Route all locale-less paths to 404
/*  /en/:splat  200
`;

const redirectsPath = path.join(outDir, "_redirects");
fs.writeFileSync(redirectsPath, redirectsContent);
console.log("✅ Created _redirects file for Cloudflare Pages");

// Create a root index.html that redirects to /en/
const indexContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0;url=/en/" />
</head>
<body>
    Redirecting to /en/...
</body>
</html>
`;

const indexPath = path.join(outDir, "index.html");
fs.writeFileSync(indexPath, indexContent);
console.log("✅ Created root index.html redirect");
