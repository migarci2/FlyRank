#!/usr/bin/env python3
"""Generate a structurally-valid, importable n8n workflow for the FL-04
source-grounded-notes pipeline. Python's json.dump handles all escaping so the
embedded n8n expressions can't corrupt the JSON.  ->  workflow.json
"""
import json

ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
MODEL = "claude-sonnet-5"

def anthropic_node(name, x, content_expr):
    # content_expr is the JS (inside JSON.stringify) that builds the user message.
    body = (
        "={{ JSON.stringify({ model: '%s', max_tokens: 1500, "
        "messages: [{ role: 'user', content: %s }] }) }}" % (MODEL, content_expr)
    )
    return {
        "parameters": {
            "method": "POST",
            "url": ANTHROPIC_URL,
            "authentication": "genericCredentialType",
            "genericAuthType": "httpHeaderAuth",
            "sendHeaders": True,
            "headerParameters": {"parameters": [
                {"name": "anthropic-version", "value": "2023-06-01"},
                {"name": "content-type", "value": "application/json"},
            ]},
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": body,
            "options": {},
        },
        "name": name,
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [x, 0],
        "credentials": {"httpHeaderAuth": {"id": "anthropic", "name": "Anthropic"}},
    }

# --- the three LLM step prompts, as JS string expressions -------------------
synth = (
    "'Topic: ' + $('Input').item.json.topic + '\\nSource text:\\n' + $json.data + "
    "'\\n\\nAnswer ONLY from the source above and cite each answer with the source: "
    "1) problem in one sentence 2) 3-5 core concepts, one line each 3) the smallest "
    "working example 4) top 3 gotchas 5) anything unspecified or contradicted. "
    "If the source does not cover a question, say \"not covered\" — do not guess.'"
)
draft = (
    "'Turn these cited answers into study notes with sections Problem / Core concepts / "
    "Minimal example / Gotchas / Open questions. Keep every citation. Voice: direct, "
    "concrete, no buzzwords. Add NO facts not below.\\n\\n' + "
    "$('1 Synthesize').item.json.content[0].text"
)
review = (
    "'Fact-check. Mark each claim [grounded] if it traces to the cited source, "
    "[UNSUPPORTED] otherwise. List every UNSUPPORTED claim, then output the final notes "
    "with unsupported claims removed and formatting cleaned.\\n\\n' + "
    "$('2 Draft').item.json.content[0].text"
)

nodes = [
    {"parameters": {}, "name": "Manual Trigger",
     "type": "n8n-nodes-base.manualTrigger", "typeVersion": 1, "position": [-200, 0]},
    {"parameters": {"assignments": {"assignments": [
        {"id": "t", "name": "topic", "value": "Model Context Protocol primitives", "type": "string"},
        {"id": "u", "name": "source_url", "value":
            "https://modelcontextprotocol.io/specification/2025-06-18/server/tools", "type": "string"},
     ]}, "options": {}},
     "name": "Input", "type": "n8n-nodes-base.set", "typeVersion": 3.4, "position": [0, 0]},
    {"parameters": {"url": "={{ $('Input').item.json.source_url }}",
                    "options": {"response": {"response": {"responseFormat": "text"}}}},
     "name": "Fetch", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2, "position": [200, 0]},
    anthropic_node("1 Synthesize", 400, synth),
    anthropic_node("2 Draft", 600, draft),
    anthropic_node("3 Review", 800, review),
]

# n8n requires an id on every node and on the workflow itself.
for i, node in enumerate(nodes):
    node["id"] = "node-%d" % (i + 1)

order = ["Manual Trigger", "Input", "Fetch", "1 Synthesize", "2 Draft", "3 Review"]
connections = {
    a: {"main": [[{"node": b, "type": "main", "index": 0}]]}
    for a, b in zip(order, order[1:])
}

workflow = {
    "id": "fl04-notes",
    "name": "FL-04 source-grounded notes",
    "nodes": nodes,
    "connections": connections,
    "settings": {"executionOrder": "v1"},
    "active": False,
}

with open("workflow.json", "w") as f:
    json.dump(workflow, f, indent=2)
print("wrote workflow.json:", len(nodes), "nodes")
