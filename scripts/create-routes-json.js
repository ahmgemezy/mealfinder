#!/usr/bin/env node

/**
 * Create _routes.json for Cloudflare Pages
 * This file tells Cloudflare how to route requests to static files
 */

const fs = require("fs");
const path = require("path");

const outDir = path.join(process.cwd(), "out");

// Cloudflare Pages _routes.json format
// Include all static routes, exclude nothing (static export means everything is static)
const routesConfig = {
  version: 1,
  include: ["/*"],
  exclude: [],
};

const routesPath = path.join(outDir, "_routes.json");
fs.writeFileSync(routesPath, JSON.stringify(routesConfig, null, 2));
console.log("✅ Created _routes.json for Cloudflare Pages");
