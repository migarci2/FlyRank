# Three Roads: Choose Your Stack with AI

Assignment: *Three Roads: Choose Your Stack with AI* (General AI Fluency, Week 4)
Author: Miguel Garcia Roman
Result, live: **[migarci2.dev](https://migarci2.dev)**

## The constraints I gave the model

- **Free only.** No paid host, no paid tier to stay up.
- **Honest skill level.** Strong systems/low-level; comfortable in React/TS too.
- **What the site must do.** Not a brochure — it has a **⌘K command palette**, an
  animated space background, a live **terminal panel**, warp/glitch/pixel-burst
  motion, live-counting stats, and a **blog** with per-post pages + RSS.
- **How my work shows.** Real projects (Linux Kernel, ProofMesh, agenctf, webserv),
  code-literate, on my [identity kit](../W3-identity-kit) (Geist Pixel, amber-on-black).

## Three options (simplest → most powerful)

### 1. Plain HTML + CSS on GitHub Pages *(simplest)*
- **For:** nothing to build or maintain.
- **Against:** I'd hand-write the command palette, the animated canvas, the terminal,
  the blog routing and RSS in vanilla JS across many files. The interactivity that *is*
  the site becomes the thing this stack does worst. Rejected.

### 2. Astro on Cloudflare Pages *(middle)*
- **For:** great for content + build-time code highlighting; static output.
- **Against:** my site is **interaction-heavy**, not content-heavy. Astro's "ship zero
  JS" strength is wasted here — I'd be reaching for client islands for nearly every
  component (palette, warp, terminal, counters), which is Astro used against its grain.
  A real option, but not the right shape for *this* site.

### 3. Next.js (React) → static export on Cloudflare *(most powerful — chosen)*
- **For:** React is the right tool for a stateful, animated UI (palette, warp state,
  terminal, counters), and Next's app router gives me the blog (`[slug]` +
  `generateStaticParams`) and RSS for free. Crucially, I run **`output: 'export'`** →
  it compiles to **static files**, which deploy to Cloudflare Workers static assets.
- **Against:** a real build step + `node_modules`. That's the whole cost.

## Pressure-test on the front-runner (Next.js)

- **What breaks if I pick the simplest?** I reimplement React's job by hand — the
  command palette and animation state especially. More code, more bugs, worse.
- **What do I maintain if I pick the most powerful?** With `output: 'export'`, **no
  server** — just static files on Cloudflare and an occasional `npm update`. The
  scary part of "most powerful" (a running Next server) is the part I deliberately
  don't take.
- **Can I finish in two weeks?** It's already built and **live on migarci2.dev**.
- **Does it show my work the way it needs to be shown?** Yes — the interactivity *is*
  the demonstration (a terminal you can type `help` into beats a screenshot of one).

## Decision + rationale (my words)

**Chosen: Next.js with `output: 'export'`, deployed to Cloudflare Workers static
assets, on my own domain `migarci2.dev`.**

I build backends with no framework and I stand by that — but this is an *interactive
front-end*, a different problem. Here React earns its place: the command palette,
the warp/terminal state, the live counters are genuinely stateful UI, and hand-rolling
that in vanilla JS would be more code and more fragile, not less. The real trap wasn't
"using a framework" — it was **shipping a server I don't need**. Static export removes
exactly that: Next gives me the components and the blog/RSS build; the export gives me
plain files with no runtime. Lazy in the way that counts.

- **Plain HTML — rejected:** simplest to host, but I'd rebuild React's core value by
  hand for the interactive parts. Cheaper to start, worse forever.
- **Astro — rejected (honestly, a close call):** excellent for content sites; mine is
  interaction-first, so Astro's zero-JS strength doesn't apply and I'd fight it with
  islands everywhere.

> **Correction to my earlier draft:** an earlier version of this write-up picked Astro
> and called Next.js "over-engineering." That was wrong for *this* site — I was judging
> a brochure when the real site is an interactive terminal. The over-engineering to
> avoid is a **server**, and `output: 'export'` avoids it while keeping React where it
> genuinely helps. Keeping the mistake visible: the point of the exercise is choosing
> by what the site does, and I'd mis-scoped what mine does.

**Can I maintain this?** Yes — static files on free Cloudflare hosting, deploy with one
`wrangler deploy`, upkeep is an occasional dependency bump. It fits my skill (I write
React) and my time.

**Does it show my work well?** Yes — a live, typeable terminal and real project cards
demonstrate the work instead of describing it.

## The backend question (honest)

**Does the site need a backend? Not yet — correctly not.** It's fully static (export).
My systems/backend work (kernel patches, agenctf, webserv, ProofMesh) is shown **as
linked projects**, not run live on the site. Standing up a server to serve a static
portfolio would be the exact over-build I just argued against.

## Pass / revise — self-check

- **Three genuine options with trade-offs, not one obeyed** → HTML/Pages, Astro,
  Next.js-static, each with real for/against (Astro was a close call, not a strawman). ✓
- **Chosen stack is free, matched to real needs, shows my kind of work** → Next static
  export on Cloudflare; interactive UI shown live. ✓
- **Rationale in my own words, includes "can I maintain this"** → yes, and I corrected
  a genuine earlier mis-scope. ✓
- **Backend question answered honestly** → "not yet." ✓
