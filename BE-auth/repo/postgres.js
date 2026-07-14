// Postgres user store — same interface as memory.js, real durable storage.
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = {
  kind: "postgres",
  async init() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id       SERIAL PRIMARY KEY,
        email    TEXT UNIQUE NOT NULL,
        hash     TEXT NOT NULL,
        salt     TEXT NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT false
      )
    `);
  },
  async createUser({ email, hash, salt }) {
    // ON CONFLICT DO NOTHING -> rows empty when the email already exists (409).
    const { rows } = await pool.query(
      `INSERT INTO users (email, hash, salt) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, hash, salt, is_admin`,
      [email, hash, salt]
    );
    return rows[0] || null;
  },
  async findByEmail(email) {
    const { rows } = await pool.query(
      "SELECT id, email, hash, salt, is_admin FROM users WHERE email = $1",
      [email]
    );
    return rows[0] || null;
  },
  async findById(id) {
    const { rows } = await pool.query(
      "SELECT id, email, hash, salt, is_admin FROM users WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  },
};
