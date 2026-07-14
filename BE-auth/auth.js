// Auth primitives, stdlib only (node:crypto). This is the exact design I derived
// in W2's Prompt Ladder (V4 + final prompt) — now implemented, not just prompted:
//   - passwords: scrypt with a per-user salt; compared with timingSafeEqual
//   - session token: HMAC(user_id + expiry, SERVER_SECRET), verifiable WITHOUT a DB
// No JWT library, no bcrypt dependency — the platform already ships all of this.
const crypto = require("crypto");

const SECRET = process.env.SERVER_SECRET || "dev-secret-change-me";
const TOKEN_TTL_MS = 1000 * 60 * 60; // 1h

// --- passwords ---------------------------------------------------------------

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

function verifyPassword(password, salt, expectedHash) {
  const hash = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, "hex");
  // timingSafeEqual needs equal-length buffers; guard first, then constant-time.
  return hash.length === expected.length && crypto.timingSafeEqual(hash, expected);
}

// --- session token (stateless, verifiable without the DB) --------------------

function sign(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function issueToken(userId, ttlMs = TOKEN_TTL_MS) {
  const expiry = nowMs() + ttlMs;
  const payload = `${userId}.${expiry}`;
  return { token: `${payload}.${sign(payload)}`, expires: expiry };
}

// Returns { userId } if valid & unexpired, else null. No DB lookup needed —
// the HMAC proves we issued it and the expiry proves it's still good.
function verifyToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiry, mac] = parts;
  const payload = `${userId}.${expiry}`;
  const good = sign(payload);
  // constant-time compare of the MAC
  const a = Buffer.from(mac);
  const b = Buffer.from(good);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Number(expiry) < nowMs()) return null; // expired
  return { userId: Number(userId) };
}

// Injectable clock so tests can force expiry without sleeping.
let _now = () => Date.now();
function nowMs() {
  return _now();
}
function _setClock(fn) {
  _now = fn;
}

module.exports = {
  hashPassword,
  verifyPassword,
  issueToken,
  verifyToken,
  _setClock,
};
