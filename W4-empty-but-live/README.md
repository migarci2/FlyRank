# Empty but Live: Ship a Blank Page

Assignment: *Empty but Live: Ship a Blank Page* (General AI Fluency, Week 4)
Author: Miguel Garcia Roman
Stack chosen in [../W4-choose-stack](../W4-choose-stack): **Astro → Cloudflare Pages**.

The goal isn't a page — it's a **URL that's really live**. This folder is the empty
Astro project, already wired to the [identity kit](../W3-identity-kit) so build week
inherits fonts, colors, and favicon for free.

## What's scaffolded

```
package.json            astro, static build
astro.config.mjs        static output (no adapter/server)
src/layouts/Layout.astro  the one shared layout: fonts + colors + favicon, written once
src/pages/index.astro   near-blank home: name + one-line claim
public/favicon.svg      the mg monogram from the identity kit
```

`Layout.astro` is exactly why Astro beat plain HTML in the stack decision: head,
fonts, and palette live in one file instead of being copy-pasted into every page.

## Run it locally

```bash
npm install
npm run dev       # http://localhost:4321  — near-blank but real
npm run build     # -> dist/  (static files Cloudflare will serve)
```

## Deploy (free) — Cloudflare Pages via wrangler

```bash
npm run build                                               # -> dist/
npx wrangler login                                          # one-time OAuth
npx wrangler pages deploy dist --project-name=miguel-portfolio
# -> https://miguel-portfolio.pages.dev  (creates the project on first deploy)
```

Every re-run redeploys. `wrangler` is already a devDependency.

*(Note: Cloudflare's new unified `cf` CLI is in early technical preview and its
static/Pages deploy isn't ready yet — it forces an undocumented experimental
`cloudflare.config.ts`. `wrangler pages deploy` is the mature path today. Netlify /
GitHub Pages / Vercel would work the same way.)*

## ⬜ The part only I can do (not faked)

The assignment's proof is a **live URL opened on a second device**. That's a manual
step — recorded honestly here rather than claimed:

- [ ] Deploy and paste the live URL: `https://__________.pages.dev`
- [ ] Open that URL **on my phone** (not the laptop) and screenshot it → `proof-phone.png`
- [ ] Confirm the favicon + fonts load on mobile

## Load everything into the Claude Project (for build week)

Drop these into Project **FlyRank Backend Internship** so next week has one source
of truth:

- [ ] Identity kit — [../W3-identity-kit](../W3-identity-kit) (style note already pasted)
- [ ] Case studies — [../W2-frame-it-as-cases](../W2-frame-it-as-cases)
- [ ] Content & CTA map — [../W3-content-cta-map](../W3-content-cta-map)
- [ ] Image plan — [../W3-curate-images](../W3-curate-images)

## Pass / revise — self-check

- **A real, reachable URL, opened on a second device** → deployable now; live-URL +
  phone screenshot are the manual step tracked above. ⬜ (mine to finish)
- **Matches the chosen stack** → Astro on Cloudflare Pages, per W4-choose-stack. ✓
- **Project has identity kit, cases, content map loaded** → checklist above. ⬜
