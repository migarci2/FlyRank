# BE-06 — Your first background job

Assignment: *Your first background job* (Backend AI Engineering, Week 6)
Author: Miguel Garcia Roman
Stack: Node stdlib only — `node:http` + `node:sqlite`, same as [BE-02](../BE-02). Zero dependencies.

---

## The pattern

Accept fast, work in the background, report status:

```
POST /jobs {"type":"summarize"}   →  202 Accepted + Location: /jobs/<id>   (0.028s)
                                      worker.js claims it, does the slow work (~47s AI call)
GET  /jobs/<id>                   →  queued | running | done {result} | failed {error}
```

- **`server.js`** — the API. Enqueues and reports; never does slow work.
- **`worker.js`** — separate process. Polls the queue, runs the job, records the outcome.
- **`db.js`** — the queue itself: a SQLite table both processes share.
  ponytail: SQLite-as-queue is right for one box and low volume; the upgrade
  path is Postgres `SKIP LOCKED` or a real broker, when volume earns it.

The slow operation is a **real AI call**: job type `summarize` reads the BE-02
tasks database and shells out to the Claude CLI for a status summary. (No A6 AI
endpoint exists in my track's history — closest equivalent, honestly noted.)

## The non-negotiables, and where each lives

**Jobs will run twice → idempotency.**
Client side: `Idempotency-Key` header — a UNIQUE column, so the same key can
never enqueue twice; the retry gets the original job back (200, same id).
Worker side: claiming is one atomic `UPDATE … WHERE id = (SELECT … LIMIT 1)
RETURNING *` — two workers on the same table can't double-claim; and the
handlers themselves are safe to re-run (a re-summarize overwrites the same
result, a re-report overwrites the same file).

**Jobs will fail → retries.**
Each claim burns an attempt. On error before `max_attempts` (3): back to
`queued` with exponential backoff (`run_at = now + 2^attempt·1s`). The `fail`
job type exists purely to prove this path in the test.

**Someone must find out → alerts.**
On the final failure the job is marked `failed` and an alert line goes to
`alerts.log` + stderr. ponytail: a log line today; the upgrade path is a
webhook POST in `alert()`, one function, one place.

**Two processes, one SQLite file → WAL + busy_timeout.**
Found the hard way (see the test flakiness story below): without
`PRAGMA busy_timeout` a lock collision throws `SQLITE_BUSY` instead of
waiting — intermittent 500s in the API and a dead worker. Two pragmas fix it.

## Run it

```
node server.js          # API on :3000
node worker.js          # in a second terminal
node test.js            # the whole loop, self-contained, ~3s
SCHEDULE_REPORT_MS=60000 node worker.js   # stretch: enqueue a daily report (see BE-report)
```

## Proof (real run, kept in this directory)

- `proof-post.txt` — the POST answering `202` with a `Location` header; `time`
  measured it at **0.028s real**.
- `proof-result.json` — the same job later: `status: "done"`, a real Claude
  summary of the BE-02 tasks, `attempts: 1`; created→updated timestamps show
  the worker spent **~47s** on what the request path never waited for.
- `test.js` — asserts the full contract: 202+Location, done with result,
  idempotency dedupe (same key → same id, 200), 3 attempts → `failed` +
  alert line written, 404/422 edges. Run three times consecutively to shake
  out the SQLITE_BUSY race; passes deterministically since the WAL fix.

## What I'd tell the reviewer honestly

The queue poll (250ms) is the lazy choice over LISTEN/NOTIFY-style wakeups —
correct at this scale, wasteful at real scale. The worker is single-flight by
design; concurrency is a `for` loop around `tick()` away, but nothing here
needs it yet.
