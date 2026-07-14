import { defineConfig } from "astro/config";

// Static output — Cloudflare Pages just serves the built files. No adapter,
// no server. Set `site` to your real URL once you have it (used for canonical
// links + sitemap later).
export default defineConfig({
  // site: "https://<your-project>.pages.dev",
});
