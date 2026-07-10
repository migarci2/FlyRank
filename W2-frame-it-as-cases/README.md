# Frame It as Cases: Work That Speaks for Itself

Assignment: *Frame It as Cases* (General AI Fluency, Week 2)
Author: Miguel Garcia Roman

## Voice card

> **Direct, concrete, a little dry. No buzzwords. Builder-to-builder.**

Standing instruction to AI: write like this, in my words. If a sentence could sit
on any engineer's portfolio, cut it. Never "robust," "seamless," "leverage,"
"results-driven." Show the decision, not the adjective.

---

## Case 1 — A CLI for a system with no API

**The problem.**
FlyRank's internship portal has no public API. It's a Next.js app driven by Server
Actions behind a LinkedIn (Auth.js) login. I wanted to read assignments and submit
work from the terminal. Nothing was documented; there was no endpoint to call.

**What I did (and decided).**
I read the system instead of guessing. Pulled the `__Secure-authjs.session-token`
cookie straight out of my browser's keyring (AES-128-CBC, key from gnome-keyring)
so the tool could reuse my real login. Decoded the Next.js *flight* payload to get
assignment content, and found that submitting means invoking a Server Action whose
id changes on every deploy — so I decided the CLI should **scrape that action id
from the live page on each run** instead of hard-coding it. One decision, and the
tool stops breaking every time they ship.

**What came of it.**
A working CLI: `list`, `show`, `submissions`, `submit`. Verified end-to-end — the
server returns `303` on a real submit. It's the sharpest evidence for my claim:
give me an undocumented backend and I'll hand you the small tool that tames it.

## Case 2 — BE-01, the smallest API that's still honest

**The problem.**
First backend assignment: build an API endpoint. The trap is over-building —
reaching for Express, a framework, a folder of middleware for two routes.

**What I did (and decided).**
Node stdlib, one file, zero dependencies. Two JSON routes (`/hello`, `/time`),
`/time` computed per request. I decided the lazy version *was* the right version:
nothing here earns a framework, and a dependency I don't add is a dependency I
never have to patch at 3am.

**What came of it.**
Runs with `node server.js`, no install step. It reads as a deliberate choice, not
a missing feature — which is the point I want a reviewer to take from it.

## Case 3 — BE-04, swapping the store without touching the service

**The problem.**
Take a service with an in-memory store and put it on real Postgres, in Docker,
started with one command — without rewriting the service.

**What I did (and decided).**
Put the storage behind a repository interface so the routes never learn where data
lives. In-memory for tests, Postgres for real, same method signatures.
`docker compose up` starts app + database together; a named volume proves the data
survives a restart. (Full write-up in [../BE-04](../BE-04).)

**What came of it.**
The service code is byte-for-byte unchanged across the swap. Persistence is proven,
not claimed.

---

## Before / after (generic AI vs my voice)

**Generic AI draft:**
> Developed a robust command-line interface leveraging reverse-engineering
> techniques to seamlessly integrate with a complex web platform, enabling
> streamlined, results-driven task management.

**My edit:**
> The portal has no API. I read its Server-Action traffic and pulled my session
> cookie out of the browser keyring, then built a CLI that scrapes the action id
> live so it survives their deploys. It submits; the server returns 303.

The first says nothing a reviewer can check. The second names the exact obstacle,
the exact decision, and a fact they can verify.

---

## Bio + CTA

Miguel Garcia Roman — backend engineer. I build small, dependable tools against
real, undocumented systems. If that's the person you need, **read one repo, then
email me.**
