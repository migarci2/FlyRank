# PDF report generator

Assignment: *PDF report generator* (Backend AI Engineering, Week 7)
Author: Miguel Garcia Roman
Builds on: the [BE-06](../BE-06) job pattern (the brief's "A7 job pattern") — same queue, new job type.

---

## The pipeline

```
POST /jobs {"type":"report"}      →  202 + Location            (BE-06 API)
   worker claims it               →  SQL aggregation over the task DB
                                  →  renders a one-page PDF
                                  →  stores artifacts/report-<date>.pdf
GET /jobs/<id>                    →  done { result: { url: "/reports/..." } }
GET /reports/report-<date>.pdf    →  application/pdf            (store and link)
```

Three files:

- **`report.js`** — query → lines → PDF → disk. The aggregation (counts, done
  vs pending, completion %) happens in SQL with `FILTER` clauses, not in a JS
  loop. Also runnable directly: `node report.js` = the on-demand path without
  the queue.
- **`pdf.js`** — a minimal PDF writer in ~60 lines of stdlib. A text report
  needs one page, two fonts and a content stream; that's a corner of the PDF
  spec, not a dependency. Text is properly escaped (parens, backslashes), byte
  offsets in the xref are computed, and `pdftotext` reads the output back
  cleanly. ponytail: the moment reports need charts or pagination, that's the
  cue for pdfkit — not before.
- **`test.js`** — two layers: the generator alone (valid envelope, correct
  aggregates, escaping survives), then the whole pipeline through a real
  spawned BE-06 server + worker: `202` → job `done` → artifact fetched over
  HTTP with `Content-Type: application/pdf`.

## Artifact handling — store and link

The PDF never travels through the queue or the status JSON. The job result is
~100 bytes: `{ url, file, bytes, stats }`. The bytes live on disk and are
served by one route (`GET /reports/...`) with a whitelist-shaped filename
match. That's the brief's "don't pass 20 MB around" made concrete.

## Idempotent by naming

The artifact name is `report-<date>.pdf` — regenerating the same day's report
overwrites the same file instead of accumulating near-duplicates. Rerunning a
report job twice converges on the same state, which is exactly what the BE-06
retry model requires of its handlers.

## Stretch: on a schedule

`SCHEDULE_REPORT_MS=86400000 node worker.js` enqueues one report job per day.
The scheduling is idempotent through the queue itself: the enqueue uses
idempotency key `report-<date>` with `INSERT OR IGNORE`, so a restarted (or
accidentally duplicated) worker can never double-schedule a day's report. No
cron dependency; the pattern is 8 lines in the worker.

## Run it

```
node report.js                    # on-demand, no queue
node test.js                      # generator + full pipeline, self-contained
# through the queue:
node ../BE-06/server.js & node ../BE-06/worker.js &
curl -X POST localhost:3000/jobs -d '{"type":"report"}'
```

## Honest notes

- One page, text only. The truncation guard writes "... truncated" rather than
  silently dropping rows if the task list ever outgrows a page.
- `latin1` encoding in the writer means non-ASCII task titles would need a
  proper font + encoding pass — known ceiling, same pdfkit trigger as above.
