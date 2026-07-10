# Draw the Path — Portfolio Sitemap + Toolkit

Assignment: *Draw the Path: Portfolio Sitemap + Toolkit* (General AI Fluency, Week 1)
Author: Miguel Garcia Roman
Claim it serves: see [../W1-what-are-you-proving](../W1-what-are-you-proving)

## Sitemap (small on purpose)

One person (a founding backend engineer at a small AI company), one claim (I ship
the small tool that tames an undocumented system), one action (**email me after
reading one repo**). Four pages, each earns its place against that.

```
/  (Home / hero)
│   Claim in one line + one CTA: "Read a repo, then email me."
│   Below the fold: three case links. Nothing else.
│
├── /work  (Case studies)
│     The proof. 2–3 cases, each: the problem · what I did/decided · what came of it.
│     - FlyRank portal CLI (reverse-engineered Server Actions + Auth.js)
│     - BE-01 minimal API
│     - BE-04 containerized service
│
├── /about  (Short)
│     Two paragraphs: who this is for, why I build small. Not a life story.
│
└── /contact  (The one action)
      Email + GitHub. One button. No form with nine fields.
```

Pages I deliberately left out: blog, "skills" bar chart, testimonials, a services
menu. None move the one reader toward the one action; they'd dilute the claim.

## Toolkit

Accounts active: **Claude** (primary), **ChatGPT** (cross-check), **Gemini**,
**Perplexity** (fast lookups). Claude is the one that "follows" this build across
the eight weeks via the Project below.

## Claude Project

Project **FlyRank Backend Internship** — proof statement pasted into the custom
instructions, and it's told to act as a tutor (explain the trade-off, don't just
hand me the answer). Full instructions in [../FL-01](../FL-01).

## Pressure-test prompt (run against the sitemap)

**Prompt:**

```
Act as a skeptical hiring engineer. My claim: "I ship the small, reliable tool
that makes an undocumented backend system usable." My one action: email me after
reading one repo. Here is my sitemap: Home (claim+CTA), Work (2–3 cases), About,
Contact. Attack it. Which page is most likely to lose my one reader before they
click, and what is the single change that would fix it?
```

**Saved answer (Claude, condensed):**

> Your weak link is **Home → Work**. The claim is a "trust me" statement; a
> skeptical engineer wants proof *before* committing to reading a repo. Right now
> Home asks them to jump to /work or /contact on faith. Put the single most
> impressive, verifiable line from your best case *on the home hero* — e.g. "Built
> a working CLI against an app that publishes no API, by reading its Server-Action
> traffic." Now the claim is evidenced above the fold, and the click to /work is
> to see *how*, not to find out *whether*. About and Contact are fine and correctly
> minimal. Don't add pages; add proof earlier.

## One thing I'll change

Add a one-line, concrete proof to the **home hero** (the CLI-with-no-API line)
instead of leading with the abstract claim. Move evidence up; make /work the
"how," not the "whether." (Applied to the sitemap note above.)
