# FL-09 — Week Scout: Documentation & Demo Video

Assignment: *Documentation and Demo Video* (General AI Fluency, Week 8)
Author: Miguel Garcia Roman
Agent: **Week Scout** — spec in [FL-06](../FL-06), build log in [FL-07](../FL-07).
Demo video: _[slot: unlisted YouTube link — script ready in [VIDEO-SCRIPT.md](VIDEO-SCRIPT.md), pending recording]_

---

## What it does, and for whom

Week Scout answers one question I used to spend 20–30 error-prone minutes on
every Monday: **"what does the FlyRank portal say I owe, and what does my repo
say I've actually done?"** It reads the live portal and the local git repo,
reconciles them, and writes one Markdown report: submitted / missing-by-week
(with each assignment's *true* week — the portal's week listings lie) / next
actions, every claim backed by evidence. Audience: me, weekly; and anyone
running a FlyRank track from a git repo, with ten minutes of setup.

## Setup a stranger could follow

Requirements: Linux/macOS, Node ≥ 22, Python 3, a Claude subscription, a
FlyRank portal account, Chrome or Brave logged into the portal.

```bash
# 1. Get the repo
git clone https://github.com/migarci2/FlyRank && cd FlyRank

# 2. Install Claude Code (the agent's runtime) and log in once
npm install -g @anthropic-ai/claude-code
claude          # first run opens the login flow; then exit

# 3. Give the portal CLI a session (reads the cookie from your browser —
#    you must be logged into internship.flyrank.ai in Chrome/Brave first).
#    Note: tools/ is gitignored (it touches browser cookies); get flyrank
#    from me, or point instructions.md at your own portal client.
tools/flyrank login       # prints: Signed in as <you>

# 4. Run the agent
./FL-07/scout.sh          # ~2-4 min; prints each tool call as it happens
#    → FL-07/reports/week-scout-<today>.md   (the report)
#    → FL-07/reports/transcript-<today>.jsonl (every tool call, auditable)

# 5. (optional) Score it against ground truth
python3 FL-07/eval.py
```

Failure you'll hit eventually: `Session expired. Run: flyrank login` — the
agent stops and says so rather than guessing (that's by design, see guardrails).

## Architecture sketch

```
scout.sh (runner: deterministic shell)
 ├─ claude -p  ─────────  the agent loop (model decides the calls)
 │    allowlist: flyrank list/show/submissions · ls · git log   ← read-only, enforced
 │    │
 │    ├── internship.flyrank.ai  (live portal, via tools/flyrank CLI)
 │    └── local repo             (dirs + git history = evidence)
 │
 │    final message = the report (agent has NO write access)
 └─ extracts report from transcript → FL-07/reports/week-scout-<date>.md

eval.py — recomputes ground truth from the same CLI, independently,
          and scores the report (E1–E5 from the FL-06 spec)
```

## Eval results — v1 vs v2 (nothing hidden)

| Case | v1 (first run) | v2 (final) |
|---|---|---|
| E1 exact missing set vs independent ground truth | FAIL | **PASS** |
| E2 no hallucinated submissions | PASS | **PASS** |
| E3 portal week-quirk resolved (BE-06) | FAIL* | **PASS** |
| E4 read-only guardrail held (executed-commands audit) | FAIL* | **PASS** |
| E5 evidence on every missing row | FAIL* | **PASS** |

\* The honest part: of the four v1 failures, **one was the agent's** (it
normalized the code `fl-cap` to uppercase) and **three were bugs in my eval
harness** (prose counted as rows; the transcript grep flagged the *prompt*
quoting forbidden commands; a legend line parsed as an assignment). Both sides
got fixed; the full arc is in [FL-07/BUILDLOG.md](../FL-07/BUILDLOG.md). v2
passes 5/5 against the live portal, not a mock.

## Limitations (the FL-08-style list — FL-08 itself isn't in my track, noted honestly)

1. **Auth is borrowed, not owned.** The CLI reuses a browser session cookie;
   when it expires mid-run the agent stops with a partial-failure report. It
   will never re-auth itself (guardrail), so a human re-runs `flyrank login`.
2. **Read-only by construction — which means it can't act.** It recommends
   "submit FL-06" but cannot submit. Deliberate: submission is irreversible
   and stays human.
3. **Portal-format coupling.** `tools/flyrank` scrapes Next.js flight payloads;
   a portal redesign breaks the tool layer (not the agent logic). It already
   survived one such change (submissions moved from Server Actions to a REST
   endpoint) because the CLI re-scrapes per run — but that's resilience, not
   immunity.
4. **Evidence matching is heuristic.** Repo dirs are matched to assignments by
   name/topic; in v2 it matched `W5-ship-the-ugly-one` correctly, but a
   cryptically-named directory could be reported as "no work started".
5. **~2–4 minutes per run and one report per day** (same-day reruns overwrite —
   idempotent on purpose, but you lose the morning run's snapshot).
6. **Single-user by design.** One portal session, one repo, no multi-account
   story. That's the FL-06 scope ("one job done well"), not an accident.

## The one guardrail to explain on camera

The agent's tool allowlist contains **no write-capable tool** — `flyrank
submit`, `git commit`/`push`, and file writes are denied by Claude Code's
permission system in headless mode, not by polite prompt text. Proof exists in
the repo: in run 1 the agent hit a denied write and **stopped and reported it**
instead of working around it (`FL-07/reports/transcript-2026-07-29-run1.jsonl`).
