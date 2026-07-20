# The Through-Line: Map Content & CTAs

Assignment: *The Through-Line: Map Content & CTAs* (General AI Fluency, Week 3)
Author: Miguel Garcia Roman
Live: **[migarci2.dev](https://migarci2.dev)** · identity: [../W3-identity-kit](../W3-identity-kit)
· captures: [../W3-curate-images/captures](../W3-curate-images/captures)

## The one claim (memorable, not a paragraph)

> **systems. security. intelligence.**
> *I build close to the machine.*

That's the hero, verbatim. The through-line under it: **low-level engineering
translated into usable tools.** Everything on the page ladders up to one action from
Chapter 1: **email me.**

## Content map (ordered sections + CTA) — as shipped

One page, three moves: claim → proof → ask. The nav is three words (`work`, `notes`,
`hello`) and one of them is already the CTA.

1. **Hero** — `MIGUEL GARCÍA ROMÁN · SPAIN`, the three-word claim set huge in the
   pixel face, the one-line sub, a painterly nebula held far back at low contrast.
   → **CTA: `scroll ↓` (amber) → `#work`.** Nav `hello` (mailto) is the standing ask.
2. **Selected work (`#work`)** — the proof, strongest first, one project per screen,
   each an outbound link. **01 Linux Kernel** — "Ten patches, upstream." (C · Linux ·
   LFX mentorship) → the real `lore.kernel.org` thread. **02 ProofMesh** —
   "Mathematics, made collaborative." (Lean 4 · AI · open source). **03 agenctf** —
   "Agents for real security work." (Python · security · local first).
   → **CTA: each card `↗` → the repo / the kernel thread.**
3. **Signal / proof** — three lines, no prose: **10 patches. Team Europe. Team Spain.**
   → **CTA: `view the work ↗` → GitHub.**
4. **Contact** — kicker `NEXT SIGNAL`, then "Let's build something real." The palette
   **inverts here** (dark type on `--paper`): the page goes bright exactly where it
   asks. Three bare links, nothing else on screen.
   → **CTA: `email` (mailto, primary) · `github` · `linkedin`.**

Off the main page: **`notes` → /blog** (`ten-patches-in`, `agents-that-do-ctf`,
`why-i-use-lean-for-real`, plus RSS).

## The CTA ladder (every rung → the one action)

```
Hero            →  scroll ↓  (into the proof)   ·  nav: hello (mailto), standing
Work 01/02/03   →  the repo / the kernel thread  ↗
Signal          →  view the work ↗   (proof, no ask — it earns the contact)
Contact         →  email  (the action, restated bare)  ·  github · linkedin
```

No rung invents a new destination: no newsletter, no "book a call", no contact form.
Every outbound link is either the work itself or the mailbox. `github` and `linkedin`
in the footer are the only secondary exits, and both are more proof.

## Gather-list (honest — sharpeners, not blockers)

Checked against production on 2026-07-20:

- [ ] **`/blog` still runs the previous shell** — old nav (`work · game · blog ·
      contact`) and the old `⌘K` affordance, which contradicts the three-word nav on
      the new home. Port it or drop `notes` from the nav until it's ported. **Highest
      value item on this list.**
- [ ] **`/favicon.ico` still 404s.** `/icon.svg` is served and correct, but older
      crawlers and some feed readers ask for `.ico`. One file.
- [ ] **Per-project proof on the cards** — 01 links to a `lore` search; a merge count
      or a one-line result inline would land it without a click.
- [ ] **A CV link in contact** — the signal section cites the record, nothing links it.
- [ ] **A live demo** for ProofMesh/agenctf where one exists (else keep the repo link).
- [ ] **Internship work** (FlyRank BE-auth, scraper) becomes a fourth card only when
      it's worth showing publicly. Leave the slot, don't pad.

## Pass / revise — self-check

- **Single memorable claim, not a paragraph** → "systems. security. intelligence." ✓
- **Every page: ordered sections + a named CTA; strongest work leads** → yes; work
  leads with the upstream kernel contribution. ✓
- **CTAs ladder up to the one Chapter-1 action** → every rung resolves to email or to
  the work; no competing destinations. ✓
- **Honest gather-list, build not blocked** → six items, two of them real defects
  found by re-checking production, not guesses. ✓

**Revised this pass:** the previous map described a build with a terminal panel, a
`⌘K` palette, an odometer stats row and a game section. The site has since been
rebuilt and none of that is on the home page. This version is written from the
deployed DOM (links, headings, computed CSS), not from memory.
