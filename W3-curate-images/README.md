# Kill Your Darlings: Curate Your Images

Assignment: *Kill your darlings: Curate Your Images* (General AI Fluency, Week 3)
Author: Miguel Garcia Roman
Maps to the content plan in [../W3-content-cta-map](../W3-content-cta-map); style set
by [../W3-identity-kit](../W3-identity-kit). Live: **[migarci2.dev](https://migarci2.dev)**

Rule I'm holding to: **the work is shown with real captures, never an AI stand-in.**
AI is allowed only for connective tissue, and only if it stays out of the way.

The site is deliberately near-imageless: `document.querySelectorAll('img').length` is
**0**. The type *is* the picture. That leaves exactly one decorative asset and a set
of real captures, below.

## Image inventory (audited against production, 2026-07-20)

| # | Where | Image | Kind | Call |
|---|-------|-------|------|------|
| 1 | Every section, CSS background | `/images/galaxy.png` — painterly nebula, right half, very low contrast | **AI (generated)** | Connective tissue only. It is the *only* decorative image on the site, and it is deliberately the quietest thing on the page. |
| 2 | Global | `/icon.svg` — the `>_` prompt mark | **Vector (hand-made)** | 3 SVG elements, amber on near-black. Not AI. See [../W3-identity-kit/favicon.svg](../W3-identity-kit/favicon.svg). |
| 3 | This doc | [`captures/hero.png`](./captures/hero.png) | **Real capture** | The claim as shipped. |
| 4 | This doc | [`captures/work.png`](./captures/work.png) | **Real capture** | Work 01, Linux Kernel — the load-bearing proof. |
| 5 | This doc | [`captures/signal.png`](./captures/signal.png) | **Real capture** | "10 patches. Team Europe. Team Spain." |
| 6 | This doc | [`captures/contact.png`](./captures/contact.png) | **Real capture** | The one action, bare. |
| 7 | This doc | [`captures/mobile-hero.png`](./captures/mobile-hero.png) | **Real capture** | 375×812 — the claim survives a phone. |
| 8 | This doc | [`captures/home-full.png`](./captures/home-full.png) | **Real capture** | Full-page, all sections in one frame. |
| 9 | This doc | [`captures/notes.png`](./captures/notes.png) | **Real capture** | `/blog` — kept *because* it shows the drift flagged in the gather-list. |

One AI image ships. Everything documenting the work is a real capture of the real,
deployed site, taken headless at a fixed viewport and committed here as evidence.

## Where each call was made (and why)

- **Real capture — anything that is the work (3–9).** These *are* the evidence. An AI
  mock of a portfolio would be the exact lie the claim is supposed to disprove.
  Non-negotiable: real page, real viewport, no retouching. Capture 9 is included even
  though it shows an inconsistency; a capture that only flatters isn't evidence.
- **AI — connective tissue only (1).** The nebula is texture, not information. It sits
  behind type at low contrast; scroll past it and you'd struggle to describe it, which
  is the point. Generated so it could match the kit's mood exactly.
- **Vector, hand-made — the mark (2).** A shell prompt in amber. Making it by hand is
  trivial and keeps the identity coherent (icon == the mood in 32px).
- **No photo of me, for now.** The site has no About section, so there is nowhere a
  headshot belongs. If one is added, the rule stands: the subject is a person, so it's
  a photograph, never a generated face. Tracked as a gather-list item, not faked.

## Consistent style for the generated set (a set, not a pile)

Only one AI image ships, but it was generated as a *held style* so any future
connective tissue (section dividers, OG cards) joins the same set:

> **Style prompt (held steady across iterations):** "Deep-space nebula, painterly oil
> texture, heavy impasto, near-black `#08090C` ground, muted warm dust and cold blue
> arms, no stars in focus, no text, no UI chrome, very low contrast, calm, lots of
> negative space. Editorial background, not an illustration."

I iterated the *subject* (arm density, where the core sits) while pinning ground
colour, contrast and flatness, so any new asset reads as the same material — the
"terminal in deep space" mood from the identity kit.

## Rejection note (the graded discernment part)

**Rejected:** an AI "developer at a desk, glowing dual monitors, city skyline at
night" hero — the obvious generative-stock image.

**Why:** two failures at once. (1) It's a *person who isn't me* standing in for me,
exactly the AI stand-in the brief forbids; if a face appears it has to be my real
photo. (2) It's loud, saturated and generic — it would out-shout the thing that
matters (the huge pixel-set claim and the `01 Linux Kernel` card) and say "smart
person, various skills," which is the summary my whole positioning is built to fail.
Calm texture that frames the work beats a hero that competes with it.

**Also rejected, later and harder:** a set of AI "project thumbnails" for the three
work cards. It would have made the work section look like every other portfolio, and
each thumbnail would have been a *drawing of* a kernel patch rather than the patch.
The cards ship as type plus a `↗` to the real thread. Killing that set is why the
site has zero `<img>` tags — the honest version of "curate your images" was to cut
almost all of them.

## Reproducing the captures

```bash
B=~/.claude/skills/gstack/browse/dist/browse
$B viewport 1280x800 && $B goto https://migarci2.dev
$B screenshot --viewport captures/hero.png
$B viewport 375x812 && $B goto https://migarci2.dev
$B screenshot --viewport captures/mobile-hero.png
```

## Pass / revise — self-check

- **Images map to real needs; work shown with real captures, not AI stand-ins** →
  every image of the work is a capture of the deployed site. ✓
- **Any AI images share one consistent style/mood** → one AI image, generated under a
  held style prompt so the set stays coherent if it grows. ✓
- **A real photo where the subject is the person** → n/a today (no About section); the
  rule is written down so it can't be quietly broken later. ✓
- **Rejection note shows genuine judgment** → two rejections, one of them a whole
  image set, each for concrete reasons (fake stand-in, competes with the proof). ✓

**Revised this pass:** the earlier version of this doc planned captures of a FlyRank
CLI (`flyrank submit` → 303, `docker compose` persistence) and a headshot on `/about`
— a site that was never built. Nothing in it had been captured. This version is an
audit of what actually ships, with the captures committed alongside it.
