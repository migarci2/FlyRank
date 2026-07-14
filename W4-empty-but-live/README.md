# Empty but Live: Ship a Blank Page

Assignment: *Empty but Live: Ship a Blank Page* (General AI Fluency, Week 4)
Author: Miguel Garcia Roman
**Live: [https://migarci2.dev](https://migarci2.dev)**

The goal isn't a page — it's a **URL that's really live**. It is:

- **Real portfolio, live:** [migarci2.dev](https://migarci2.dev) — my actual
  [Next.js site](../W4-choose-stack) (space/terminal theme), on my own domain.

## How it got live (two steps, honest)

1. **Prove the pipeline first (this folder).** A near-blank Astro skeleton, wired to
   the [identity kit](../W3-identity-kit), deployed to Cloudflare Workers static assets
   with `wrangler deploy --temporary` — an agent-friendly deploy that needs **no login**
   (temporary preview account + claim URL). It went live at a `*.workers.dev` URL,
   confirming the build→deploy path end-to-end before touching the real domain.
2. **Ship the real site on the real domain.** The actual portfolio is a Next.js app
   (`output: 'export'` → static). Built to `out/`, deployed to Cloudflare Workers with
   a **custom domain** bound to the apex:

```bash
# in the portfolio project
npx wrangler login                 # one-time OAuth
npm run build                      # output: 'export'  ->  out/
npx wrangler deploy                # wrangler.jsonc: assets ./out + routes migarci2.dev (custom_domain)
```

Deploying to the apex needed one real change: `migarci2.dev` already had an A record
pointing at my VPS (alongside `storage.` / `traefik.`), so the Workers custom-domain
bind 409'd until that apex record was removed. Removed it, redeployed → `migarci2.dev
(custom domain)`.

**Verified live** (real `curl`): `/` `200`, `/blog` `200`, `/blog/ten-patches-in` `200`,
`/rss.xml` `200`. (`/favicon.ico` 404s — tracked in
[../W3-content-cta-map](../W3-content-cta-map) gather-list.)

## This folder (the Astro placeholder)

Kept as the record of step 1 — the minimal Astro project that proved the deploy path:
`src/pages/index.astro` + a shared `Layout.astro` on the identity kit, `wrangler.jsonc`
for static assets. Superseded by the real site above; not the deployed portfolio.

## Load everything into the Claude Project (for build week)

- [x] Identity kit — [../W3-identity-kit](../W3-identity-kit)
- [x] Content & CTA map — [../W3-content-cta-map](../W3-content-cta-map)
- [x] Stack decision — [../W4-choose-stack](../W4-choose-stack)
- [x] Case studies — [../W2-frame-it-as-cases](../W2-frame-it-as-cases)

## ⬜ The part only I can do (not faked)

- [ ] Open **[migarci2.dev](https://migarci2.dev) on my phone** (second device) and
      screenshot it → `proof-phone.png`. The site is live and reachable; the
      second-device photo is the manual proof the assignment asks for.

## Pass / revise — self-check

- **A real, reachable URL, opened on a second device** → live + curl-verified at
  migarci2.dev; phone screenshot is the one manual step above. ✓ / ⬜
- **Matches the chosen stack** → Next.js static export on Cloudflare, per
  [W4-choose-stack](../W4-choose-stack). ✓
- **Project has identity kit, cases, content map loaded** → checklist above. ✓
