# Ship the Ugly One

Assignment: *Ship the Ugly One* (General AI Fluency, Week 5)
Author: Miguel Garcia Roman
Live: **[https://migarci2.dev](https://migarci2.dev)**

---

## Every page from the sitemap, live

The W1 sitemap (`/`, `/work`, `/about`, `/contact`) evolved while building: the
one-reader-one-action logic from [W1](../W1-draw-the-path) collapsed work, about
and contact into **sections of one page** (each still a nav target), and the site
gained the project and blog pages the sitemap reserved space for. Same claim, same
single CTA; fewer clicks between the reader and the proof. The sitemap as shipped,
checked live today (all HTTP 200, logged-out):

| Page | W1 ancestor | Live |
|---|---|---|
| `/` — hero: claim + CTA | Home | ✓ 200 |
| `/#work` — 3 real cases (Linux Kernel, ProofMesh, agenctf), each → real repo/thread | /work | ✓ 200 |
| `/#contact` — email (the one action) · github · linkedin · cv | /contact + /about | ✓ 200 |
| `/kernel` — case detail: the kernel work | /work child | ✓ 200 |
| `/blog` + 3 posts + `/rss.xml` | (reserved space) | ✓ 200 ×5 |
| `/cv.pdf` | — | ✓ 200 |

**Real work in, no placeholders:** the cases are the actual kernel patches (linked
to the real lore threads), ProofMesh and agenctf repos; the blog posts are written;
the CV is the real one. No lorem, no empty slots, no "coming soon".

## I can explain how it's built (no mystery code)

Next.js App Router with `output: 'export'` → plain static files → Cloudflare
Workers static assets, custom domain. The full stack decision — including the
wrong first draft I corrected — is in [W4-choose-stack](../W4-choose-stack); the
file-by-file inventory of what's actually deployed is in [PF-04](../PF-04). AI was
the build partner throughout; every piece I shipped I can walk through, which is
exactly why the deploy pipeline (`npm run build && npx wrangler deploy`) has been
run from this machine, by hand, many times.

## The "still ugly" list (honest, checked against production today)

1. **`/blog` still runs the previous site shell** — old nav (`work · game · blog ·
   contact`) that contradicts the current three-word nav. Known since W3, still
   true, still the highest-value fix. It's a port, not a tweak, so it stays ugly
   until it's done properly.
2. **The CV doesn't mention the site.** `cv.pdf` links GitHub and LinkedIn but not
   `migarci2.dev` — the next CV export fixes it.
3. **No booking link** — see [PF-04](../PF-04); needs a Cal.com account first.
4. **Case cards prove by link, not inline** — the kernel card should carry its
   merge count on the card itself instead of making you click through to lore.
5. **ProofMesh and agenctf have no live demo**, just repos. Fine for a code-literate
   reader, a wall for anyone else.
6. ~~`/favicon.ico` 404~~ — **fixed while writing this list** (real .ico generated
   from the icon, deployed). Left here crossed out because the list predates the fix.

## One real person opened it

**Pending — this needs an actual human, not me writing one.**
_[Slot: who, on what device, and their unfiltered first reaction — filled in after
showing the live site to one real person.]_

## Pass / revise — self-check

- **Actually live, every sitemap page reachable on a real URL** → table above, all
  200 on `migarci2.dev`. ✓
- **Real work in, not placeholders** → real patches, real repos, real posts, real CV. ✓
- **A real person opened it, reaction captured** → **pending** (slot above). ⚠
- **Can explain the build, no mystery code** → W4 + PF-04 inventory. ✓
- **Honest still-ugly list present** → six items, two carried honestly from W3
  because they're still true. ✓
