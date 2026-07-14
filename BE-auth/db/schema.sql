-- Also applied idempotently by the app on startup (repo/postgres.js init()).
-- Mounted into the Postgres container's init dir so a fresh volume is seeded too.
CREATE TABLE IF NOT EXISTS users (
  id       SERIAL PRIMARY KEY,
  email    TEXT UNIQUE NOT NULL,
  hash     TEXT NOT NULL,   -- scrypt hash, hex
  salt     TEXT NOT NULL,   -- per-user salt, hex
  is_admin BOOLEAN NOT NULL DEFAULT false
);
