# PF-04 — Personal Website Live on the FlyRank Domain

Assignment: *Personal Website Live on the FlyRank Domain* (General AI Fluency, Week 5)
Author: Miguel Garcia Roman
Live: **[https://migarci2.dev](https://migarci2.dev)** — HTTPS, public, verified logged-out.

---

## The site (already live — on my own domain)

The brief's default is Netlify with a free `*.netlify.app` URL. I'm on the brief's
"other accepted hosting paths": the site is a **Next.js static export served from
Cloudflare Workers static assets on my own domain, `migarci2.dev`** — chosen and
justified in [../W4-choose-stack](../W4-choose-stack), shipped in Week 4, free tier.
Same properties the brief wants: clean public URL, HTTPS, zero server to maintain.

What's on it, against the brief's checklist:

- **Who I am / what I'm building** — hero: *"systems. security. intelligence. — I
  build close to the machine."* plus the selected-work section (Linux kernel,
  ProofMesh, agenctf) and the proof section (6 confirmed patches, Team Europe,
  Team Spain).
- **LinkedIn** — footer link → `linkedin.com/in/miguelgr8` ✓
- **GitHub** — footer link → `github.com/migarci2` ✓
- **CV** — footer link → [`/cv.pdf`](https://migarci2.dev/cv.pdf) — **added this
  week for PF-04** (it was already on my W3 gather-list; this brief forced the fix).
- **Space for future posts / capstone** — `/blog` with three real posts + RSS ✓
- **Booking link** — ✗ not yet. Honest state: I don't have a Cal.com/Calendly
  account, and in [W3](../W3-content-cta-map) I deliberately kept the CTA ladder to
  "email me" only. To pass this criterion I'll create a free Cal.com account and add
  `book` next to `cv` in the footer — the slot and the deploy pipeline are ready;
  it's a five-minute change once the account exists.

I can explain every file in the deployed site: it's `out/` from `next build` with
`output: 'export'` — per-route HTML, `_next/static` chunks, the Geist Pixel fonts,
`icon.svg`, `cv.pdf`, `rss.xml`. No server code; `wrangler.jsonc` maps the folder to
the Workers static-asset host and binds the custom domain.

## DNS walkthrough — written before I need it, so it's the checklist I'll run

**What a CNAME record is.** DNS is a phone book: a name goes in, an answer comes
out. An `A` record answers with an IP address. A **CNAME** answers with *another
name* — it says "this name is an alias; go ask again for that one." That's exactly
what a subdomain someone provisions for you needs: FlyRank shouldn't have to know
or track my server's IPs — they just point my subdomain at a name I control, and
whatever my host resolves to from then on, the alias follows.

**What value mine will hold.** When my subdomain is provisioned:

```
migarci2.flyrank.ai.   CNAME   migarci2.dev.
```

The record lives in **flyrank.ai's** DNS zone (they own the zone, so they create
it), and its value is my host's name. If FlyRank's tooling asks for a target
instead, the equivalent Netlify-style value would be `<site>.netlify.app` — same
mechanism, different alias target.

**What actually happens between typing the address and my host answering:**

1. You type `migarci2.flyrank.ai`. Your browser asks the OS, which asks its
   **resolver** (your ISP's, or 1.1.1.1/8.8.8.8).
2. The resolver, unless it has the answer cached, walks the hierarchy: a **root
   nameserver** ("who handles `.ai`?") → the **`.ai` TLD nameservers** ("who
   handles `flyrank.ai`?") → **flyrank.ai's authoritative nameservers**.
3. The authoritative server answers with the **record**: `CNAME migarci2.dev`.
   The resolver now repeats the walk for `migarci2.dev`, which ends in `A`/`AAAA`
   records — Cloudflare edge IPs, since that's where my site lives.
4. The resolver hands the IP back; your browser opens a TLS connection to it and
   says which site it wants (the original name, `migarci2.flyrank.ai`, via SNI and
   the `Host` header — one IP serves thousands of sites, the name picks mine).
5. **My host answers** — *only if I've told it to*. This is the step people forget:
   the CNAME gets traffic to Cloudflare's door, but Cloudflare must know the new
   hostname is mine (add it as a custom domain on the Worker) and must hold a TLS
   certificate for it, or visitors get a certificate error instead of my site.

So my run-when-provisioned checklist: confirm the CNAME exists and points at
`migarci2.dev` (`dig migarci2.flyrank.ai CNAME`) → add `migarci2.flyrank.ai` as a
custom domain in my Cloudflare Worker config → wait for the cert to issue → open it
in a private window and check the padlock. Both URLs keep working; the free one
never breaks by adding the alias.

## Linked from LinkedIn and CV

- **LinkedIn:** profile → Contact info → add `https://migarci2.dev` as website.
  (Manual profile edit — doing it in the LinkedIn UI.)
- **CV:** the current `cv.pdf` shows GitHub and LinkedIn but not the site — the
  next CV export adds `migarci2.dev` in the sidebar. Tracked, not hidden.

## Pass / revise — self-check

- **Live over HTTPS on a clean public URL, tested logged out / private window** →
  `https://migarci2.dev`, curl + private-window check, no auth anywhere. ✓
- **Positioning + working links: LinkedIn ✓ GitHub ✓ CV ✓ booking ✗** — booking
  pending a Cal.com account (see above). ⚠ open
- **DNS walkthrough technically correct, own words** → above; includes the
  usually-forgotten step 5 (host-side custom-domain + cert). ✓
- **Can explain every file deployed** → static export inventory above. ✓
- **Linked from LinkedIn and CV** → LinkedIn pending manual edit; CV pending next
  export. ⚠ open
- **At capstone: subdomain live over HTTPS** → checklist ready to run. (future)
