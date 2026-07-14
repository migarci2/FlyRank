# Decide Once: Build Your Identity Kit

Assignment: *Decide Once: Build Your Identity Kit* (General AI Fluency, Week 3)
Author: Miguel Garcia Roman
Claim it frames: see [../W1-what-are-you-proving](../W1-what-are-you-proving)

The whole point: decide the look once so the build weeks don't re-litigate it, and
keep it calm enough that the loudest thing on the page is the work — the terminal
screenshots and the code, not the chrome around them.

## Type (two fonts, both free)

| Role | Font | Weight | Why |
|------|------|--------|-----|
| Heading | **IBM Plex Mono** | 500 | Monospaced headings read as *terminal*. My claim is "I read the wire and ship the CLI" — the type says it before a word does. |
| Body | **Inter** | 400 / 500 | Plain, high-legibility grotesque. Gets out of the way so a reviewer reads the case, not the font. |

Both on Google Fonts (SIL Open Font License). Two families, not a pile — mono for
the few big lines, Inter for everything you actually read.

## Palette (4 colors, calm on purpose)

| Token | Hex | Use |
|-------|-----|-----|
| `--bg` | `#FBFBF9` | Near-white, faintly warm — paper, not glare. |
| `--ink` | `#17181B` | Near-black. All body text. |
| `--brand` | `#1F3A5F` | Deep slate blue. Headings, the monogram, links. The one "color." |
| `--accent` | `#15803D` | Muted green. Used *once per page* — the primary CTA / the "it works" signal. |

The accent isn't decoration: green is the `303` my portal CLI returns on a real
submit (my proof statement's punchline). It marks the one thing I want clicked and
nothing else, so a single button is the only loud pixel on a quiet page.

```css
:root {
  --bg:     #FBFBF9;
  --ink:    #17181B;
  --brand:  #1F3A5F;
  --accent: #15803D;
}
```

## Logo / favicon

[`favicon.svg`](./favicon.svg) — an `mg` monogram set in the heading font (IBM Plex
Mono) on a `--brand` tile, rounded corners, near-white glyphs. Lowercase, no
gradient, no icon-of-a-thing. It's just my initials in my own type — which means
the favicon and the H1 are visibly the same identity. SVG so it's crisp at any
size and needs no PNG export step.

## Style note (pasted into the Claude Project)

> **Type:** IBM Plex Mono (headings, 500) + Inter (body, 400). **Palette:** bg
> `#FBFBF9`, ink `#17181B`, brand slate-blue `#1F3A5F`, accent green `#15803D`
> (one CTA per page only). **Mood:** a terminal at rest — calm, monospaced,
> lots of whitespace; the work (screenshots, code) is the only loud thing, the
> page never competes with it.

Added to Project **FlyRank Backend Internship** custom instructions, so every
build-week prompt inherits it and the site stays one coherent thing across the
eight weeks instead of drifting per page.

## Pass / revise — self-check

- **One or two fonts, not a pile** → two (IBM Plex Mono + Inter). ✓
- **Tight palette with real hex** → four tokens, hex above. ✓
- **A simple logo/favicon exists** → `favicon.svg`, monogram in the heading font. ✓
- **A single coherent mood that frames, not competes** → "terminal at rest";
  accent restricted to one CTA so nothing out-shouts the work. ✓
