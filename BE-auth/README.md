# BE-auth — Login & protect

Assignment: *Auth - Login & protect* (Backend AI Engineering, Week 4)
Author: Miguel Garcia Roman

Real auth on the service: users **register** and **log in** (passwords hashed), and
protected routes answer **only** for logged-in users, with honest `401` / `403`.

## The through-line: I already designed this in Week 2

W2's [Prompt Ladder](../W2-prompt-ladder) ended on a final prompt that specified the
*exact* auth design — scrypt + per-user salt, `timingSafeEqual`, and a session token
that's an HMAC of `user_id + expiry`, verifiable without a DB. This assignment is
that spec **implemented and tested**, stdlib only. The prompt was the plan; this is
the build.

## What's here

Same shape as [BE-04](../BE-04): a small `node:http` service, storage behind a repo
interface (`memory` for tests, `postgres` for real), swappable by one env var.

- `auth.js` — the crypto. `scryptSync` + per-user salt, compared with
  `timingSafeEqual`; token = `userId.expiry.HMAC(userId.expiry, SERVER_SECRET)`.
  No JWT/bcrypt dependency — `node:crypto` already ships all of it.
- `server.js` — routes: `/register`, `/login`, `/me` (protected), `/admin` (authz demo).
- `repo/` — `memory.js` and `postgres.js`, one `users` interface.

## Routes

| Method | Path | Behaviour |
|--------|------|-----------|
| POST | `/register` | `{email,password}` → `201 {id,email}`; `409` if email taken; `400` if missing fields |
| POST | `/login` | `{email,password}` → `200 {token,expires}`; **`401` generic** on any failure |
| GET | `/me` | needs `Authorization: Bearer <token>` → `200 {id,email}`; **`401`** if missing/invalid/expired |
| GET | `/admin` | logged in but not admin → **`403`**; not logged in → `401` |
| GET | `/health` | `{ok:true,store}` |

**Honest 401 vs 403** is the point: `401` = "I don't know who you are"; `403` = "I
know who you are and you may not." `/me` shows the first, `/admin` shows the second.

## Three decisions worth naming

1. **Generic `401` on login.** Unknown-email and wrong-password return the *same*
   `{"error":"invalid credentials"}`. Different messages leak which emails have
   accounts — the enumeration bug I caught in the Prompt Ladder's V5. Fixed here by
   construction.
2. **Stateless token, no session table.** The HMAC proves *I* issued it and the
   embedded expiry proves it's still valid, so `/me` verifies the caller with **no
   DB round-trip**. Trade-off named: can't revoke a single token before expiry —
   fine at this scale (1h TTL); add a deny-list if that ever matters.
   <!-- ponytail: stateless token, 1h TTL; add a revocation deny-list only if early logout becomes a real requirement -->
3. **`timingSafeEqual` everywhere a secret is compared** — both the password hash
   and the token MAC. A plain `===` leaks length/prefix timing.

## Run

```bash
# no database — unit + integration test through the real handler
node test.js          # -> ok - auth: hashing, tokens, and 401/403 all hold

# real stack
cp .env.example .env   # set SERVER_SECRET: openssl rand -hex 32
docker compose up --build
```

```bash
curl -X POST localhost:3000/register -d '{"email":"a@b.com","password":"pw12345"}'
curl -X POST localhost:3000/login    -d '{"email":"a@b.com","password":"pw12345"}'
# -> {"token":"1.1752...abc","expires":...}
curl localhost:3000/me -H "Authorization: Bearer <token>"   # 200
curl localhost:3000/me                                       # 401
curl localhost:3000/admin -H "Authorization: Bearer <token>" # 403 (not admin)
```

## Requirements checklist

- [x] Register + login, passwords hashed (scrypt + per-user salt)
- [x] At least one protected route (`/me`) — logged-in only
- [x] Honest `401` (not authenticated) **and** `403` (authenticated, not allowed)
- [x] No credential leak: generic `401` for unknown-email vs wrong-password
- [x] One runnable check with no DB (`node test.js`), incl. tamper + expiry
- [x] Same containerized stack as BE-04 (`docker compose up`)

Feeds the "current user" that later isolation/capstone work depends on.
