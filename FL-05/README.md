# FL-05 — Agent Concepts and MCP Basics

Assignment: *Agent Concepts and MCP Basics* (General AI Fluency, Week 4)
Author: Miguel Garcia Roman
Reading: *Building Effective Agents* (Anthropic) · *Model Context Protocol* intro.

---

## Explainer (≈750 words, my words)

**Workflow vs. agent — the difference is who decides the next step.**

A *workflow* is a fixed pipeline. A human wired the steps in advance, and the LLM
fills in each box in a set order: gather, then synthesize, then draft, then review.
The model does language work at each stage, but it never chooses *what happens next*
— the control flow is mine, written down. If step 3 always follows step 2, it's a
workflow, however smart step 2 is.

An *agent* is different: you hand it a goal and a set of tools, and **the model
decides the path** — which tool to call, with what arguments, whether the result is
good enough, whether to loop again or stop. The control flow is decided at runtime by
the model, not baked in by me. The tell isn't "does it use an LLM" or even "does it
call tools" — it's "who is choosing the sequence." A human-chosen sequence is a
workflow; a model-chosen sequence over a tool loop is an agent.

Anthropic's *Building Effective Agents* makes the same cut and adds the practical
advice I agree with: **don't reach for an agent when a workflow does the job.** Agents
trade predictability for flexibility. A fixed pipeline is cheaper, more debuggable,
and more reliable; you only want the model steering when the task genuinely can't be
pre-scripted (open-ended paths, unknown number of steps). That matches my whole
stance — don't build the powerful thing when the simple thing is correct.

**My FL-04 pipeline is a workflow, not an agent.** I decide the four steps and their
order every time: gather → synthesize (NotebookLM) → draft (Claude) → review (Claude).
The models do the heavy language work inside each step, but none of them chooses the
next step, picks a tool, or decides to loop. The sequence is mine, hard-coded in the
instructions. That's the textbook definition of a workflow, and — importantly — it's
the *right* shape for the task: source-grounded notes benefit from a fixed, auditable
path, not a model wandering.

**What MCP is.** The Model Context Protocol is a standard way to plug a model into the
outside world — a common "port" so any MCP-speaking client (Claude Desktop, Claude
Code, others) can talk to any MCP server (a filesystem, a database, GitHub, a code
index) without custom glue per pairing. Before MCP, every model↔tool integration was
bespoke; MCP makes it an interface, the same way a repository interface let me swap
Postgres for in-memory in BE-04 without touching the service.

MCP exposes three primitives:

- **Tools** — actions the model can *invoke*: query a database, read a file, hit an
  API. These are the verbs; they have side effects or fetch live data. This is what
  turns "chat" into "chat that can *do* things."
- **Resources** — data the client can *read* into context: files, records, documents.
  Nouns, not verbs — they load information, they don't act.
- **Prompts** — reusable, parameterized prompt templates the server offers, so common
  tasks against that server are one click, not re-typed each time.

The clean way to hold it: **resources are what the model can read, tools are what the
model can do, prompts are canned ways to ask.**

**What FL-04 would need to become an agent.** Today I hand-pick the sources (step 1)
and run the four steps in fixed order. The one concrete upgrade that would make it a
genuine agent: **give it a `search` tool and let the model run the gather-loop
itself** — decide what to search for, judge whether the sources it found actually
answer the fixed question set, and *loop back to search again* for the gaps it finds,
stopping only when coverage is good enough. At that point I'm no longer choosing the
steps; I state the goal ("grounded notes on topic X") and the model chooses how many
search-read-assess cycles it takes. That single change — a tool plus a
model-controlled loop with a stop condition — is exactly what moves it from workflow
to agent. Notably it also *adds* the failure mode I avoided (the model can now pull a
bad source on its own), which is the honest reason I'd keep the human-in-the-loop
workflow version as the default and reserve the agent for topics too broad to
pre-source.

---

## Connector demo — done (Claude Code + codegraph MCP over this repo)

**Client:** Claude Code (an MCP client). **Server:** `codegraph` (MCP), exposing the
repo's symbol graph as **resources** and query **tools**. Setup:

```bash
codegraph init && codegraph index   # -> 16 files, 74 nodes, 58 edges
```

Three tasks run **through the MCP tools**, each producing real output from the live
index — things plain chat cannot do because they read the actual, just-written code,
not the model's memory:

**1. `codegraph_search "verifyToken"`** — locate a symbol in *my* code.
```
verifyToken (function)  BE-auth/auth.js:40  signature (token)
```
Chat can't know where a function I wrote minutes ago lives, or that it's indexed. The
tool reads the graph and returns the exact file:line + signature.

**2. `codegraph_callees "verifyToken"`** — trace code flow.
```
Callees of verifyToken (2 found):
  sign   (function) BE-auth/auth.js:28
  nowMs  (function) BE-auth/auth.js:57
```
The dependency edges are resolved from the parsed graph, not guessed — `verifyToken`
really does call `sign` (the HMAC) and `nowMs` (the expiry clock).

**3. `codegraph_impact "scrape"`** — blast radius of a change.
```
Impact: "scrape" affects 2 symbols
  BE-scraper/scraper.js:  scrape:42, scraper.js:1
```
Asks the graph what a change to the scraper's entry point would touch — an
analysis that only exists because a tool indexed the files.

All three are **tool calls over live resources**, not chat: the outputs are pulled
from the index built by `codegraph index`, and they name real lines in BE-auth /
BE-scraper. Reproduce in any MCP client by running the two setup commands, then the
same three queries.

## Pass / revise — self-check

- **Explainer technically correct, my own words** → above (~750 words). ✓
- **Workflow-vs-agent applied to FL-04** → workflow, with the "who chooses the next
  step" reason. ✓
- **Connector working, outputs show tool use** → ✓ Claude Code + codegraph MCP; 3
  real tool calls (search / callees / impact) with live output over this repo.
- **One concrete agent upgrade for my pipeline** → search-tool + model-controlled
  gather-loop. ✓
