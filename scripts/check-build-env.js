#!/usr/bin/env node

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

console.log("--- build env verification ---");
const missing = [];
for (const key of required) {
  const val = process.env[key];
  if (!val) {
    missing.push(key);
  } else {
    // Print presence without revealing full secret
    console.log(`✅ ${key} present (length=${val.length})`);
  }
}

if (missing.length) {
  console.error(`\n❌ Missing required build env vars: ${missing.join(", ")}`);
  console.error(
    "Ensure these are set in Cloudflare Pages under Environment variables & secrets with Build/Preview scope."
  );
  process.exit(1);
}

console.log("\nAll required build env vars present.");
