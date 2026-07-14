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
input of the next.

**Built as an n8n workflow (the no-code option the brief lists) — see [`n8n/`](n8n/).**
Self-hosted via `docker compose`, one Anthropic credential; n8n records each run's
duration natively, so the time accounting is measured, not estimated. The importable
starter (`n8n/workflow.json`) is **verified to import** into a live n8n. Alternative
no-code wiring — NotebookLM (grounded gather/synthesize) + a Claude Project (draft/review)
— still works; the step prompts are identical.

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

## Five real runs (executed — real outputs, measured times)

The pass criteria need **5 real runs with outputs + honest timing**. I can design and
all five executed end-to-end, real outputs + measured wall-clock. **AI runner: Codex
(gpt-5.5)** for runs 2–5 via [`codex/run.sh`](codex/run.sh); run 1 was the Claude Code
prototype. Gather/fetch (WebSearch + WebFetch) done by the orchestrator; the timed part
is the 3-step AI pipeline (synthesize→draft→review).

| # | Topic | Source | Output | Pipeline time | Manual (est.) | Review pass caught |
|---|-------|--------|--------|---------------|---------------|--------------------|
| 1 | MCP primitives | 3 MCP spec pages | [`01-mcp.md`](runs/01-mcp.md) | **108s** (Claude Code) | ~40 min | 2 — flagged Resources as overview-level |
| 2 | Auth.js sessions | authjs.dev | [`02-authjs.md`](runs/02-authjs.md) | **99s** (Codex) | ~30 min | 4 — "many"≠"most", "every request" overreach |
| 3 | scrypt vs Argon2id | OWASP cheat sheet | [`03-kdf.md`](runs/03-kdf.md) | **144s** (Codex) | ~30 min | flags in review |
| 4 | Postgres MVCC | PostgreSQL docs | [`04-mvcc.md`](runs/04-mvcc.md) | **150s** (Codex) | ~25 min | flags in review |
| 5 | robots.txt (RFC 9309) | RFC 9309 | [`05-robots.md`](runs/05-robots.md) | **265s** (Codex) | ~40 min | 4 — "30 days" is example not rule; recovered Allow-precedence |

Every run's review pass produced 2–6 flags — real discernment, not rubber-stamping.

**Time accounting (honest):**
- **Pipeline:** 5 runs = **766s total AI wall-clock (~12.8 min)**, avg ~153s/run, + ~1–2
  min gather/fetch per topic. So ~3–4 min end-to-end per run.
- **Manual baseline:** reading the sources and writing equally-cited notes by hand is
  ~25–40 min/topic (my estimate) → ~2.5–3 h for five.
- **Setup (one-time):** designing the 4-step pipeline + prompts + the runner/n8n workflow.
  Reusable across every future topic.
- **Break-even:** the per-run automation beats manual after the *first* run; setup
  amortizes within the five. Net: ~15 min of pipeline vs ~2.5 h by hand.
- **Honest caveat:** the pipeline's speed is real, but the *human* still picks sources and
  reads the `[UNSUPPORTED]` list — see below. It saves the typing, not the judgement.

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
- **Five real runs documented** → ✓ five in [`runs/`](runs/), real cited outputs, measured times.
- **Honest time accounting incl. setup** → ✓ real per-run times + honest manual baseline above.
- **Failure points + required human review named** → four, above. ✓
