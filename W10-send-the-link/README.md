# Send the Link: Launch, Demo & Story

Capstone: *Send the Link: Launch, Demo & Story* (General AI Fluency, Week 10)
Author: Miguel Garcia Roman
The link: **[https://migarci2.dev](https://migarci2.dev)**

---

## How the next case study gets added (concrete, not an intention)

Where it goes: a project card in the **work section of migarci2.dev** — the
projects live as a data array in `app/page.tsx` (name, one-liner, meta, link),
each card pointing at a real repo or a case page like `/kernel`.

The steps, start to finish (~an evening, because the pipeline already exists):

1. Write the case in the **Week-2 three-beat shape** — *the problem · what I
   did/decided · what came of it* — as the repo's README (or a site page like
   `/kernel` when it deserves one).
2. Add one entry to the `projects` array in `app/page.tsx`, deep-linked to that
   repo — never to the profile root (a lesson the
   [Week-7 crit](../W7-survive-the-crit) paid for).
3. `npm run build && npx wrangler deploy` in `~/Desktop/Projects/migarci2.dev`
   — live in under a minute. What that actually does, in my own words:
   [W6 explainer](../W6-explain-it-like-you-built-it).

## The next real piece of work, named

**Publish the FlyRank portal CLI as a public wire-reading case study.** It's
the strongest proof of my Chapter-1 statement that exists and it's currently
private: a portal with no public API → decoded the Auth.js session cookie out
of the browser keyring, decoded Next.js flight payloads, scraped the
submission action per run → a CLI that reads briefs and submits deliverables,
and **survived a portal migration** (Server Actions → REST endpoint) mid-
internship. The Week-7 crit called exactly this artifact the missing piece
(must-fix #4). Repo, README in the three-beat shape, card on the site.

## The reminder is real, not a vow

A **scheduled cloud routine** now runs on the 1st of every month at ~09:00
(Europe/Madrid): it fetches migarci2.dev, checks whether the portal-CLI case
study card is live, and if not, nudges me with the exact steps above; once the
card ships, it tells me to name the next case and retire itself.
Routine: `migarci2.dev — next case study nudge`
(claude.ai/code/routines/trig_017VY6js21AsqXYNochMzC5E, next run 2026-08-01).

## The build context is preserved

The Claude Project **FlyRank Backend Internship** (set up in
[FL-01](../FL-01), instructions include my proof statement and tutor-mode
rule) stays; it already knows my voice, stack and
[identity kit](../W3-identity-kit). On top of it, this repo *is* durable
context: identity kit, content map, stack decision, deploy pipeline and crit
history are all written down, so the next case is a short conversation plus
one array entry — not a rebuild.

## Pass / revise — self-check

- **Concrete "how to add the next case" note** → file, array, shape, deploy
  command, time cost. ✓
- **Specific next work named + real reminder set** → the portal-CLI case
  study; monthly cloud routine, live, first run 2026-08-01. ✓
- **Build context preserved so updates are cheap** → Claude Project kept +
  this repo as written memory. ✓
