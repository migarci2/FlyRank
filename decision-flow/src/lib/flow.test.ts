import assert from "node:assert/strict";
import test from "node:test";
import { executeFlow, initialEdges, initialNodes, type DecisionEdge } from "./flow.ts";

test("takes the YES then NO path through durable steps", async () => {
  const answers = ["YES", "NO"] as const;
  let index = 0;
  const result = await executeFlow(
    { input: "Login is broken", nodes: initialNodes, edges: initialEdges },
    async (_id, work) => work(),
    async () => answers[index++],
  );
  assert.equal(result.result, "Standard queue");
  assert.deepEqual(result.logs.map((log) => log.answer), ["YES", "NO", "RESULT"]);
});

test("rejects cycles instead of running forever", async () => {
  const nodes = initialNodes.slice(0, 2);
  const edges: DecisionEdge[] = [
    { id: "a", source: "start", target: "urgent", sourceHandle: "YES", data: { answer: "YES" as const } },
    { id: "b", source: "urgent", target: "start", sourceHandle: "YES", data: { answer: "YES" as const } },
  ];
  await assert.rejects(() => executeFlow(
    { input: "x", nodes, edges },
    async (_id, work) => work(),
    async () => "YES",
  ), /Cycle detected/);
});
