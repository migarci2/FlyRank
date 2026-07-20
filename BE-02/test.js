// Self-check: run `node test.js`. Exits non-zero on the first broken assertion.
// Uses a throwaway DB file so it never touches the real tasks.db.
const assert = require("node:assert");
const fs = require("node:fs");

const DB = "test-tasks.db";
fs.rmSync(DB, { force: true });
process.env.DB_FILE = DB;

const { server } = require("./server");

const call = async (method, path, body) => {
  const res = await fetch(`http://localhost:${server.address().port}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
};

(async () => {
  await new Promise((r) => server.listen(0, r));

  let r = await call("GET", "/tasks");
  assert.equal(r.status, 200);
  assert.equal(r.body.length, 3, "three examples seeded on a fresh db");
  assert.deepEqual(r.body[0], { id: 1, title: "Read the assignment", done: true });

  r = await call("POST", "/tasks", { title: "write the test" });
  assert.equal(r.status, 201);
  assert.equal(r.body.done, false);
  const id = r.body.id;

  assert.equal((await call("POST", "/tasks", { title: "  " })).status, 400);
  assert.equal((await call("POST", "/tasks")).status, 400);

  r = await call("GET", `/tasks/${id}`);
  assert.deepEqual(r.body, { id, title: "write the test", done: false });

  r = await call("PUT", `/tasks/${id}`, { title: "write the test", done: true });
  assert.equal(r.status, 200);
  assert.equal(r.body.done, true);
  assert.equal((await call("PUT", `/tasks/${id}`, {})).status, 400);
  assert.equal((await call("PUT", "/tasks/9999", { title: "x" })).status, 404);

  assert.equal((await call("GET", "/tasks/9999")).status, 404);
  assert.deepEqual((await call("GET", "/tasks/9999")).body, { error: "Task not found" });

  assert.equal((await call("DELETE", `/tasks/${id}`)).status, 204);
  assert.equal((await call("DELETE", `/tasks/${id}`)).status, 404);
  assert.equal((await call("GET", "/tasks")).body.length, 3, "back to the 3 examples");

  server.close();
  fs.rmSync(DB, { force: true });
  console.log("ok — 15 assertions");
})();
