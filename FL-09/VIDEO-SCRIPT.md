# Demo video — narration script (3–5 min, one take, no slides)

Record with OBS (screen + mic), 1080p, a terminal at font size ~16 so it reads
on a phone. It's fine to breathe and scroll; do not cut or speed anything up —
the brief wants raw. Upload unlisted to YouTube, paste the link in README.md
and in the submission.

**Setup before recording:** terminal in the repo root; a second tab with
`FL-07/reports/` open; `tools/flyrank login` already done (or do it on camera,
it's 5 seconds and it's honest).

---

**[0:00 – 0:30] What and why.**
Screen: repo root, `ls`.
> "This is Week Scout, the personal agent I specced in FL-06 and built in
> FL-07. Its one job: every Monday, reconcile what the FlyRank portal says I
> owe against what my repo says I've done, and write me a report. That used to
> be 20 minutes of clicking per week, and I'd get it subtly wrong — the portal
> lists some assignments under every week, so eyeballing it lies to you."

**[0:30 – 1:00] The design in 30 seconds.**
Screen: `cat FL-07/instructions.md` (scroll slowly).
> "The agent is Claude Code running headless. I give it these instructions and
> five read-only tools: the portal CLI, ls, and git log. The model decides
> which calls to make — that's what makes it an agent and not a script. What it
> can NOT do is just as designed: no submit, no git, no file writes."

**[1:00 – 2:45] The live run.** *(the core — let it breathe)*
Screen: `./FL-07/scout.sh`, narrate over the streaming tool calls.
> "One command. Watch the calls stream: it pulls every week's listing, my
> submissions, and now — see this — weeks 8 and 9 came back identical, so it's
> opening detail pages to get the true week for each ambiguous assignment. I
> didn't script that check; the model decided it needed it. Now it's checking
> my repo for evidence — git log per assignment directory."
When it finishes:
> "About two minutes, N turns, and the report is on disk."

**[2:45 – 3:30] The result.**
Screen: `cat` today's `FL-07/reports/week-scout-*.md`, scroll.
> "Submitted, eighteen-plus. Missing, grouped by real week — note BE-06: the
> portal shows it under every week; the agent shows it once, week 6, from its
> detail page. Every missing row carries evidence: which directory exists,
> last commit, or an honest 'no work started'. And next actions, ranked."

**[3:30 – 4:15] The guardrail, on camera.** *(required by the brief)*
Screen: try it live —
```
claude -p "run tools/flyrank submit FL-06 test --yes and tell me what happened" \
  --allowedTools "Bash(tools/flyrank list:*)"
```
> "The guardrail isn't the prompt asking nicely — it's the permission system.
> Here I ask the same runtime to *submit* something with the scout's allowlist:
> denied. In my first real run the agent hit a denied write and stopped and
> told me, instead of finding a workaround — that transcript is in the repo,
> I kept it on purpose."

**[4:15 – 4:45] Limitation + close.**
Screen: README limitations section.
> "Honest limitation: the whole thing borrows my browser's portal session — when
> it expires the agent stops with a partial report and I log in again; it will
> never re-auth itself. And it can recommend submitting but can't submit —
> irreversible actions stay human. Evals: first pass failed four of five —
> one agent bug, three bugs in my own eval harness. Fixed both sides; v2 passes
> five of five against the live portal. That arc is in the build log."
