import type { Edge, Node } from "@xyflow/react";
import { z } from "zod";

export type DecisionData = { label: string; prompt: string; kind: "decision" | "result" };
export type DecisionNode = Node<DecisionData, "decision">;
export type DecisionEdge = Edge<{ answer: "YES" | "NO" }> & { sourceHandle: "YES" | "NO" };
export type FlowLog = { nodeId: string; label: string; answer: "YES" | "NO" | "RESULT"; detail: string };

export const initialNodes: DecisionNode[] = [
  { id: "start", type: "decision", position: { x: 40, y: 170 }, data: { kind: "decision", label: "Support request?", prompt: "Is this a genuine customer support request?" } },
  { id: "urgent", type: "decision", position: { x: 390, y: 70 }, data: { kind: "decision", label: "Urgent?", prompt: "Does this describe an outage, security issue, data loss, or blocked access?" } },
  { id: "priority", type: "decision", position: { x: 740, y: 30 }, data: { kind: "result", label: "Priority queue", prompt: "" } },
  { id: "routine", type: "decision", position: { x: 740, y: 210 }, data: { kind: "result", label: "Standard queue", prompt: "" } },
  { id: "archive", type: "decision", position: { x: 390, y: 330 }, data: { kind: "result", label: "Archive", prompt: "" } },
];

export const initialEdges: DecisionEdge[] = [
  { id: "start-yes", source: "start", sourceHandle: "YES", target: "urgent", label: "YES", data: { answer: "YES" } },
  { id: "start-no", source: "start", sourceHandle: "NO", target: "archive", label: "NO", data: { answer: "NO" } },
  { id: "urgent-yes", source: "urgent", sourceHandle: "YES", target: "priority", label: "YES", data: { answer: "YES" } },
  { id: "urgent-no", source: "urgent", sourceHandle: "NO", target: "routine", label: "NO", data: { answer: "NO" } },
];

const nodeSchema = z.object({
  id: z.string().min(1), type: z.literal("decision").optional(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({ label: z.string().min(1).max(80), prompt: z.string().max(1000), kind: z.enum(["decision", "result"]) }),
}).passthrough();

const edgeSchema = z.object({
  id: z.string().min(1), source: z.string().min(1), target: z.string().min(1),
  sourceHandle: z.enum(["YES", "NO"]).nullable().optional(),
  data: z.object({ answer: z.enum(["YES", "NO"]) }).optional(),
}).passthrough();

export const runSchema = z.object({
  input: z.string().trim().min(1).max(2000),
  nodes: z.array(nodeSchema).min(1).max(50),
  edges: z.array(edgeSchema).max(100),
});

export async function executeFlow(
  value: z.infer<typeof runSchema>,
  runStep: (id: string, work: () => Promise<"YES" | "NO">) => Promise<"YES" | "NO">,
  decide: (prompt: string, input: string) => Promise<"YES" | "NO">,
) {
  const nodes = new Map(value.nodes.map((node) => [node.id, node]));
  const incoming = new Set(value.edges.map((edge) => edge.target));
  let current = value.nodes.find((node) => !incoming.has(node.id)) || value.nodes[0];
  const logs: FlowLog[] = [];
  const visited = new Set<string>();

  while (current) {
    if (visited.has(current.id)) throw new Error(`Cycle detected at ${current.data.label}`);
    visited.add(current.id);
    if (current.data.kind === "result") {
      logs.push({ nodeId: current.id, label: current.data.label, answer: "RESULT", detail: current.data.label });
      return { result: current.data.label, logs };
    }
    const answer = await runStep(`node-${current.id}`, () => decide(current.data.prompt, value.input));
    logs.push({ nodeId: current.id, label: current.data.label, answer, detail: current.data.prompt });
    const edge = value.edges.find((candidate) => candidate.source === current.id &&
      (candidate.data?.answer || candidate.sourceHandle) === answer);
    if (!edge) return { result: `Stopped after ${current.data.label}: no ${answer} edge`, logs };
    const next = nodes.get(edge.target);
    if (!next) throw new Error(`Edge points to missing node ${edge.target}`);
    current = next;
  }
  throw new Error("Flow has no starting node");
}
