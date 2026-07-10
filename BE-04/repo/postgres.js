// Postgres repository — same interface as memory.js, real durable storage.
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = {
  kind: "postgres",
  async init() {
    // Idempotent so the app is safe to start against a fresh or existing volume.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id         SERIAL PRIMARY KEY,
        text       TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  },
  async create(text) {
    const { rows } = await pool.query(
      "INSERT INTO items (text) VALUES ($1) RETURNING id, text, created_at",
      [text]
    );
    return rows[0];
  },
  async list() {
    const { rows } = await pool.query(
      "SELECT id, text, created_at FROM items ORDER BY id DESC"
    );
    return rows;
  },
  async get(id) {
    const { rows } = await pool.query(
      "SELECT id, text, created_at FROM items WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  },
};
