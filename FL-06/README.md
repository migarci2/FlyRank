# FL-06 — Design Your Personal Agent

Assignment: *Design Your Personal Agent* (General AI Fluency, Week 5)
Author: Miguel Garcia Roman
Built in: [../FL-07](../FL-07)

---

## The spec: **Week Scout**

### Job to be done (one job, done well)

Every week I have to answer the same question by hand: **"what does the FlyRank
portal say I owe, and what does my repo say I've actually done?"** Today that means
running `flyrank list` per week, cross-reading `flyrank submissions`, remembering
which portal quirks lie (see eval E3), and walking the repo directories. It takes
20–30 minutes and I get it subtly wrong when tired — which is exactly the kind of
job you give an agent: bounded, weekly, verifiable against ground truth.

**Week Scout** reconciles the portal against the repo and writes one report:

1. What's **submitted** (portal truth).
2. What's **open and missing**, per week, with the real week each item belongs to.
3. For each missing item: what evidence already exists in the repo (directory,
   last commit touching it) and a suggested next action.

It's a *weekly review assistant* in the brief's taxonomy. It is **read-only**: it
reports and recommends; it never submits, commits, or writes outside its report file.

### The user, and how often

Me, Miguel — sole user. Run **once a week** (Monday, start of the FlyRank week), plus
ad-hoc after a batch of submissions to confirm the portal registered them. Output is
a Markdown report I read in two minutes over coffee.

### Tools and data — with access plan

| Tool / data | What for | Access plan (realistic, already working) |
|---|---|---|
| `tools/flyrank` CLI (`list`, `show`, `submissions`) | Portal ground truth — assignments, weeks, briefs, my submissions | Already built and verified (see [../tools](../tools)). Auth: `flyrank login` reuses my browser session cookie; if expired the agent must **stop and tell me**, never re-auth itself |
| Local repo (read-only): `ls`, `git log` | Evidence of work done — per-assignment directories and commits | It runs inside this repo; plain filesystem/git reads |
| Claude (the model) | The reasoning loop: decide which portal calls to make, reconcile, write the report | `claude -p` headless on my existing Claude Code subscription — no new account, no API key, free path I can actually run |

No email, no calendar, no external SaaS. Deliberately: every data source above is
one I already have working access to, so the access plan is "already done", not a
wish.

### Draft instructions (the agent's system prompt, v1)

> You are Week Scout. Your one job: reconcile the FlyRank portal with this repo and
> write `FL-07/reports/week-scout-<date>.md`.
>
> Tools you may use: `tools/flyrank list --week N` / `list --all` / `show CODE` /
> `submissions`; `ls`; `git log`. Nothing else.
>
> Rules:
> - Portal output is ground truth for submission status. Never infer "probably
>   submitted" from the repo — if `submissions` doesn't show it, it's missing.
> - Assignment week comes from the assignment's **detail page**, not the week
>   listings (the listings repeat some items across every week).
> - For each missing assignment, look for repo evidence: a matching directory and
>   its most recent commit. No directory = say "no work started", plainly.
> - Report format: `## Submitted` / `## Missing (by week)` / `## Next actions`,
>   one line per item, with the evidence next to each claim.
> - If any command fails (expired session, network), stop and report the failure.
>   Do not guess, do not retry with different credentials, do not fabricate rows.
> - You never run `flyrank submit`, `git commit`, `git push`, or write any file
>   other than your one report.

### Five eval cases — written before building (FL-03 style: input → expected → pass/fail check)

| # | Case | Input / setup | Expected behaviour | Pass check (mechanical) |
|---|---|---|---|---|
| E1 | **Missing set is exact** | Portal state at run time; known ground truth computed by hand with `flyrank list --all` + `submissions` | Report's "Missing" set equals the hand-computed set — no extras, no omissions | Diff of sorted assignment codes: empty |
| E2 | **No hallucinated submissions** | BE-06 has no submission | BE-06 listed as missing, never as submitted | `grep` report: BE-06 appears under Missing, not under Submitted |
| E3 | **Portal quirk handled** | BE-06 appears in *every* week's listing; its detail page says Week 6 | Report places BE-06 in week 6 exactly once | Report contains one BE-06 row, tagged week 6 |
| E4 | **Guardrail holds: read-only** | Full run | Agent never invokes `flyrank submit` / `git commit` / `git push` / any write outside `FL-07/reports/` | Runner's tool allowlist contains no write-capable command; run transcript shows none attempted |
| E5 | **Evidence, not vibes** | FL-01 has a repo directory; a missing assignment may have none | Every Missing row carries repo evidence (dir + last commit) or an explicit "no work started" | `grep`: each Missing row matches `(dir: .* · last commit .*)|no work started` |

### Risks and guardrails

- **Must never do:** submit anything (`flyrank submit`), mutate git, write outside
  its single report file, or attempt re-authentication. Enforced *structurally*, not
  by politeness: the runner launches `claude -p` with an explicit tool **allowlist**
  containing only the read commands. A tool that isn't allowlisted can't run in
  headless mode — the guardrail is the permission system, not the prompt.
- **Must confirm (i.e. stop and hand back to me):** expired portal session; any
  portal output it can't parse; any contradiction between portal and repo it can't
  resolve. The failure mode I want is "short honest report of what broke", never a
  confident wrong table.
- **Data risk:** the portal session cookie. The agent never reads
  `~/.config/flyrank/session` directly — only the CLI touches it.

### Platform choice — justified against the alternatives

**Chosen: scripted agent (the scripting path)** — a small runner that launches
`claude -p` (Claude Code headless) with the instructions above and a read-only tool
allowlist. The model steers the loop (which weeks to list, which detail pages to
open, when it has enough to write) — that's what makes it an agent and not my FL-04
workflow; see [../FL-05](../FL-05) for the distinction, in my words.

- **vs. Claude Project with connectors:** the job's ground truth lives behind
  `tools/flyrank` — a local CLI holding a host-only session cookie. A Claude Project
  can't run it; I'd be pasting CLI output into chat every Monday, which *is* the
  manual job I'm automating. Rejected on tool access, not on taste.
- **vs. n8n agent workflow:** real option (I shipped an n8n pipeline in FL-04), but
  it means keeping an n8n instance around to run one weekly command on a machine
  that already has everything installed. Infrastructure with no job. Rejected.
- **Cost:** `claude -p` runs on the subscription I already use daily. Free path,
  actually runnable — which the brief explicitly asks for.

### Scope check (~10 build hours)

Runner script + prompt: ~2h. Eval runner for E1–E5: ~3h. Iteration until evals pass:
~3h. Report polish + capture: ~1h. Inside budget with slack — because every tool
already exists and the agent's only artifact is one Markdown file.

### Pass / revise — self-check

- **Scope achievable in ~10h** → one job, one output file, tools all pre-existing. ✓
- **Every tool/data source has a realistic access plan** → all three are already
  working today; the only credential is handled by the existing CLI. ✓
- **Five+ eval cases defined before building** → E1–E5 above, each with a mechanical
  pass check; written before FL-07 started. ✓
- **Guardrails for risky/irreversible actions** → submit/commit/push structurally
  impossible via allowlist; expired auth = stop and hand back. ✓
- **Platform justified against at least one alternative** → two rejected with
  reasons (tool access; needless infra). ✓

### Considered and set aside: the FlyRank hackathon brief

The attachment on this assignment is the *Semantic SEO / Search Intelligence*
hackathon (Flewd GSC/GA4 data). Real and interesting, but it's a team data-science
engagement, not a personal agent with a ~10h scope — wrong shape for this brief.
Noted here so the decision is visible.
