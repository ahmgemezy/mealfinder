import type { OpenNextConfig } from "@opennextjs/cloudflare";

export default {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  // Externalize heavy dependencies to reduce bundle size
  edgeExternals: [
    "node:crypto",
    "google-translate-api-x",
    "@anthropic-ai/sdk",
    "openai",
    "sharp",
  ],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  // Minification settings
  dangerous: {
    disableIncrementalCache: true,
    disableTagCache: true,
  },
} satisfies OpenNextConfig;
