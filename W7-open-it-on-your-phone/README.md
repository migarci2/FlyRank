# Open It on Your Phone

Assignment: *Open It on Your Phone* (General AI Fluency, Week 7)
Author: Miguel Garcia Roman
Live: **[migarci2.dev](https://migarci2.dev)**

---

## How I audited

Headless Chromium at 375×812 (iPhone-class viewport) against **production**, not
a resized desktop window: full-page screenshots of `/`, `/blog`, `/kernel`, a
programmatic horizontal-overflow check on every route, a tap-target sweep
measuring every `<a>`/`<button>` hit box, and computed-contrast checks on the
dimmest text (the uppercase labels and card metadata).

Then the part a headless browser can't do — **the real phone check is the same
ritual as W4's `proof-phone.jpeg`**: opened on an actual phone over mobile data.
_[Slot: fresh phone screenshot after this round of fixes.]_

## What was fine (checked, not assumed)

- **No horizontal overflow anywhere**: `scrollWidth === innerWidth` (375) on
  `/`, `/blog`, `/kernel`. Nothing leaks off-canvas.
- **Contrast passes**: the dimmest text (labels, card metadata,
  `rgb(133,133,127)` on `#0F0E0C`) measures ≈ 5.3:1 — above the 4.5:1 AA bar.
  The hero, body and footer text are far above it.
- **Images crisp**: the only raster image is the galaxy background (decorative,
  low-contrast by design); everything else is font-rendered and sharp at any DPR.
- **All links work**: nav, three project cards (kernel thread / repos), blog
  posts, RSS, email, GitHub, LinkedIn, CV — every one checked on the live site.

## Fix log (what was actually broken → what changed)

1. **Tap targets way under 44px.** Measured: nav links 17px tall, footer links
   23px, `send one ↗` 23px, `scroll ↓` 16px. Fine for a cursor, hostile for a
   thumb. → Fix: `@media (pointer: coarse)` rule that expands every tappable
   element's hit area by 12px in all directions via an `::after` overlay —
   pseudo-element instead of padding because padding would have dragged the
   underline borders 12px below the text (tried mentally, rejected visually).
   Zero visual change, ≥44px hit boxes, and it keys off *pointer type*, not
   screen width — a small phone and a large tablet both get it.
2. **`⌘K` command-palette hint shown on phones** (on `/blog`, a leftover from
   the old shell). There is no Cmd key on a phone; the hint is noise at best.
   → Fix: hidden below the `sm` breakpoint (`hidden sm:inline`). The full
   blog-shell port stays on the [still-ugly list](../W5-ship-the-ugly-one) —
   this fix is surgical on purpose.
3. Verified both fixes on **production** after deploy: `pointer:coarse` present
   in the served CSS, the palette hint absent from the served `/blog` HTML at
   mobile width.

## Pass / revise — self-check

- **Genuinely works on mobile, checked on a real phone** → audit done on real
  production at phone viewport; the physical-phone screenshot slot is pending
  (same proof ritual as W4). ⚠ one photo pending
- **Text readable, contrast passes, images crisp** → measured, listed above. ✓
- **All links work, nothing broken on any width** → link sweep + overflow check
  on every route. ✓
- **Fix log shows real problems found and fixed** → two real defects, both
  fixed and verified live, one deliberately-scoped partial (⌘K vs full port). ✓
