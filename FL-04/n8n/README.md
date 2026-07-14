# FL-04 pipeline in n8n (no-code)

The [FL-04](../README.md) source-grounded-notes pipeline as an **n8n workflow** — the
no-code option the brief explicitly lists. n8n records each execution's duration, so the
"honest time accounting" is measured by the tool, not estimated.

**Division of labour (honest):** the assignment grades *building it with no-code tools*,
so building the workflow in n8n's editor is the point. This folder gives you a running
n8n + the exact blueprint + a verified-importable starter (`workflow.json`) as a safety
net. You wire your key, build/adjust in the UI, and run the 5 inputs.

## 1. Run n8n

```bash
docker compose up -d          # -> http://localhost:5678  (first run: create the local owner account)
```
On the VPS, put it behind traefik like your other services (drop `N8N_SECURE_COOKIE=false`
and set `N8N_HOST` / a TLS label).

## 2. Add your Anthropic key (once)

n8n → **Credentials → New → Header Auth**:
- Name: `Anthropic`
- Header **Name**: `x-api-key`
- Header **Value**: your Anthropic API key

(Keeps the key out of the workflow JSON.)

## 3. The pipeline (4 distinct steps + trigger, handoffs defined)

```
Manual Trigger
  → [Input]        Set: topic + source_url   (edit per run)
  → [Fetch]        HTTP GET source_url        → raw source text
  → [1 Synthesize] Anthropic: grounded Q&A with citations
  → [2 Draft]      Anthropic: notes template, keep citations
  → [3 Review]     Anthropic: mark [UNSUPPORTED], output final
```

Each step's output feeds the next via an n8n expression, e.g. in Draft's body:
`{{ $('1 Synthesize').item.json.content[0].text }}`.

Import `workflow.json` as a starter, or build it yourself — either way, these are the
**exact node prompts** (Anthropic `POST https://api.anthropic.com/v1/messages`, header
`anthropic-version: 2023-06-01`, model e.g. `claude-sonnet-5`, `max_tokens: 1500`):

**1 · Synthesize** (message content):
```
Topic: {{ $('Input').item.json.topic }}
Source text:
{{ $json.data }}

Answer ONLY from the source above, and cite each answer with the source:
1) problem in one sentence  2) 3-5 core concepts, one line each
3) the smallest working example  4) top 3 gotchas  5) anything unspecified/contradicted.
If the source doesn't cover a question, say "not covered" — do not guess.
```

**2 · Draft**:
```
Turn these cited answers into study notes with sections:
Problem · Core concepts · Minimal example · Gotchas · Open questions.
Keep every citation. Voice: direct, concrete, no buzzwords. Add NO facts not below.

{{ $('1 Synthesize').item.json.content[0].text }}
```

**3 · Review**:
```
Fact-check. Mark each claim [grounded] if it traces to the cited source, [UNSUPPORTED]
otherwise. List every UNSUPPORTED claim, then output the final notes with unsupported
claims removed and formatting cleaned.

{{ $('2 Draft').item.json.content[0].text }}
```

## 4. Run on 5 real inputs + timing

For each of 5 topics: set `topic` + `source_url`, **Execute Workflow**, save the Review
output to `../runs/`. n8n shows each run's duration in **Executions** — that's your real
per-run time. Fill the table in [../README.md](../README.md); the manual baseline (how
long the same notes take you by hand) is your own honest measure.

Suggested 5: MCP primitives · Auth.js sessions · scrypt vs argon2 · Postgres MVCC ·
robots.txt (RFC 9309). (MCP already done as the Claude Code prototype run —
[../runs/01-mcp.md](../runs/01-mcp.md), 108s.)

## Failure points / human review (same as the Claude Code run)

- Bad `source_url` → confident, cited garbage. **You pick the source.**
- Drop the "not covered / do not guess" line and Synthesize starts filling gaps.
- Draft can smuggle in model priors → that's why Review's `[UNSUPPORTED]` pass exists;
  **read the UNSUPPORTED list before trusting.**
- `content[0].text` assumes a single text block — if you later enable Anthropic web-search
  tools, the response has multiple blocks and the expression must target the last text one.
