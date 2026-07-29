# Week Scout — build log (chronological, unpolished on purpose)

**2026-07-29 · guardrail smoke test, before writing any agent code.**
Ran a 2-step probe through `claude -p` with only `Bash(tools/flyrank submissions:*)`
allowlisted: step 1 (portal read) executed; step 2 (`touch /tmp/guardrail-test`) →
**denied**. So the headless permission system enforces the read-only guardrail
mechanically, as the FL-06 spec assumed. Green light to build on that.

**2026-07-29 · capture rig broke first, not the agent.**
First launch died instantly: `script: unexpected number of arguments`. My `script`
invocation passed both `--log-out` and a positional file — util-linux accepts one or
the other. Dropped the positional. (Logging it because the eval brief says log what
broke; the first thing that broke was the *recorder*.)

**2026-07-29 · run 1 — agent right, my permission pattern wrong.**
32 turns, 235s. The loop itself behaved better than spec'd: it noticed weeks 8 and 9
returned identical listings, called that out, and pulled detail pages for the
ambiguous items — that's rule 2 generalizing, unprompted, to a quirk I hadn't seen.
Then the failure: `Write(FL-07/reports/**)` in `--allowedTools` never matched, so
the final Write was denied. The agent followed rule 6 exactly — **stopped and
reported the denial instead of fabricating a workaround** (it explicitly refused to
try shell redirection tricks). Best possible failure mode; the bug was mine.
Evidence kept: `reports/transcript-2026-07-29-run1.jsonl`, `capture-*-run1.*`.

**2026-07-29 · deviation from the FL-06 spec (documented, deliberate).**
Fix chosen: instead of debugging Write-permission pattern syntax, I removed write
access entirely. The agent's final message now IS the report; `scout.sh` extracts it
from the stream-json transcript and writes the file. This *deviates from the spec*
(which said the agent writes its one report) — and it's a strictly tighter version
of the spec's own guardrail: the agent went from "may write one path" to "cannot
write at all". The deterministic 10-line extraction moved into the runner, which is
where deterministic code belongs (FL-05, workflow vs agent).

**2026-07-29 · also added `live.py` mid-build.**
Raw `stream-json` is unwatchable in a capture. 20-line stdin filter: prints each
tool call and final text as they happen. Demo problem, not agent problem.

**2026-07-29 · run 2 — full loop green: 23 turns, 133s, complete report.**
The agent listed all weeks, spotted that weeks 8/9 listings were identical and
resolved every ambiguous item via detail pages, caught that `fl-cap` shows "open"
in `list --all` but its detail page is locked/404, and correctly reported my own
FL-06/FL-07/PF-04 directories as "uncommitted" — which was true at that moment.
(Also: the `script` capture failed once more first — background shell cwd wasn't
the repo root, so the relative log path didn't resolve. Absolute paths. The
recorder has now broken more times than the agent.)

**2026-07-29 · first eval pass: 1/5. Triage: one agent bug, three harness bugs.**
Exactly what the *Your AI Product Needs Evals* essay warns: the first eval run
mostly tests the evals.
- E1 FAIL, agent's fault: it normalized `fl-cap` to `FL-CAP`; ground truth uses the
  portal's exact code. Fix in instructions: codes verbatim, case included.
- E3 FAIL, harness's fault: my regex counted a BE-06 mention in the report's prose
  preamble as a second "row". Fixed: only bullet rows count; week comes from the
  nearest preceding heading.
- E4 FAIL, harness's fault: I grepped the whole transcript for `flyrank submit` —
  which appears in the *prompt*, because the instructions tell the agent never to
  run it. Fixed: only executed tool_use commands count.
- E5 FAIL, mixed: the agent reported uncommitted dirs as `uncommitted — README.md
  present, no commits`, a state my spec'd format didn't anticipate — its phrasing
  was more accurate than my format. Fixed both sides: instructions now define the
  `(dir: X · uncommitted)` form; eval accepts it; prose lines excluded.

**2026-07-29 · run 3 — 27 turns, 183s, and one last harness bug.**
The agent fixed everything asked of it: codes verbatim (it even *documented* the
`fl-cap`/`FL-CAP` casing mismatch between the portal's list and detail pages
instead of silently picking one), the `(dir · uncommitted)` format, and this time
it matched `W5-ship-the-ugly-one/` to Ship the Ugly One. Evals: 4/5 — the one FAIL
was mine again: the ground-truth parser in `eval.py` swallowed the CLI's legend
line ("● open  ○ locked/coming soon") as an assignment with code `open`. Filtered
the legend, re-evaluated: **E1–E5 all PASS**. Final score of the build: agent bugs
found by evals: 1. Harness bugs found by the agent being right: 4.
