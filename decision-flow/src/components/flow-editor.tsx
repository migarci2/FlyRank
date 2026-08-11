"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Background, Controls, MarkerType, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, type Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DecisionNodeView } from "@/components/decision-node";
import { initialEdges, initialNodes, type DecisionEdge, type DecisionNode, type FlowLog } from "@/lib/flow";

const STORAGE_KEY = "flyrank-decision-flow";

function Editor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<DecisionNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [input, setInput] = useState("I cannot log in after resetting my password.");
  const [logs, setLogs] = useState<FlowLog[]>([]);
  const [result, setResult] = useState("Not run yet");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  const selected = nodes.find((node) => node.id === selectedId);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const flow = JSON.parse(saved);
      setNodes(flow.nodes);
      setEdges(flow.edges);
    } catch { localStorage.removeItem(STORAGE_KEY); }
  }, [setEdges, setNodes]);

  const onConnect = useCallback((connection: Connection) => {
    const answer = connection.sourceHandle === "NO" ? "NO" : "YES";
    const edge: DecisionEdge = { ...connection, id: `${connection.source}-${answer}-${connection.target}`, sourceHandle: answer, label: answer, data: { answer }, markerEnd: MarkerType.ArrowClosed };
    setEdges((current) => [...current, edge]);
  }, [setEdges]);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
    setResult("Saved in this browser");
  };

  const addNode = () => {
    const id = `node-${Date.now()}`;
    setNodes((current) => [...current, { id, type: "decision", position: { x: 180 + current.length * 28, y: 120 + current.length * 18 }, data: { kind: "decision", label: "New decision", prompt: "Does this input meet the condition?" } }]);
    setSelectedId(id);
  };

  const exportFlow = () => {
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: "application/json" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "decision-flow.json";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const importFlow = async (file?: File) => {
    if (!file) return;
    try {
      const flow = JSON.parse(await file.text());
      if (!Array.isArray(flow.nodes) || !Array.isArray(flow.edges)) throw new Error("Expected nodes and edges arrays");
      setNodes(flow.nodes);
      setEdges(flow.edges);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Invalid flow file"); }
  };

  const updateSelected = (field: "label" | "prompt", value: string) => {
    if (!selectedId) return;
    setNodes((current) => current.map((node) => node.id === selectedId ? { ...node, data: { ...node.data, [field]: value } } : node));
  };

  const run = async () => {
    setRunning(true);
    setError("");
    setLogs([]);
    try {
      const payload = encodeURIComponent(JSON.stringify({ input, nodes, edges }));
      const response = await fetch(`/api/run?payload=${payload}`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Flow failed");
      setLogs(body.logs);
      setResult(body.result);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Flow failed"); }
    finally { setRunning(false); }
  };

  const paintedEdges = useMemo(() => {
    const taken = new Set(logs.slice(0, -1).map((log, index) => `${log.nodeId}:${log.answer}:${logs[index + 1]?.nodeId}`));
    return edges.map((edge) => ({ ...edge, animated: taken.has(`${edge.source}:${edge.data?.answer || edge.sourceHandle}:${edge.target}`), markerEnd: MarkerType.ArrowClosed }));
  }, [edges, logs]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><p className="kicker">Workflow lab</p><h1>Decision Flow</h1></div>
        <div className="actions">
          <Button variant="outline" onClick={addNode}>Add node</Button>
          <Button variant="outline" onClick={save}>Save</Button>
          <Button variant="outline" onClick={exportFlow}>Export</Button>
          <Button variant="outline" onClick={() => importRef.current?.click()}>Import</Button>
          <input ref={importRef} hidden type="file" accept="application/json" onChange={(event) => importFlow(event.target.files?.[0])} />
          <Button onClick={run} disabled={running}>{running ? "Running..." : "Run flow"}</Button>
        </div>
      </header>

      <section className="workspace">
        <div className="canvas" aria-label="Decision flow canvas">
          <ReactFlow nodes={nodes} edges={paintedEdges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} onNodeClick={(_, node) => setSelectedId(node.id)} nodeTypes={{ decision: DecisionNodeView }} fitView>
            <Background gap={24} size={1} />
            <Controls />
          </ReactFlow>
        </div>
        <aside className="inspector">
          <section><h2>Test input</h2><Textarea value={input} onChange={(event) => setInput(event.target.value)} maxLength={2000} rows={4} /></section>
          <section>
            <h2>Selected node</h2>
            {selected ? <div className="fields">
              <label>Name<Input value={selected.data.label} onChange={(event) => updateSelected("label", event.target.value)} /></label>
              {selected.data.kind === "decision" && <label>Prompt<Textarea value={selected.data.prompt} onChange={(event) => updateSelected("prompt", event.target.value)} rows={5} /></label>}
            </div> : <p className="muted">Select a node to edit it.</p>}
          </section>
          <section aria-live="polite">
            <div className="result-heading"><h2>Execution</h2><span>{result}</span></div>
            {error && <p className="error">{error}</p>}
            {logs.length ? <ol className="logs">{logs.map((log) => <li key={log.nodeId}><b>{log.label}</b><span>{log.answer}</span></li>)}</ol> : <p className="muted">Run the graph to see each durable step.</p>}
          </section>
        </aside>
      </section>
    </main>
  );
}

export function FlowEditor() { return <ReactFlowProvider><Editor /></ReactFlowProvider>; }
