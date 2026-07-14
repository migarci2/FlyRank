// In-memory user store — same interface as postgres.js, so tests run with no DB.
const byId = new Map();
const byEmail = new Map();
let seq = 0;

module.exports = {
  kind: "memory",
  async init() {},
  async createUser({ email, hash, salt }) {
    if (byEmail.has(email)) return null; // caller maps null -> 409
    const user = { id: ++seq, email, hash, salt, is_admin: false };
    byId.set(user.id, user);
    byEmail.set(email, user);
    return user;
  },
  async findByEmail(email) {
    return byEmail.get(email) || null;
  },
  async findById(id) {
    return byId.get(id) || null;
  },
};
