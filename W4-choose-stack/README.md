# Three Roads: Choose Your Stack with AI

Assignment: *Three Roads: Choose Your Stack with AI* (General AI Fluency, Week 4)
Author: Miguel Garcia Roman

## The constraints I gave the model (before asking for options)

- **Free only.** No paid hosting, no paid tier to stay live.
- **Honest skill level.** Strong backend/CLI; competent but not expert front-end.
  I'd rather maintain less HTML than debug someone's component framework.
- **What the portfolio must do.** Four pages ([the content map](../W3-content-cta-map)):
  home, work (3 cases), about, contact. Mostly static text.
- **How my work must be shown.** The work *is* code and terminal output — the
  FlyRank CLI, BE-01/BE-04/BE-auth, the scraper. It needs **legible, syntax-
  highlighted code blocks and clean screenshots**, or the proof doesn't land.
- **Calm identity.** Must respect [the identity kit](../W3-identity-kit): two fonts,
  four colors, work is the loudest thing.

## Three genuine options (simplest → most powerful)

### 1. Plain HTML + CSS on GitHub Pages *(simplest)*
Hand-written `.html`, push to a repo, Pages serves it. No build, no dependencies.
- **For:** nothing to maintain, nothing to break, deploys by `git push`. Maximally
  on-brand with my "no framework" stance.
- **Against:** four pages share a header/footer/`<head>` I'd have to **copy into
  every file** and keep in sync by hand. And code blocks would need **hand-rolled
  highlighting** (or none) — exactly the thing my portfolio most needs to look good.
  The "lazy" choice here actually creates *more* recurring work.

### 2. Astro on Cloudflare Pages *(middle — the front-runner)*
Static-site generator. Writes pages/components, builds to **plain static HTML/CSS,
zero client JS by default**. Ships **Shiki** syntax highlighting at build time.
- **For:** one `Layout.astro` = header/head/footer written once. Free Shiki
  highlighting for every code block (build-time, no runtime cost). Content
  collections fit "3 cases" cleanly. Output is still just static files — same
  hosting simplicity as option 1, none of the duplication. Cloudflare Pages: free,
  fast, `git push` to deploy.
- **Against:** a real `node_modules` + build step exists; a dependency to update
  occasionally. That's the whole cost.

### 3. Next.js on Vercel *(most powerful)*
React framework with SSR/ISR, API routes, the works.
- **For:** could do anything later — dynamic content, a real backend, auth.
- **Against:** a **server and a heavy framework** to maintain for a **4-page static
  site**. React churn, build config, and features I'd carry without using. This is
  the over-build my whole positioning argues against — I'd be maintaining a
  production app to show three case studies.

## Pressure-test on the front-runner (Astro)

- **What breaks if I pick the simplest (plain HTML)?** I hand-sync four `<head>`s
  and four navs, and either ship un-highlighted code or hand-color it. The one thing
  my portfolio must do well — show code — is the thing plain HTML does worst.
- **What do I maintain if I pick the most powerful (Next.js)?** A Node server's
  worth of framework, for content that never changes at request time. All cost, no
  payoff at this size.
- **Can I finish in two weeks?** Yes — Astro is HTML + a bit of frontmatter; the
  content is already written ([W2 cases](../W2-frame-it-as-cases),
  [W3 content map](../W3-content-cta-map)). Days, not weeks.
- **Does it show my work the way it needs to be shown?** Best of the three:
  build-time Shiki means my CLI and server code render like they do in an editor,
  and screenshots drop into a shared layout. That's the deciding factor.

## Decision + rationale (my words)

**Chosen: Astro on Cloudflare Pages.**

I build backends with no framework and I stand by that — but a *content* site is a
different problem. Here the enemy isn't "too much framework," it's **duplication and
hand-maintained highlighting** across four pages. Astro removes both while still
compiling down to the same static files plain HTML would give me. It's the option
that's lazy in the way that counts: write the layout and the highlighting *once*,
never re-sync them.

- **Plain HTML — rejected:** simplest to start, but "copy the nav into four files
  and hand-color the code" is recurring work the whole point of my portfolio would
  suffer from. Cheaper today, more expensive every edit.
- **Next.js — rejected:** a server and a framework to maintain for a static
  brochure. It's the exact over-engineering I criticize in my own case studies; I'd
  be contradicting my proof statement to ship it.

**Can I maintain this?** Yes — and that's why it wins. After the build, it's static
files on free hosting; the only upkeep is an occasional `npm update`, which is far
less than hand-syncing HTML forever. It fits my skill level (mostly HTML + a little
frontmatter, no React required) and my time budget.

**Does it show my work well?** Yes — build-time syntax highlighting and a consistent
layout are precisely what make code and terminal output read as *proof* rather than
decoration. That's the criterion I optimized for.

## The backend question (honest)

**Does the portfolio need a backend? Not yet — correctly not.** The site is static:
four pages of text, code, and images. My *backend* work is shown **as case studies**
(with real repos to click), not run live on the site. Standing up a server just to
serve a static portfolio would be theater — and would undercut the exact judgment
("don't build what the job doesn't need") I'm trying to demonstrate. If a live demo
ever earns its place (e.g. the BE-auth service running behind a "try it" button),
I'll add it then, as its own thing — not by rebuilding the whole site on a server now.

## Pass / revise — self-check

- **Three genuine options with trade-offs, not one answer obeyed** → HTML/Pages,
  Astro/Cloudflare, Next.js/Vercel, each with real for/against. ✓
- **Chosen stack is free, matched to real needs, shows my kind of work** → Astro,
  free, build-time code highlighting for a code-heavy portfolio. ✓
- **Rationale in my own words, includes "can I maintain this"** → yes, and it's the
  deciding argument. ✓
- **Backend question answered honestly** → "not yet," with the reason. ✓
