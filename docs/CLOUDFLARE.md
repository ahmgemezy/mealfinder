# Cloudflare Pages / OpenNext deployment guide

This project uses OpenNext (`@opennextjs/cloudflare`) and is set up to build for Cloudflare Workers / Pages.

Local development

- Use `npm run dev` as usual for local Next.js dev.
- To preview in the Cloudflare Workers runtime locally (recommended for final verification):
  - `npm run build:cloudflare`
  - `npx wrangler pages dev .open-next/assets --compatibility-flags=nodejs_compat`

wrangler config

- `wrangler.jsonc` is present; create or fill `wrangler.toml` with your `account_id` and bindings (KV, R2, D1) or keep a `wrangler.toml.example` in repo and store real values in CI.

Secrets and environment

- Add `CF_PAGES_API_TOKEN` as a secret in your GitHub repository (used by the GitHub Action to publish to Pages).
- Add other runtime secrets (e.g., `SUPABASE_URL`, `SUPABASE_KEY`) in Cloudflare Pages UI or use Wrangler secrets.

Set GitHub secrets via CLI (recommended):

```bash
# Replace <owner>/<repo> with your repository
# Set your Cloudflare account id
echo "524f538eb0ee76515ec20ba665259e21" | gh secret set CF_ACCOUNT_ID -R <owner>/<repo> -b-

# Set your Pages API token
echo "r9qOUxR3Bci1Py8gugDChr46CyQsk6P8mzEtKQoG" | gh secret set CF_PAGES_API_TOKEN -R <owner>/<repo> -b-

# Set your Pages project name (replace with your project name)
echo "your-pages-project-name" | gh secret set CF_PAGES_PROJECT_NAME -R <owner>/<repo> -b-

# Optional bindings (set if you created these resources in Cloudflare)
# echo "<kv-id>" | gh secret set CF_KV_ID -R <owner>/<repo> -b-
# echo "<r2-bucket-name>" | gh secret set CF_R2_BUCKET -R <owner>/<repo> -b-
# echo "<d1-id>" | gh secret set CF_D1_ID -R <owner>/<repo> -b-
```

CI / Deploy

- The GitHub Action at `.github/workflows/pages.yml` builds the OpenNext output and publishes `.open-next/assets` to Cloudflare Pages.
- The workflow now renders `wrangler.toml` from GitHub secrets and reads `CF_PAGES_PROJECT_NAME` from secrets; ensure the secrets above are set before pushing the workflow branch.

Notes

- The project already includes `@opennextjs/cloudflare`; we initialize the OpenNext dev integration in `next.config.ts` so you can use Cloudflare bindings during `next dev`.
- If you prefer Next on Pages for older Next versions, that path requires `@cloudflare/next-on-pages` and is not compatible with Next 16 used here.
