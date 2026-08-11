# AI Decision Flow

Assignment: *Build an AI Decision Flow with React Flow + Inngest* (Backend AI Engineering, Week 7)

A small visual editor for YES/NO AI decisions. A user can add and connect nodes, edit prompts, persist the graph locally, export/import JSON, and run the graph. Every decision executes as a durable Inngest step; the path and final outcome return to the execution panel.

## Run it

Requirements: Node 20+, two terminals, and either Ollama or any OpenAI-compatible provider.

```bash
npm install
cp .env.example .env

# terminal 1
npm run dev:inngest

# terminal 2
npm run dev
```

Open `http://localhost:3000`. The example starts in `LLM_STUB=1`, so it works with no key. For real model decisions, set `LLM_STUB=0` and the three `LLM_*` variables. The default points at Ollama with `gemma3:1b`; the same code works against OpenRouter by changing those values.

## What is implemented

- React Flow canvas with draggable nodes and typed YES/NO handles
- Node creation, edge creation, prompt editing, and graph validation
- Local browser save plus JSON export/import
- Inngest durable endpoint at `POST /api/run`; each visited decision is one `step.run`
- OpenAI-compatible model call constrained to exactly YES or NO
- Visible execution order, final result, active-edge animation, loading and error states
- Cycle detection and missing-node/edge errors; traversal cannot loop forever
- Responsive layout and system light/dark themes using customised shadcn components

The starter graph classifies a support message. A real local run through the Inngest dev server produced:

```json
{
  "result": "Priority queue",
  "logs": [
    { "nodeId": "start", "answer": "YES" },
    { "nodeId": "urgent", "answer": "YES" },
    { "nodeId": "priority", "answer": "RESULT" }
  ]
}
```

## Architecture

```text
React Flow editor
  -> POST /api/run?payload=<validated graph>
  -> Inngest durable endpoint
       -> step.run(node-start)  -> AI says YES/NO
       -> select matching edge
       -> step.run(next-node)   -> AI says YES/NO
       -> outcome node
  <- ordered logs + result
```

The graph travels in the query because the Inngest durable endpoint adapter consumes the HTTP body before replay. That is adequate for this bounded editor. If graphs grow beyond this assignment, save them by ID and send only the ID.

## Checks

```bash
npm run lint
npm test       # path selection and cycle rejection
npm run build  # production compile and typecheck
```
