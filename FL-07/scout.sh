#!/usr/bin/env bash
# Week Scout runner — launches the agent (claude -p, headless) with a read-only
# tool allowlist. The allowlist IS the guardrail: the agent has no write-capable
# tool at all (submit/commit/push/file writes are denied by the permission system,
# not by the prompt). The agent emits the report as its final message; this runner
# is what writes it to disk.
set -euo pipefail
cd "$(dirname "$0")/.."   # repo root

mkdir -p FL-07/reports
today=$(date +%F)
report="FL-07/reports/week-scout-$today.md"
transcript="FL-07/reports/transcript-$today.jsonl"

claude -p "$(cat FL-07/instructions.md)

Today is $today." \
  --allowedTools "Bash(tools/flyrank list:*),Bash(tools/flyrank show:*),Bash(tools/flyrank submissions:*),Bash(ls:*),Bash(git log:*)" \
  --output-format stream-json --verbose \
  < /dev/null | tee "$transcript" | python3 -u FL-07/live.py

# the agent's final message is the report; extract it from the transcript
python3 - "$transcript" > "$report" <<'PY'
import json, sys
for line in open(sys.argv[1]):
    try: e = json.loads(line)
    except ValueError: continue
    if e.get("type") == "result":
        print(e.get("result", ""))
PY

echo "report:     $report"
echo "transcript: $transcript"
