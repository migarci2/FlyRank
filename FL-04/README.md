# FL-04 — Ship an Automation Workflow v2

Assignment: *Ship an Automation Workflow v2* (General AI Fluency, Week 4)
Author: Miguel Garcia Roman

Pipeline chosen from the [FL-01 audit](../FL-01) — tasks #12 ("summarize a long
doc/PDF before I read it") + #16-ish study work: **source-grounded study notes.**
When I have to learn a spec/RFC/protocol fast (Auth.js internals, MCP, a Postgres
feature), I want notes I can trust — grounded in the actual sources, not a model's
half-memory. This automates the gather→learn loop without letting it hallucinate.

## The flow (sketched before building)

```
[1] GATHER            [2] SYNTHESIZE           [3] DRAFT               [4] REVIEW
sources ──────────►  grounded Q&A  ─────────►  study notes  ────────►  fact-check
(PDFs, docs,         (NotebookLM,              (Claude Project,        + format
 RFCs, URLs)          cites every claim)        my voice/template)     (Claude, 2nd pass)
     │                     │                          │                      │
  handoff:            handoff:                   handoff:               handoff:
  a source set        answers WITH               a filled notes         notes with every
  in NotebookLM       source citations           template (draft)       claim source-checked
```

Four distinct steps, each with a defined handoff — the output of one is the typed
input of the next. **Tools:** NotebookLM (steps 1–2, because it *only* answers from
sources it's given — that's the anti-hallucination guarantee) + a Claude Project
(steps 3–4, because it holds my voice card and template across runs).

## Step-by-step (the actual instructions)

**[1] Gather.** Drop 3–6 sources on one topic into a NotebookLM notebook (spec PDFs,
official docs, one good blog). Rule: primary sources first; no source = not in the notes.

**[2] Synthesize (NotebookLM).** Ask the same fixed question set every run, so notes
are comparable:
```
For this topic, answer ONLY from the sources, and cite each answer:
1. What problem does it solve, in one sentence?
2. The 3–5 core concepts, each defined in one line.
3. The smallest working example.
4. The top 3 gotchas / things people get wrong.
5. Anything the sources disagree on or leave unspecified.
If the sources don't answer a question, say "not covered" — do not guess.
```

**[3] Draft (Claude Project "FlyRank Backend Internship").** Paste NotebookLM's cited
answers. Instruction:
```
Turn these source-grounded answers into study notes using my template
(Problem · Core concepts · Minimal example · Gotchas · Open questions).
Keep every citation. Voice: direct, concrete, no buzzwords (my voice card).
Do NOT add facts that aren't in the pasted answers.
```

**[4] Review (second Claude pass).** New message / fresh eyes:
```
Act as a fact-checker. For each claim in these notes, mark [grounded] if it traces
to a pasted citation, or [UNSUPPORTED] if it doesn't. List every UNSUPPORTED claim.
Then output the final notes with unsupported claims removed and formatting cleaned.
```
The output is study notes where every surviving line traces to a source.

## ⬜ Five real runs (my execution — templated, not faked)

The pass criteria need **5 real runs with outputs + honest timing**. I can design and
wire the pipeline (done above); running it on five real topics and timing myself is
mine to do. Log each here as I go:

| # | Topic | Sources | Output link | Pipeline time | Manual-baseline time | Human had to fix |
|---|-------|---------|-------------|---------------|----------------------|------------------|
| 1 | e.g. MCP spec        | | `runs/01-mcp.md`        | | | |
| 2 | e.g. Auth.js sessions| | `runs/02-authjs.md`     | | | |
| 3 | e.g. scrypt vs argon2| | `runs/03-kdf.md`        | | | |
| 4 | e.g. Postgres MVCC   | | `runs/04-mvcc.md`       | | | |
| 5 | e.g. robots.txt / RFC 9309 | | `runs/05-robots.md` | | | |

**Time accounting (honest, incl. setup):**
- One-time setup (build the Project instructions + question set): `~__ min` — a real
  cost that only pays off across runs.
- Per run, pipeline: `~__ min`. Per run, fully manual: `~__ min`. Break-even after
  `~__` runs.

## Where it breaks / what a human must still check

- **Garbage sources → confident, cited garbage.** NotebookLM grounds in what you give
  it; it can't judge that a source is wrong. *Human picks the sources.*
- **"Not covered" honesty depends on the prompt** — drop the "don't guess" line and
  step 2 starts filling gaps. *Human keeps the guardrail in.*
- **Step 3 can smuggle in model priors** despite the instruction — that's exactly why
  step 4's [UNSUPPORTED] pass exists. *Human reads the UNSUPPORTED list before trusting.*
- **Synthesis ≠ understanding.** The notes are a map; I still read the load-bearing
  source sections myself (this was a **Me** task in FL-01 for a reason).

## Pass / revise — self-check

- **Runs end to end on a brand-new input** → yes, the four steps take any new topic. ✓
- **Three+ distinct steps with defined handoffs** → four, handoffs named above. ✓
- **Five real runs documented** → templated table; ⬜ mine to execute + fill.
- **Honest time accounting incl. setup** → template above; ⬜ fill with real numbers.
- **Failure points + required human review named** → four, above. ✓
