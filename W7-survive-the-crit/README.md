# Survive the Crit

Assignment: *Survive the Crit* (General AI Fluency, Week 7)
Author: Miguel Garcia Roman
Reviewed: **[migarci2.dev](https://migarci2.dev)**, live production, 2026-07-29
Reviewer: structured fresh-eyes review by an AI agent given **no prior context** —
only the live URL and my Chapter-1 proof statement. Disclosed as such; a human
mentor pass on top is welcome and this document is ready to hand them.

---

## What was submitted for review

The live site plus the proof statement it must be judged against
([W1](../W1-what-are-you-proving)):

> I take an undocumented backend system and ship the small, reliable tool that
> makes it usable — reading the wire, not waiting for docs.
> One person: a founding backend engineer at a small AI company.
> One action: read one repo, then email me.

The reviewer walked every page (desktop + 375px), followed every work link to
its destination, tested the interactive elements, and read the CV and the
GitHub profile the site funnels to. Full report kept verbatim in
[CRIT-REPORT.md](CRIT-REPORT.md).

## The verdict, without defending

After 90 seconds the reviewer could say "talented low-level/security student" —
but **not** the proof statement. Worse: the one action the site exists for is
**impossible for 2 of 3 projects** — the ProofMesh and agenctf cards dead-end
on a bare GitHub profile (bio: "📚 Student!"), and neither repo exists publicly.
The strongest page (/kernel) proves upstream discipline, which is a *different*
claim than wire-reading. That all stung and none of it is wrong. The reviewer
also caught the site breaking its own "reliable" promise: a ⌘K hint with no
palette behind it and a dead `game` nav link on the old blog shell.

## Feedback, sorted honestly

**Must-fix** (undermines the claim or blocks the action):

1. Publish **ProofMesh** and **agenctf** repos (even partial, real READMEs) and
   deep-link each card to its repo, not the profile root. *Highest leverage.*
2. Rewrite the **GitHub profile** (bio, README, pinned repos) around the proof
   statement — it's the last thing a reviewer sees before deciding to email.
3. **State the positioning** in one sentence on the hero + meta description
   (both currently lead with "student" / a mood, not the claim).
4. Ship **one wire-reading artifact** as a headline project (the FlyRank portal
   CLI in this very repo is exactly that story: no API, no docs, working client).
5. The footer's most prominent button is the **signal counter, not email** —
   relabel it and make the emphasized CTA a real `mailto:`.
6. Old blog shell: **⌘K hint promises a palette that doesn't open; `game` nav
   link is dead.** A "small, reliable" claim can't ship false affordances.

**Nice-to-have:** nav label drift (notes vs blog); "Team Europe/Team Spain"
unexplained for non-CTF readers; kernel page could say *how* the bug class was
found; CV leads with education; agenctf post should link its repo once public;
page title could carry the positioning line.

## What I changed (and what's honestly in flight)

- **Fixed on live before/during the crit cycle:** `favicon.ico` 404; ⌘K hint
  hidden on mobile; tap targets ≥44px on touch (see
  [../W7-open-it-on-your-phone](../W7-open-it-on-your-phone)).
- **In flight — a site revision is underway in the site repo right now** (the
  crit landed mid-redesign). Must-fixes 3, 5 and 6 are design/content changes
  that belong to that revision and are queued in it, not just acknowledged.
- **Must-fixes 1, 2 and 4 are mine to do off-site** (publish two repos, rewrite
  the GitHub profile, promote the portal-CLI story to a headline project).
  They're the real work the crit exposed: the site was ahead of its evidence.

Engagement, not defense: the finding I'd have argued with a month ago —
"the kernel page proves the wrong claim" — is the one I've accepted most fully.
The crit's own words: the site "already knows how to prove things"; the gap is
*what* it's proving. That's a content debt, and it's now the top of my list.

## Pass / revise — self-check

- **Submitted with proof statement, real feedback received** → yes, full report
  attached. ✓
- **Reviewer could state what I do / gaps identified** → partially — gaps
  precisely identified. ✓ (that's what the crit is for)
- **Sorted must-fix vs nice-to-have** → above, honestly. ✓
- **Must-fixes actually fixed on the live site** → in progress: 3 shipped
  earlier, 3 queued in the active site revision, 3 are off-site repo/profile
  work. ⚠ not yet closed
- **Engaged rather than defended** → accepted the hardest finding first. ✓
