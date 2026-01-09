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

CI / Deploy

- The GitHub Action at `.github/workflows/pages.yml` builds the OpenNext output and publishes `.open-next/assets` to Cloudflare Pages.
- Customize `projectName` in the workflow and set `CF_PAGES_API_TOKEN` in GitHub secrets.

Notes

- The project already includes `@opennextjs/cloudflare`; we initialize the OpenNext dev integration in `next.config.ts` so you can use Cloudflare bindings during `next dev`.
- If you prefer Next on Pages for older Next versions, that path requires `@cloudflare/next-on-pages` and is not compatible with Next 16 used here.
