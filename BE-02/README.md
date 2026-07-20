# BE-02 — Connecting your CRUD to the database

Assignment: *W3 · A1 — Connecting your CRUD to the database* (Backend AI Engineering, Week 3)
Author: Miguel Garcia Roman

Same API as the in-memory version, different storage. The client can't tell the
difference — until you restart the server and the data is still there.

```
Before:  Client -> API -> array in memory
Now:     Client -> API -> SQLite (tasks.db)
```

## The one decision

**No dependency.** The brief recommends `better-sqlite3`; Node 22+ ships
`node:sqlite` in the standard library, which is the same synchronous prepared-
statement API. So this is `npm install`-free: clone and run.

Everything else stayed boring on purpose: one file, prepared statements built once
at startup, no ORM, no migration tool. `id INTEGER PRIMARY KEY` is SQLite's rowid
alias, so autoincrement comes free.

## Run

```bash
node server.js          # creates tasks.db + the table on first run
node test.js            # self-check, 15 assertions, uses a throwaway db
```

Needs Node 22+ (`node:sqlite`). Tested on v24.13.0.

## API

| Method | Path | Does | Codes |
|--------|------|------|-------|
| `GET` | `/tasks` | list every task | 200 |
| `GET` | `/tasks/{id}` | one task | 200 · 404 |
| `POST` | `/tasks` | create, body `{"title": "...", "done": false}` | 201 · 400 |
| `PUT` | `/tasks/{id}` | replace title/done | 200 · 400 · 404 |
| `DELETE` | `/tasks/{id}` | remove | 204 · 404 |

Unknown id → `404 {"error": "Task not found"}`. Missing/blank title → `400`.

```bash
curl localhost:3000/tasks
curl -XPOST localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"buy milk"}'
curl -XPUT localhost:3000/tasks/1 -H 'Content-Type: application/json' -d '{"title":"buy milk","done":true}'
curl -XDELETE localhost:3000/tasks/1
```

## Schema

```sql
CREATE TABLE tasks (
  id    INTEGER PRIMARY KEY,
  title TEXT    NOT NULL,
  done  INTEGER NOT NULL DEFAULT 0
);
```

SQLite has no boolean type, so `done` is stored as `0/1` and converted back to a
real JSON boolean on the way out. The API contract didn't change; only the storage
did — which is the whole point of the assignment.

The three example tasks are inserted **only when the table is empty**, so restarting
never duplicates them.

## Proof (real run, not a description)

![database screenshot](./proof-database.png)

Full transcript: [`proof.txt`](./proof.txt). It shows, in one uninterrupted run:

1. `rm -f tasks.db` → start from nothing.
2. First boot creates the file, the table and the 3 examples.
3. `POST` (id 4), `PUT` (id 2 → done), `DELETE` (id 3 → `204`).
4. `404` on an unknown id, `400` on a body with no title.
5. **Server killed, server restarted.**
6. `GET /tasks` still returns ids 1, 2, 4 — the edit persisted, the deletion
   persisted, and the examples were *not* re-seeded.
7. `.schema` + `SELECT *` straight from the file, so the rows are visible in the
   database and not just in the API's answers.

`test.js` covers the same ground automatically: seeding, every CRUD verb, both
error codes, and delete-twice → 404.

## Requirements checklist

- [x] Same CRUD endpoints as Assignment 1
- [x] Stored in SQLite instead of memory
- [x] Data survives server restarts *(step 5–6 above)*
- [x] Database created automatically if missing
- [x] `tasks` table created automatically if missing
- [x] Three examples inserted only on the first run
- [x] CRUD operations use SQL queries (prepared statements)
- [x] Unknown ids return 404, invalid requests return 400
- [x] Public repo with README and database screenshot

**Bonus stages skipped** (`?done=` filter, alphabetical sort, `GET /stats`,
`created_at`/`updated_at`): none of them are in the requirements list, and each one
adds surface to a 90-line file. `WHERE done = ?` and `COUNT(*)` are one line each
if a later assignment asks for them.

## Note on `tasks.db`

The committed `tasks.db` is the exact file the transcript produced, kept as evidence.
Delete it and the server rebuilds it from scratch on the next boot.
