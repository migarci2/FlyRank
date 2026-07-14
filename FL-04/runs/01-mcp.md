# Study notes — Model Context Protocol (MCP): tools, resources, prompts

Run 1 of the [FL-04 pipeline](../README.md). Topic chosen for its direct use in
[FL-05](../../FL-05). Every claim traces to a fetched source; the review pass flags
anything less grounded.

**Sources gathered (step 1):**
- Tools spec — https://modelcontextprotocol.io/specification/2025-06-18/server/tools
- Prompts spec — https://modelcontextprotocol.io/specification/2025-06-18/server/prompts
- Overview/architecture — https://spec.modelcontextprotocol.io/specification/draft/architecture/
  (host flaky on fetch; problem statement taken from the modelcontextprotocol.io overview)

---

## Problem
MCP standardizes how applications feed context to LLMs — it **separates providing
context from the LLM interaction itself**, so any MCP client can talk to any MCP server
without bespoke glue. [overview]

## Core concepts (the three primitives)
- **Tools** — executable functions a model can invoke to act (query a DB, call an API,
  compute). **Model-controlled**: the LLM discovers and calls them automatically. [tools]
- **Resources** — structured data/content (text or binary blob) the client reads *into*
  context: docs, code samples, reference material. [overview]
- **Prompts** — reusable prompt templates the server exposes; **user-controlled**,
  typically surfaced as slash commands the user picks. [prompts]

One-line mnemonic (grounded in the control models above): **resources = what the model
can read, tools = what it can do, prompts = canned ways for the user to ask.**

## Minimal example (real, from the spec)
Discover then call a tool:
```json
// client -> server
{ "jsonrpc":"2.0","id":1,"method":"tools/list" }
// -> get_weather { inputSchema:{location:string} }
{ "jsonrpc":"2.0","id":2,"method":"tools/call",
  "params":{ "name":"get_weather","arguments":{"location":"New York"} } }
// server -> client
{ "result":{ "content":[{"type":"text","text":"72°F, Partly cloudy"}], "isError":false } }
```
Prompts mirror this with `prompts/list` + `prompts/get` (e.g. a `code_review` prompt that
takes a `code` argument and returns `messages`). [tools][prompts]

## Gotchas / what people get wrong
- **Control model differs by primitive.** Tools are model-controlled; prompts are
  user-controlled. Treating prompts as auto-invoked (or tools as user-only) misuses them. [tools][prompts]
- **Human-in-the-loop is in the spec, not optional advice.** Clients **SHOULD** show tool
  inputs before calling and let a human deny invocations — to prevent data exfiltration. [tools]
- **Tool annotations are untrusted** unless the server is trusted; validate inputs, rate-limit,
  sanitize outputs, time out calls. [tools]
- **Capabilities are negotiated at init.** A server must declare `tools`/`prompts`
  capability (with `listChanged`) or the client won't use them. [tools][prompts]
- **Two error channels for tools:** JSON-RPC protocol errors (unknown tool, bad args) vs
  execution errors reported in the result with `isError:true`. Don't conflate them. [tools]

## Open questions / less grounded (review pass)
- `[thinly-grounded]` **Resources** detail here comes from the overview, not the resources
  spec page (not fetched this run). The tools/prompts sections are grounded in their spec
  pages with examples; resources should be re-run against
  `/specification/2025-06-18/server/resources` for the same depth.
- `[not covered]` Transport specifics (stdio / Streamable HTTP) — named in the overview,
  not detailed here.

**Review verdict:** tools + prompts fully source-grounded (with real examples); resources
flagged as overview-level; no fabricated claims.
