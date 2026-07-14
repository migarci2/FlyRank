# The Through-Line: Map Content & CTAs

Assignment: *The Through-Line: Map Content & CTAs* (General AI Fluency, Week 3)
Author: Miguel Garcia Roman
Builds on the sitemap in [../W1-draw-the-path](../W1-draw-the-path) and the cases in
[../W2-frame-it-as-cases](../W2-frame-it-as-cases).

## The one claim (memorable, not a paragraph)

> **Give me an undocumented backend. I'll hand you the small tool that tames it.**

Everything below ladders up to a single action from Chapter 1:
**read one repo, then email me.**

## Content map (ordered sections + one named CTA per page)

Strongest work leads everywhere. Four pages, no more.

### `/` — Home
1. **Hero** — the claim, plus one *verifiable* proof line above the fold:
   "Built a working CLI against an app that publishes no API — by reading its
   Server-Action traffic. It submits; the server returns 303."
2. **Three cases** — one line each, linking into `/work`. Strongest first
   (the FlyRank CLI).
3. **Quiet footer** — GitHub + email.
   → **CTA: "Read a repo, then email me"** (the accent-green button; the only loud
   pixel — see [../W3-identity-kit](../W3-identity-kit)).

### `/work` — Cases (the proof)
1. **Case 1 — CLI for a system with no API** (FlyRank portal). Leads; it's the
   sharpest evidence.
2. **Case 2 — BE-01, the smallest honest API.**
3. **Case 3 — BE-04, swap the store without touching the service.**
   Each case: problem · what I decided · what came of it (already written in W2).
   → **CTA: "See the repo"** (per case, → GitHub) then "Email me about this one."

### `/about` — Short
1. **Who this is for** — a founding/early backend engineer at a small AI company.
2. **Why I build small** — one paragraph, the no-framework stance.
   → **CTA: "Email me"** (secondary, text link).

### `/contact` — The one action
1. **One line + email + GitHub.** No nine-field form.
   → **CTA: "Email me"** (the primary action, restated plainly).

## The CTA ladder (every rung points at the one action)

```
Home hero  →  "Read a repo, then email me"   (the ask, stated once, up top)
Case page  →  "See the repo"  →  "Email me about this one"   (proof, then ask)
About      →  "Email me"      (soft restate)
Contact    →  "Email me"      (the action, bare)
```

No rung invents a new destination (no "subscribe," no "book a call," no download).
Every CTA is the same action at a different level of proof — the reviewer is always
one click from `email me`, and never asked to do anything else.

## Gather-list (honest — so build week isn't blocked)

Proof I still need to capture before the site goes live:

- [ ] **CLI screenshots** — `list`, `show`, and a real `submit` showing the **303**.
      *(Have the tool; need clean terminal captures — see
      [../W3-curate-images](../W3-curate-images).)*
- [ ] **BE-01 curl output** — a 2xx from `/hello` and `/time`. *(Have the code;
      need the capture.)*
- [ ] **BE-04 proof** — `docker compose up` + a shot proving data survives a
      restart (named volume). *(Code done; need the terminal capture.)*
- [ ] **Live repo links** — public URLs for each case. *(Repo is
      `github.com/migarci2/FlyRank`; may split the CLI into its own repo so the
      "read one repo" ask points at exactly one thing.)*
- [ ] **Headshot** — one real photo for `/about`. *(Not yet taken.)*
- [ ] **Internship work not finished yet** — Auth (Week 4) and any later capstone
      become Case 4+ once shipped; leave a placeholder slot in `/work`, don't fake
      it.

Nothing here blocks structure — the map stands; these are captures and links to
drop into named slots.

## Pass / revise — self-check

- **Single memorable claim, not a paragraph** → one line, above. ✓
- **Every page: ordered sections + a named CTA; strongest work leads** → yes, and
  Case 1 (the CLI) leads Home and Work. ✓
- **CTAs ladder up to the one Chapter-1 action** → all rungs resolve to "email me";
  no competing destinations. ✓
- **Honest gather-list, build week not blocked** → checkbox list above, incl.
  unfinished internship work as future cases. ✓
