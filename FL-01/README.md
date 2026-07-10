# FL-01 — AI Workflow Audit and Tool Setup

Assignment: *AI Workflow Audit and Tool Setup* (General AI Fluency, Week 1)
Author: Miguel Garcia Roman
Positioning this feeds: see [../W1-what-are-you-proving](../W1-what-are-you-proving)

## 1. Task audit

Recurring tasks from a real week (backend internship work, university, side
projects). Classification legend:

- **Me** — I do it myself; AI adds noise or the point is my own judgment.
- **Delegate+review** — AI drafts, I check and own the result.
- **Collaborate** — back-and-forth; AI is a thinking partner, I decide.
- **Automate** — scripted once, runs without me.

| # | Recurring task | Class | One-line rationale |
|---|----------------|-------|--------------------|
| 1 | Reverse-engineer an undocumented endpoint (read traffic, find the shape) | **Me** | The judgment *is* the skill; a model guesses and I'd have to re-verify every guess anyway. |
| 2 | Write the first draft of a small service/endpoint | Delegate+review | Boilerplate is fast to generate, but I read every line before it ships. |
| 3 | Name things (functions, routes, files) | Collaborate | I brainstorm names with AI, then pick; it breaks my tunnel vision. |
| 4 | Decide an architecture / whether a thing should exist at all | **Me** | Trade-offs depend on context the model doesn't have; owning the call is the job. |
| 5 | Explain an unfamiliar error / stack trace | Collaborate | Fast hypotheses from AI, I confirm against the actual code. |
| 6 | Write README / docs for a finished piece | Delegate+review | I've made the decisions; AI structures them, I fix voice and correctness. |
| 7 | Regex / one-off parsing scripts | Delegate+review | Easy to generate, trivial to test, I keep one runnable check. |
| 8 | Translate a brief into a task list | Collaborate | AI decomposes, I cut the steps that don't earn their place. |
| 9 | Format/lint/mechanical refactors | Automate | Deterministic; a formatter and a script own this, not me and not a chat. |
| 10 | Look up an API's exact params / status codes | Delegate+review | Fast recall, but I never trust it without hitting the real endpoint once. |
| 11 | Study for an exam / actually learn a concept | **Me** | If AI does it, I didn't learn it. The output is worthless; the understanding is the point. |
| 12 | Summarize a long doc/PDF before I read it | Delegate+review | Good map, but I still read the parts the summary flags as load-bearing. |
| 13 | Draft commit messages / PR descriptions | Delegate+review | AI drafts from the diff, I tighten. |
| 14 | Cross-check my own reasoning ("what am I missing?") | Collaborate | AI as an adversarial reviewer catches my blind spots. |
| 15 | Triage which of many failing things to fix first | **Me** | Priority is judgment under my constraints, not a general answer. |

Four honest **Me** tasks (1, 4, 11, 15), each with a reason — the point of those
is my own judgment or my own learning, and handing them to a model defeats it.

## 2. Toolkit setup

- **Claude** — primary thinking partner and code review. Account active.
- **ChatGPT** — second model for cross-checking (used in FL-02 comparison).
- **Anthropic Academy** — enrolled in *AI Fluency: Framework & Foundations*;
  first module complete.

## 3. Claude Project — custom instructions

Project: **FlyRank Backend Internship**. Custom instructions pasted in:

```
Who I am: Miguel, backend AI engineering intern. I write small, dependable
services and reverse-engineer undocumented systems.

Tone: direct, concrete, a little dry. No buzzwords ("robust", "seamless",
"leverage"). Builder-to-builder. If something is over-engineered, say so.

How to help: draft, then let me own the result. Show me the trade-off, not just
the answer. When I'm reverse-engineering, help me form hypotheses I can verify
against real traffic — never invent an endpoint or a field.

Current goal: ship one small, real backend tool per assignment, each a case study.
```

## 4. Three target tasks (reused in FL-02 → FL-04)

Chosen because they're the core of my claim and I can measure "done well."

1. **Reverse-engineer an undocumented endpoint and describe its contract.**
   *Done well:* I can name the method, URL, required fields, and auth mechanism,
   and a script I write hits it and gets a 2xx on the first real try.

2. **Turn a one-paragraph brief into a running minimal service.**
   *Done well:* `run` command starts it, the documented endpoints return the
   promised JSON, and there's exactly one runnable check that fails if the core
   logic breaks — no more code than that.

3. **Write the case study for a finished piece (problem / decisions / outcome).**
   *Done well:* a stranger reads it and can say what the problem was, what I
   decided and why, and what came of it — in my voice, no "results-driven" filler.
