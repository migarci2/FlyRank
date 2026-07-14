# Decide Once: Build Your Identity Kit

Assignment: *Decide Once: Build Your Identity Kit* (General AI Fluency, Week 3)
Author: Miguel Garcia Roman
Live site it governs: **[migarci2.dev](https://migarci2.dev)**

The identity is already shipping on the real site — this is the kit written down so
every build stays consistent. One mood: **a terminal booted in deep space.** Dark,
pixel type, one amber signal; the work (projects, patches, the ⌘K terminal) is what
moves, the chrome stays quiet.

## Type (one font, on purpose)

| Role | Font | Why |
|------|------|-----|
| Everything (headings + body) | **Geist Pixel Square** | A pixel-grid monospace. It says *low-level / terminal* before a word is read — which is exactly the work (kernel, C/C++, CTF, agents). One face, no pairing to babysit. |

Free, from Vercel's `geist` package (OFL). Fallback: `ui-monospace, monospace`.

## Palette (dark, one accent)

| Token | Hex | Use |
|-------|-----|-----|
| `--bg` | `#0F0E0C` | Near-black, warm. The void. |
| `--ink` | `#F0E8D4` | Warm cream. Primary text. |
| `--muted` | `#8B8475` | Labels, nav, secondary. |
| `--dim` | `#5A5550` | Borders, hairlines, `//` markers. |
| `--accent` | `#E8B557` | **Amber.** The one signal color: prompt cursor, CTA, `-->`, selection. |

Four greys-of-warmth + one amber. The accent is scarce on purpose — it marks the
cursor, the primary CTA (`contact`), and the hover arrow, nothing else, so the eye
follows the action.

```css
:root {
  --bg:#0F0E0C; --ink:#F0E8D4; --muted:#8B8475; --dim:#5A5550; --accent:#E8B557;
}
::selection { background:#E8B557; color:#0F0E0C; }
```

**Data accents (charts/tags only):** each project/stat gets one hue so a row reads as
distinct without adding chrome — `#4A8FE7` blue, `#9B7DD4` purple, `#E0497A` pink,
`#E8B557` amber. Used only as a small `●` marker, never as backgrounds.

## Logo / favicon

[`favicon.svg`](./favicon.svg) — lowercase `m` in the pixel face plus an **amber block
cursor**, on the `--bg` tile. It reads as a command prompt (`m▮`), which is the whole
identity in 32px. Matches the nav wordmark `migarci2.dev _` (blinking amber `_`).

## Style note (pasted into the Claude Project)

> **Type:** Geist Pixel Square, one face for everything. **Palette:** bg `#0F0E0C`,
> text `#F0E8D4`, muted `#8B8475`, dim `#5A5550`, accent amber `#E8B557` (cursor/CTA
> only). **Mood:** a terminal in deep space — dark, pixel type, one amber signal,
> subtle motion (warp/glitch/pixel-burst) that never out-shouts the content.

In Project **FlyRank Backend Internship**, so every build-week prompt inherits it.

## Pass / revise — self-check

- **One or two fonts, not a pile** → one (Geist Pixel Square). ✓
- **Tight palette with real hex** → 5 core tokens + a small data-accent set, hex above. ✓
- **A simple logo/favicon exists** → `favicon.svg`, the `m▮` prompt. ✓
- **A single coherent mood that frames, not competes** → "terminal in deep space";
  amber restricted to the cursor/CTA so the work stays loudest. ✓ (live on migarci2.dev)
