# Decide Once: Build Your Identity Kit

Assignment: *Decide Once: Build Your Identity Kit* (General AI Fluency, Week 3)
Author: Miguel Garcia Roman
Live site it governs: **[migarci2.dev](https://migarci2.dev)**

The identity is shipping — this is the kit written down, **read back off the live
site** so the doc can't drift from the build. One mood: **a terminal booted in deep
space.** Dark, pixel type, one amber signal; the work is what moves, the chrome
stays quiet.

## Type (one font, on purpose)

| Role | Font | Why |
|------|------|-----|
| Everything (headings + body) | **Geist Pixel Square** | A pixel-grid monospace. It says *low-level / terminal* before a word is read — which is exactly the work (kernel, C/C++, CTF, agents). One face, no pairing to babysit. |

Free, from Vercel's `geist` package (OFL). Fallback chain as shipped:
`GeistPixelSquare, "Geist Mono", ui-monospace, SFMono-Regular, monospace`.

## Palette (dark, one accent) — the tokens actually in `:root`

| Token | Hex | Use |
|-------|-----|-----|
| `--ink` | `#08090C` | Near-black, cold. The void (page background). |
| `--paper` | `#EEEADD` | Warm off-white. Primary text. |
| `--muted` | `#85857F` | Labels, nav, kickers, secondary. |
| `--line` | `#EEEADD29` | Hairlines and rules — `--paper` at 16% alpha, never a new colour. |
| `--signal` | `#E8B557` | **Amber.** The one accent: `01/02/03` indices, `↗` arrows, `scroll ↓`, the reading-progress bar, the icon cursor. |

```css
:root {
  --ink:#08090C; --paper:#EEEADD; --muted:#85857F;
  --line:#EEEADD29; --signal:#E8B557; color-scheme: dark;
}
```

Naming note: `--ink`/`--paper` are named after the *material*, not the role, because
the page **inverts on the last section**: everything up to `signal` is `--paper` on
`--ink`; the contact section flips to `--ink` on `--paper`. Same two tokens, swapped.
That flip is the only "second theme" in the design, and it lands exactly where the
one action is — the page goes bright when it asks. Three greys plus one amber.
The amber is scarce on purpose: it only marks position (index, progress) and
outbound action (`↗`, `scroll ↓`), so the eye follows the work.

## Logo / favicon

[`favicon.svg`](./favicon.svg) — the exact file the site serves at `/icon.svg`: an
amber chevron `>` over an amber underscore on a `#0F0E0C` tile. It reads as a shell
prompt `>_`, which is the whole identity in 32px, and it's hand-written SVG (three
elements), not generated.

Wordmark: `MIGARCI2`, letter-spaced caps, `--paper`, top-left, always present.

## Style note (pasted into the Claude Project)

> **Type:** Geist Pixel Square, one face for everything, wide letter-spacing on caps
> labels. **Palette:** ink `#08090C`, paper `#EEEADD`, muted `#85857F`, line
> `#EEEADD29`, signal amber `#E8B557` (indices, arrows, progress only). **Mood:** a
> terminal in deep space — dark, pixel type, one painterly nebula held far back at
> low contrast, motion that never out-shouts the type.

In Project **FlyRank Backend Internship**, so every build-week prompt inherits it.

## Pass / revise — self-check

- **One or two fonts, not a pile** → one (Geist Pixel Square). ✓
- **Tight palette with real hex** → 5 tokens, copied out of the live `:root`. ✓
- **A simple logo/favicon exists** → `favicon.svg`, the `>_` prompt, live. ✓
- **A single coherent mood that frames, not competes** → "terminal in deep space";
  amber restricted to index/arrow/progress so the work stays loudest. ✓

**Revised this pass:** the kit previously documented an `m▮` monogram, a warmer
palette (`#0F0E0C` / `#F0E8D4` / `#5A5550`) and a four-hue "data accent" set — all
from an earlier build, none of it in production. Tokens and icon are now read
straight off the deployed site; see the captures in
[../W3-curate-images/captures](../W3-curate-images/captures).
