# The Prompt Ladder

Assignment: *The Prompt Ladder* (General AI Fluency, Week 2)
Author: Miguel Garcia Roman
Track: Backend AI Engineering

Six runs on one task. Each version adds **exactly one** layer, chosen to attack
the current output's biggest weakness. I graded "what improved in the *output*,"
not what changed in the prompt.

---

## Baseline (a little embarrassing)

**Prompt:**
```
Write backend code for user login.
```

**Output (summary):** A generic Express app. `npm install express`, an in-memory
`users` array with **plaintext** passwords, `app.post('/login')` returning
`"success: true"`, no sessions, no validation. Reads like a tutorial from 2015.

---

## V1 — layer: a clearer goal

**Prompt:**
```
Write a backend login endpoint that verifies an email + password against stored
users and returns a signed session token on success, 401 on failure.
```
- **What changed in the prompt:** named the actual goal (verify → token / 401),
  not just "login."
- **What improved in the output:** it stopped returning `success:true` and started
  returning a real token and a proper `401`. The *shape* became correct.
- **What still failed:** passwords still stored and compared in plaintext; token
  was a random string, not verifiable; still pulled in Express by default.
- **What I'd try next:** give it my real stack and constraints so it stops
  inventing one.

## V2 — layer: real context (stack + constraints)

**Prompt:** V1 **+**
```
Context: Node.js, standard library only, no external dependencies. Users live in a
Postgres table `users(email unique, password_hash)`. This matches my BE-01/BE-04
style: one small file, no framework.
```
- **What changed in the prompt:** pinned the environment (stdlib, Postgres, no deps).
- **What improved in the output:** dropped Express entirely, used `node:http`, and
  switched to reading a `password_hash` column instead of plaintext — the security
  bug fixed itself once the schema said `password_hash`.
- **What still failed:** it *hashed* with `crypto` but used a fast, unsalted SHA —
  wrong primitive for passwords; and the token was still just `randomBytes`.
- **What I'd try next:** specify the output contract exactly so I can diff runs.

## V3 — layer: a specified output format

**Prompt:** V2 **+**
```
Output exactly: (1) the SQL for the users table, (2) one file server.js with a
POST /login handler, (3) a 3-line curl example. No prose between them.
```
- **What changed in the prompt:** fixed the deliverable structure.
- **What improved in the output:** became reviewable and copy-pasteable — table,
  one file, curl, nothing else. Side-by-side with V2 it's the first version I
  could actually drop into a repo.
- **What still failed:** the password hashing was still SHA-256, not a KDF. Format
  didn't touch correctness.
- **What I'd try next:** state the security constraint explicitly; formatting won't
  fix a wrong primitive.

## V4 — layer: an explicit constraint (the one that mattered)

**Prompt:** V3 **+**
```
Constraint: hash passwords with scrypt (node:crypto scryptSync) with a per-user
salt; compare with timingSafeEqual. The session token must be an HMAC of the user
id + expiry, signed with a server secret, so it can be verified without a DB.
```
- **What changed in the prompt:** named the correct primitives (scrypt, salt,
  timingSafeEqual, HMAC token).
- **What improved in the output:** this is the version that became *usable*.
  `timingSafeEqual` killed the comparison timing leak, the token is now verifiable
  offline, and it stopped storing anything reversible. Biggest single jump in the
  ladder.
- **What still failed:** no rate limiting / lockout — still brute-forceable.
- **What I'd try next:** add a "good looks like" example to see if it infers the
  rest (rate limit, generic error copy).

## V5 — layer: an example of what "good" looks like  ← honest miss

**Prompt:** V4 **+**
```
Example of good: an endpoint that returns the SAME generic error and timing for
"unknown email" and "wrong password" so it doesn't leak which accounts exist.
```
- **What changed in the prompt:** added one worked example of a good behavior.
- **What improved in the output:** the enumeration fix landed — one generic
  `401 "invalid credentials"` for both cases. Good.
- **What actually got worse:** the model **over-generalized from the example** and
  bolted on speculative extras I didn't ask for — a fake Redis rate-limiter, a
  CAPTCHA hook, verbose try/catch around everything — turning one clean file back
  into a sprawling one. The example pulled it toward "enterprise" and away from my
  small-file style.
- **Honest note:** this layer helped the *specific* thing (enumeration) and hurt the
  *whole* (scope creep). If all five versions had improved smoothly I wasn't
  looking hard enough — this is the one that didn't.
- **What I'd try next:** keep the example, but re-assert the constraint from V2
  ("one small file, no external deps, don't add what I didn't ask for").

---

## Final prompt (cleaned up for a stranger on my track)

```
Write a backend login endpoint.

Goal: verify an email + password against stored users; return a signed session
token on success, a generic 401 on failure.

Stack: Node.js, standard library only (node:http, node:crypto), no external
dependencies. Users are in Postgres: users(email unique, password_hash, salt).
Style: one small file, no framework, nothing I didn't ask for.

Security (required):
- hash with scrypt (scryptSync) + per-user salt; compare with timingSafeEqual
- session token = HMAC(user_id + expiry, SERVER_SECRET), verifiable without a DB
- return the SAME generic error and timing for unknown-email and wrong-password

Output exactly, no prose between:
1. SQL for the users table
2. one file server.js with POST /login
3. a 3-line curl example
```

This is V4's substance with V5's enumeration fix folded in and the scope-creep
re-fenced. It runs, it's small, and someone else on the backend track can use it
without me in the room.
