// One factory, two implementations behind the same interface:
//   init()              -> ready the store (create table if needed)
//   create(text)        -> { id, text, created_at }
//   list()              -> [ item, ... ] newest first
//   get(id)             -> item | null
// server.js depends only on this shape, so the store is swappable by env.
function makeRepo(kind) {
  if (kind === "postgres") return require("./postgres");
  if (kind === "memory") return require("./memory");
  throw new Error(`unknown STORE: ${kind}`);
}

module.exports = { makeRepo };
