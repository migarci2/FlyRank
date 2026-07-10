// One runnable check: the repo contract holds and routes work against it,
// with no database. Fails loudly if create/list/get break.  node test.js
const assert = require("assert");
const memory = require("./repo/memory");

(async () => {
  await memory.init();
  assert.deepStrictEqual(await memory.list(), [], "starts empty");

  const a = await memory.create("first");
  const b = await memory.create("second");
  assert.strictEqual(a.id + 1, b.id, "ids increment");
  assert.strictEqual(a.text, "first");

  const all = await memory.list();
  assert.strictEqual(all.length, 2, "two items");
  assert.strictEqual(all[0].id, b.id, "newest first");

  assert.strictEqual((await memory.get(a.id)).text, "first", "get by id");
  assert.strictEqual(await memory.get(999), null, "missing -> null");

  console.log("ok - repo contract holds");
})().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});
