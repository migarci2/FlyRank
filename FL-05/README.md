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

## ⬜ Connect an MCP server + run 3 tasks chat alone can't (my execution)

The pass criteria need a **working connector with visible tool use**, on 3 tasks plain
chat couldn't do. Plan (mine to run + screenshot — outputs must show tool calls, not
prose):

1. **Filesystem MCP** → *"Read `BE-auth/auth.js` and tell me the token TTL."* Chat
   can't read my disk; the tool call fetches the real file.
2. **Filesystem / codegraph MCP** → *"Which files in this repo define a `verifyToken`
   and what calls it?"* Requires reading + indexing actual files, not guessing.
3. **A live-service MCP (e.g. a Postgres or GitHub connector)** → *"How many users are
   in the running BE-auth database right now?"* / *"List my open issues."* — live
   state chat has no access to.

*(Real reference I already have: my Claude Code setup connects the **codegraph** MCP
server over this repo — a working example of tools + resources in practice. I'll
capture the three runs above with the tool-use output visible.)*

## Pass / revise — self-check

- **Explainer technically correct, my own words** → above (~750 words). ✓
- **Workflow-vs-agent applied to FL-04** → workflow, with the "who chooses the next
  step" reason. ✓
- **Connector working, outputs show tool use** → ⬜ 3 tasks planned; mine to run + capture.
- **One concrete agent upgrade for my pipeline** → search-tool + model-controlled
  gather-loop. ✓
