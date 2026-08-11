"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { DecisionNode } from "@/lib/flow";

export function DecisionNodeView({ data, selected }: NodeProps<DecisionNode>) {
  const result = data.kind === "result";
  return (
    <div className={`decision-node ${selected ? "is-selected" : ""} ${result ? "is-result" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <span className="node-kind">{result ? "Outcome" : "Decision"}</span>
      <strong>{data.label}</strong>
      {!result && <p>{data.prompt}</p>}
      {!result && <>
        <Handle id="YES" type="source" position={Position.Right} style={{ top: "38%" }} />
        <Handle id="NO" type="source" position={Position.Right} style={{ top: "72%" }} />
        <span className="handle-label yes">YES</span>
        <span className="handle-label no">NO</span>
      </>}
    </div>
  );
}
