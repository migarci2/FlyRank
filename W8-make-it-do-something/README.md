# Make It Do Something

Assignment: *Make It Do Something* (General AI Fluency, Week 8)
Author: Miguel Garcia Roman
Live: **[migarci2.dev](https://migarci2.dev)** — footer of the home page.

---

## The one feature: a signal counter

The contact footer of my site now ends with a live line:

> `N signals received · send one ↗`

Click it and the number goes up — for everyone, permanently. That's the whole
feature. One button, one counter, no accounts, no forms. It fits the site's
language (the footer's kicker is already "next signal") and it's the first thing
on migarci2.dev that *remembers* anything.

**Exactly one feature** — I didn't wire a contact form, a like button and a view
counter halfway. One thing, finished: UI state (`sent ✓`), error handling (if
the API is unreachable the line simply doesn't render and the static site is
untouched), and a `no-store` header so nobody sees a cached count.

## Free tier, genuinely tested live

- Cloudflare **Workers** free tier runs the API (the site was already served by
  a Worker as static assets; the same Worker now also answers `/api/signal`).
- Cloudflare **KV** free tier stores the count (one key).
- Real test on production, not localhost: `GET https://migarci2.dev/api/signal`
  → `{"count":1}` → clicked the button in a real browser session →
  `{"count":2}` from the API and "2 signals received · signal sent ✓" in the
  DOM. No console errors.

Code: [`worker.js`](https://github.com/migarci2) lives in the site repo;
23 lines. The `ponytail:` comment in it is honest about the known ceiling — KV
`get`+`put` isn't atomic, so two simultaneous clicks can lose one count. For a
portfolio counter that's the right trade; the upgrade path is a Durable Object.

## The explainer, in my own words (what a backend is, what this does, how the data flows)

A **backend** is the part of an app that runs on a computer you control instead
of the visitor's. The visitor's browser can render pages and run JavaScript,
but everything it knows disappears when the tab closes — it can't remember
things *between* visitors, and it can't be trusted (anyone can edit what runs
in their own browser). So anything shared, persistent, or authoritative — a
count, an account, an order — has to live behind a door on your side. The
backend is that door plus the room behind it: it listens for requests, decides
what's allowed, touches the stored data, and answers.

**What my feature does:** keeps one number — how many people pressed the button
— and lets any visitor read it or add one to it.

**How the data flows, step by step.** My site is static files served by a
Cloudflare Worker. When you open the page, your browser runs a small script
that sends `GET /api/signal`. The request arrives at the Worker — my one piece
of backend code — which checks the path: it's `/api/signal`, so instead of
handing back a file it asks KV (a tiny key-value database Cloudflare hosts) for
the key `signals`, gets `"1"`, and answers `{"count":1}` as JSON. The browser
paints "1 signal received". When you click **send one**, the script sends
`POST /api/signal` — same door, but POST means "change something": the Worker
reads the current value, adds one, writes it back to KV, and answers
`{"count":2}`. The page updates without reloading. Next week, a different
person on a different continent opens the site, their browser does the same
GET, and KV still says 2 — that persistence across people and time is exactly
the thing a frontend alone cannot do, and exactly why this needed a backend.

## Pass / revise — self-check

- **Exactly one feature, live end to end** → one counter, deployed, working on
  the real domain. ✓
- **Free tier, genuinely functions on a real test** → Workers + KV free tiers;
  tested on production in a real browser (count 1→2 verified in DOM *and* API). ✓
- **Explainer correct, own words, shows the data flow** → above. ✓
