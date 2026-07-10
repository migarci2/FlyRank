// In-memory repository — the "A2" store. Kept so tests run with no database
// and so the swap to Postgres is visibly the only thing that changes.
const items = new Map();
let seq = 0;

module.exports = {
  kind: "memory",
  async init() {},
  async create(text) {
    const item = { id: ++seq, text, created_at: new Date().toISOString() };
    items.set(item.id, item);
    return item;
  },
  async list() {
    return [...items.values()].sort((a, b) => b.id - a.id);
  },
  async get(id) {
    return items.get(id) || null;
  },
};
