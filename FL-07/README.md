# FL-07 — Build the Agent: **Week Scout**

Assignment: *Build the Agent* (General AI Fluency, Week 5)
Author: Miguel Garcia Roman
Spec: [../FL-06](../FL-06) · Build log: [BUILDLOG.md](BUILDLOG.md)

---

## What it is

Week Scout reconciles the FlyRank portal against this repo and writes one weekly
report: what's submitted, what's missing (grouped by each assignment's *true*
week), and what to do next — with repo evidence on every claim. One job, done
well, per the FL-06 spec.

```
./FL-07/scout.sh        # run the agent → reports/week-scout-<date>.md
python3 FL-07/eval.py   # run the five FL-06 eval cases against today's report
```

| File | What |
|---|---|
| `instructions.md` | The agent's system prompt (rules 1–7 from the spec, evolved — see deviations) |
| `scout.sh` | Runner: launches `claude -p` headless with the read-only allowlist, saves the report + full transcript |
| `live.py` | Makes the stream watchable: prints each tool call as it happens |
| `eval.py` | E1–E5 from FL-06; computes ground truth independently of the agent |
| `reports/` | Reports, full `stream-json` transcripts, and raw `script(1)` captures — including the failed run 1, kept on purpose |
| `BUILDLOG.md` | What broke, what changed, what was cut — chronological, unpolished |

## Why it's an agent (and not my FL-04 workflow)

The model steers the loop. Nothing in the runner says "list weeks 1–10, then show
these codes": the agent decided to sweep the week listings, noticed weeks 8 and 9
returned identical rows, said so, and pulled detail pages *only* for the ambiguous
items. It also caught things I didn't script for: `fl-cap` shows "open" in
`list --all` but its detail page is locked, and the list/detail pages disagree on
the code's casing — the final report documents both instead of guessing. That's
runtime control flow chosen by the model ([FL-05](../FL-05), in my words).

## The live tool connection

`tools/flyrank` — the CLI I reverse-engineered for this internship — hitting the
real portal (Auth.js session, Next.js flight payloads), plus read-only `git log` /
`ls` for repo evidence. No mocks anywhere; every eval below ran against live
portal state.

## Guardrails are structural, not polite

The `--allowedTools` list contains five read-only commands and **no write-capable
tool at all**. In headless mode everything else is denied by the permission
system. Proven twice: a pre-build probe (`touch` → denied) and — better — run 1,
where my own `Write(...)` permission pattern didn't match, and the agent **stopped
and reported the denial** rather than trying shell tricks (rule 6 working as
designed; transcript kept in `reports/transcript-2026-07-29-run1.jsonl`).

## Deviations from the FL-06 spec — documented, with reasons

1. **The agent no longer writes its own report.** Spec said "writes one file"; the
   Write permission pattern failed in run 1, and instead of debugging pattern
   syntax I removed write access entirely — the report is the agent's final
   message, and `scout.sh` (deterministic code, where determinism belongs) saves
   it. Strictly tighter than the spec's guardrail.
2. **Evidence format grew a third state.** The spec had `last commit` / `no work
   started`; reality had "directory exists, zero commits" (this very assignment,
   mid-build). The agent reported it more honestly than my format allowed, so the
   format now includes `(dir: X · uncommitted)`.

## Eval results (the honest arc)

First pass: **1/5** — triage showed 1 agent bug (normalized `fl-cap` to uppercase)
and 3 harness bugs (my regexes counted prose as rows, and grepped the *prompt* for
forbidden commands the prompt legitimately quotes). Fixed both sides; run 3 found
one final harness bug (the CLI's legend line parsed as an assignment named
`open`). Full story in [BUILDLOG.md](BUILDLOG.md).

**Final: E1–E5 all PASS** — exact missing set vs independently computed ground
truth, no hallucinated submissions, the BE-06 week quirk resolved, read-only
guardrail verified against the executed-command transcript, and evidence on every
missing row.

```
PASS  E1 exact missing set
PASS  E2 BE-06 not hallucinated as submitted
PASS  E3 BE-06 once, week 6
PASS  E4 read-only guardrail
PASS  E5 evidence on every missing row
```

## Run capture — raw and unedited

`reports/capture-2026-07-29.{log,tm}` is a `script(1)` recording of the successful
run 3, end to end (≈3 min: request → 27 turns of live tool calls → report). Replay
it in a terminal, exactly as it happened, with:

```
scriptreplay --log-timing FL-07/reports/capture-2026-07-29.tm \
             --log-out    FL-07/reports/capture-2026-07-29.log
```

It's a terminal capture, not a video file; if the reviewer wants an .mp4, I
screen-record that replay (or a fresh run) — nothing to edit either way.

## Pass / revise — self-check

- **Core job end to end, no mid-run hand-editing** → run 3: one command in, report
  out, evals green against live data. ✓
- **At least one live tool/data connection** → the portal CLI + git, no mocks. ✓
- **Matches the FL-06 spec or deviations documented** → two deviations, both
  argued above. ✓
- **Build log shows real iteration** → three runs, a recorder that broke twice, an
  eval harness that was wrong four times, and the agent right on most of it. ✓
- **Run capture unedited, full loop** → `script(1)` raw capture + replay command. ✓
