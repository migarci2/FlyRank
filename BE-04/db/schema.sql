-- Also applied idempotently by the app on startup (repo/postgres.js init()).
-- Mounted into the Postgres container's init dir so a fresh volume is seeded too.
CREATE TABLE IF NOT EXISTS items (
  id         SERIAL PRIMARY KEY,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
