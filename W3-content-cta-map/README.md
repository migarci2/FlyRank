# The Through-Line: Map Content & CTAs

Assignment: *The Through-Line: Map Content & CTAs* (General AI Fluency, Week 3)
Author: Miguel Garcia Roman
Live: **[migarci2.dev](https://migarci2.dev)** · identity: [../W3-identity-kit](../W3-identity-kit)

## The one claim (memorable, not a paragraph)

> **Systems, security and AI agents.**

The through-line under it, in one line: **low-level engineering translated into usable
tools.** Everything on the page ladders up to one action from Chapter 1: **email me.**

## Content map (ordered sections + CTA) — as shipped

Single page, strongest work leads. Real sections, in order:

1. **Hero** — the claim + one honest sub ("Computer Engineering student building
   open-source products on C/C++, Linux, reverse engineering, agent automation"), a
   live **terminal panel** (type `help`), and a `⌘K` command palette.
   → **CTA: `contact` (mailto)** — the amber primary button. Secondary: `github`.
2. **Live stats** — real receipts, odometer-counted on scroll: **10** kernel patches
   upstream · **400+** applicants beat to LFX · **4** shipped OSS projects · **5**
   competitive-security receipts.
3. **Work (`#work`)** — the proof. Strongest first, each links to the real repo/thread:
   **Linux Kernel** (LFX, 10 upstream patches) · **ProofMesh** (AI + formal methods,
   Lean 4) · **agenctf** (agent infra for CTF) · **webserv** (C++ HTTP/1.1 server).
   → **CTA: each card → the repo/thread.**
4. **Game (`#game`)** — a WarpRunner easter egg (+ Konami). Personality, one scroll.
5. **Signals (`#signals`)** — ICC 2026 (Team Europe winner), ECSC Team Spain 2025,
   Linux Kernel contributor, Uniswap Hookathon prize, Rektoff Solana bootcamp.
6. **Blog** — `ten-patches-in`, `agents-that-do-ctf`, `why-i-use-lean-for-real` (+ RSS).
7. **Contact** — the one action, bare.
   → **CTA: `contact` (mailto), `github`.**

## The CTA ladder (every rung → the one action)

```
Hero      →  contact  (amber primary)   ·  github (secondary)  ·  ⌘K / terminal (the curious)
Work card →  see the repo / kernel thread
Signals   →  (proof, no ask — earns the contact)
Contact   →  contact  (the action, restated bare)
```

No rung invents a new destination (no newsletter, no "book a call"). The reader is
always one step from **email**; the terminal/⌘K are play, not detours.

## Gather-list (honest)

The site ships with **real** content already — the list is what would sharpen it, not
blockers:

- [ ] **Per-project proof** — a screenshot or one-line result on each card (the kernel
      `lore` thread link is there; add a patch count / merge status inline).
- [ ] **A résumé/CV link** in contact (the stats cite it; link it).
- [ ] **A live demo** for ProofMesh/agenctf where one exists (else keep the repo link).
- [ ] **favicon.ico** — the deployed site 404s `/favicon.ico`; add an icon file.
- [ ] **Internship work** (FlyRank BE-auth, scraper) becomes a project card once it's
      worth showing publicly; leave a slot, don't pad.

## Pass / revise — self-check

- **Single memorable claim, not a paragraph** → "Systems, security and AI agents." ✓
- **Every page: ordered sections + a named CTA; strongest work leads** → yes; Work
  leads with the Linux Kernel contribution. ✓
- **CTAs ladder up to the one Chapter-1 action** → all resolve to `contact`; no
  competing destinations. ✓
- **Honest gather-list, build not blocked** → above; the site is already live, these
  are sharpeners. ✓
