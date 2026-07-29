#!/usr/bin/env python3
# ponytail: minimal live view of the agent's stream-json — tool calls + final text.
import json, sys
for line in sys.stdin:
    try:
        e = json.loads(line)
    except ValueError:
        continue
    if e.get("type") == "assistant":
        for b in e.get("message", {}).get("content", []):
            if b.get("type") == "tool_use":
                arg = b.get("input", {})
                cmd = arg.get("command") or arg.get("file_path") or ""
                print(f"  → {b['name']}: {cmd}"[:110], flush=True)
            elif b.get("type") == "text" and b["text"].strip():
                print(b["text"].strip()[:400], flush=True)
    elif e.get("type") == "result":
        print(f"\n✓ run finished: {e.get('num_turns')} turns, "
              f"{e.get('duration_ms', 0) // 1000}s", flush=True)
