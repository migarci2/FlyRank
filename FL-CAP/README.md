# General AI Fluency — Impact Project (Capstone)

Capstone: *fl-cap* — "Master the AI stack, build a personal brand with a real
website, ship a personal agent."
Author: Miguel Garcia Roman
This page is the review index: every claim links to the artifact that proves it.

---

## 1. The real website (personal brand)

**[https://migarci2.dev](https://migarci2.dev)** — my own domain, HTTPS, free
tier, live since Week 4. Next.js static export on Cloudflare Workers, one
`wrangler deploy` to ship ([stack decision](../W4-choose-stack), with the
mis-scope I corrected kept visible). It carries the identity kit
([W3](../W3-identity-kit)), the content/CTA ladder ([W3](../W3-content-cta-map)),
a blog with RSS, my CV, and since Week 8 an actual backend feature — the
[signal counter](../W8-make-it-do-something) (Worker + KV).

Brand ≠ just the site: the claim behind it is written down
([W1: what I'm proving](../W1-what-are-you-proving)), and it survived a
[fresh-eyes crit](../W7-survive-the-crit) whose hardest finding — the site was
ahead of its published evidence — I accepted and am fixing, with a
[monthly routine](../W10-send-the-link) making sure the next case study ships.

## 2. The personal agent, shipped

**Week Scout** — reconciles the FlyRank portal against this repo and writes my
Monday report. Spec with pre-build evals ([FL-06](../FL-06)) → build with an
honest log — 3 runs, my bugs and its bugs ([FL-07](../FL-07)) → docs a
stranger could run it from, v1→v2 eval table, limitations list
([FL-09](../FL-09)). Final evals **5/5 against the live portal**, guardrails
structural (read-only allowlist; the agent once *refused to work around* a
denied write — transcript kept). Its tool is itself a shipped artifact: the
`flyrank` CLI, reverse-engineered against a portal with no public API, which
survived a portal migration mid-internship.

## 3. The AI stack, mastered by using it

- **Workflow audit + tooling** ([FL-01](../FL-01)) — and the Claude Project
  that tutored the whole track.
- **Prompting on real tasks** ([FL-02](../FL-02), [W2 prompt ladder](../W2-prompt-ladder)).
- **Automation workflow, 5 measured runs** ([FL-04](../FL-04)) — and I can
  [say precisely why it's a workflow, not an agent](../FL-05).
- **Agents + MCP** ([FL-05](../FL-05)) — then practiced, not just explained:
  FL-06/07/09 above.
- **AI as build partner with understanding kept** — the
  [W6 explainer](../W6-explain-it-like-you-built-it) and every honest
  commit note in this repo's history.
- Parallel backend track along the way: [CRUD](../BE-01) → [SQLite](../BE-02)
  → [Docker](../BE-04) → [auth](../BE-auth) → [scraper](../BE-scraper) →
  [background jobs](../BE-06) → [PDF reports](../BE-report).

## Honest state at submission

Still open, tracked, not hidden: the crit's content must-fixes (publish
ProofMesh/agenctf + the portal-CLI repo, GitHub profile rewrite) with a site
revision in progress; the FL-09 demo video (script ready, recording pending);
a booking link on the site. The still-ugly list lives in
[W5](../W5-ship-the-ugly-one) and the plan to keep building in
[W10](../W10-send-the-link).
