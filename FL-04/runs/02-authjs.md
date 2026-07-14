# Study notes — Auth.js session strategies (JWT vs database)

_FL-04 pipeline · Codex (gpt-5.5) runner · synthesize→draft→review · wall-clock 99s · source: src-authjs.txt_

## [UNSUPPORTED] claims

- [UNSUPPORTED] “Configuration is not covered.” The page explicitly identifies the `session.strategy` configuration option.
- [UNSUPPORTED] “Database sessions query the database on every request.” The source says the database is queried whenever the session is accessed—not necessarily on every request.
- [UNSUPPORTED] “Most adapters also lack Edge compatibility.” The source says “many,” which does not establish “most.”
- [UNSUPPORTED] “No contradictions are present in the supplied source.” This is an audit conclusion, not a claim substantiated by the cited page.

# FINAL notes

## Problem

Applications persist user session data after login so users can resume where they left off on later visits. ([Auth.js — Session Strategies](https://authjs.dev/concepts/session-strategies))

## Core concepts

- JWT sessions store an encrypted JSON Web Token in an HttpOnly cookie and do not require a session database.
- JWT sessions support stateless, scalable applications, but early revocation is difficult.
- JWT cookies are typically limited to around 4,096 bytes, although the exact limit varies by browser. Auth.js supports cookie chunking for larger tokens.
- Database sessions store session data in a database. The HttpOnly cookie contains only a session ID.
- Database sessions enable server-side session modification, “sign out everywhere,” and concurrent-login restrictions.
- Database sessions require database round trips and additional infrastructure. Many database adapters are not yet compatible with Edge runtimes.

Source: [Auth.js — Session Strategies](https://authjs.dev/concepts/session-strategies)

## Choosing a strategy

Use JWT sessions for a stateless application that prioritizes scaling without session-storage infrastructure. Use database sessions when server-side controls such as “sign out everywhere” are required.

Implementation code is not covered. ([Auth.js — Session Strategies](https://authjs.dev/concepts/session-strategies))

## Gotchas

- A JWT cannot be invalidated before its encoded expiry without a server-side blocklist. Shorter expiration periods can reduce this risk.
- JWT cookies are typically limited to around 4,096 bytes, with the exact limit varying by browser.
- Accessing a database-backed session requires a database query, which may increase latency at scale.
- Many database adapters are not yet compatible with Edge runtimes.

Source: [Auth.js — Session Strategies](https://authjs.dev/concepts/session-strategies)

## Open questions

The source does not specify implementation code, expiration durations, database schemas, adapter compatibility lists, performance measurements, or cryptographic algorithms. ([Auth.js — Session Strategies](https://authjs.dev/concepts/session-strategies))
