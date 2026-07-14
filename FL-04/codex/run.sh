#!/usr/bin/env bash
# FL-04 source-grounded-notes pipeline — Codex (gpt-5.5) as the AI runner.
# Three distinct AI steps with defined handoffs (synthesize -> draft -> review),
# each the input of the next; whole run wall-clock timed.
#   usage: run.sh "<topic>" <source_file> <out_md>
# Source material is fetched separately (gather step) and passed in as <source_file>.
set -euo pipefail
topic=$1; src=$2; out=$3
cx() { codex exec -s read-only "$1" 2>/dev/null; }   # 2>/dev/null drops hook/token noise
start=$(date +%s)

# [1] synthesize — grounded, cited answers to the fixed question set
synth=$(cx "Source-grounded synthesis. Topic: $topic
SOURCE (answer ONLY from this text, and cite it):
$(cat "$src")

Produce, each answer citing the source:
1) the problem in one sentence
2) 3-5 core concepts, one line each
3) the smallest concrete example
4) the top 3 gotchas
5) anything the source leaves unspecified or contradicts
If the source does not cover a point, write 'not covered' — do not guess.
Output only the numbered answers.")

# [2] draft — the notes template, citations preserved
draft=$(cx "Turn these cited answers into study notes with sections:
Problem / Core concepts / Minimal example / Gotchas / Open questions.
Keep every citation. Voice: direct, concrete, no buzzwords. Add NO facts not below.
$synth")

# [3] review — mark and strip anything not source-grounded
review=$(cx "Fact-check these notes. Mark any claim not traceable to a cited source as
[UNSUPPORTED]; list every one, then output the FINAL notes with unsupported claims
removed and formatting cleaned. Notes:
$draft")

end=$(date +%s); secs=$((end - start))
{
  echo "# Study notes — $topic"
  echo
  echo "_FL-04 pipeline · Codex (gpt-5.5) runner · synthesize→draft→review · wall-clock ${secs}s · source: $(basename "$src")_"
  echo
  echo "$review"
} > "$out"
echo "done: $topic in ${secs}s -> $out"
