// Shared by server.js and worker.js so whichever boots first creates the schema.
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(process.env.DB_FILE || "jobs.db");
// Two processes (API + worker) write this file concurrently. Without these
// pragmas SQLite throws SQLITE_BUSY on lock collisions instead of waiting —
// intermittent 500s in the API and a dead worker. WAL lets reads and one
// writer coexist; busy_timeout makes the second writer wait, not crash.
db.exec("PRAGMA busy_timeout = 5000");
db.exec("PRAGMA journal_mode = WAL");
db.exec(`CREATE TABLE IF NOT EXISTS jobs (
  id              TEXT PRIMARY KEY,
  type            TEXT NOT NULL,
  payload         TEXT NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'queued',   -- queued|running|done|failed
  attempts        INTEGER NOT NULL DEFAULT 0,
  max_attempts    INTEGER NOT NULL DEFAULT 3,
  run_at          INTEGER NOT NULL DEFAULT 0,       -- unix ms; backoff pushes it out
  result          TEXT,
  error           TEXT,
  idempotency_key TEXT UNIQUE,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
)`);
db.exec("CREATE INDEX IF NOT EXISTS jobs_ready ON jobs (status, run_at)");

module.exports = db;
