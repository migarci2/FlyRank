// One runnable check for the whole loop: 202-accept, worker completes, status
// reports, idempotency dedupes, retries exhaust into failed + alert.
// Run: node test.js   (spawns its own server+worker on a scratch DB)
const { spawn } = require("child_process");
const assert = require("assert");
const fs = require("fs");

const DB = "test-jobs.db", ALERTS = "test-alerts.log", PORT = 3106;
for (const f of [DB, ALERTS]) fs.rmSync(f, { force: true });
const env = { ...process.env, DB_FILE: DB, ALERTS_FILE: ALERTS, PORT, POLL_MS: 50, BACKOFF_MS: 50 };
const procs = [spawn("node", ["server.js"], { env }), spawn("node", ["worker.js"], { env })];
const base = `http://localhost:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function poll(id, until, ms = 3000) {
  for (const t0 = Date.now(); Date.now() - t0 < ms; await sleep(60)) {
    const j = await (await fetch(`${base}/jobs/${id}`)).json();
    if (until.includes(j.status)) return j;
  }
  throw new Error(`job ${id} never reached ${until}`);
}

(async () => {
  // wait for the server to actually answer, not a fixed guess
  for (let i = 0; ; i++) {
    try { await fetch(`${base}/health`); break; }
    catch { if (i > 50) throw new Error("server never came up"); await sleep(100); }
  }

  // accept fast: 202 + Location, then the worker finishes it
  let r = await fetch(`${base}/jobs`, { method: "POST", body: JSON.stringify({ type: "sleep", payload: { ms: 100 } }) });
  assert.equal(r.status, 202);
  const job = await r.json();
  assert.equal(r.headers.get("location"), `/jobs/${job.id}`);
  assert.equal(job.status, "queued");
  const done = await poll(job.id, ["done"]);
  assert.equal(done.result.slept_ms, 100);

  // idempotency: same key twice = same job, no second execution
  const opts = { method: "POST", headers: { "Idempotency-Key": "k1" }, body: JSON.stringify({ type: "sleep", payload: { ms: 50 } }) };
  const a = await (await fetch(`${base}/jobs`, opts)).json();
  const r2 = await fetch(`${base}/jobs`, opts);
  assert.equal(r2.status, 200);
  assert.equal((await r2.json()).id, a.id);

  // retries then alert: 3 attempts, failed, and a human-visible alert line
  const f = await (await fetch(`${base}/jobs`, { method: "POST", body: JSON.stringify({ type: "fail" }) })).json();
  const failed = await poll(f.id, ["failed"]);
  assert.equal(failed.attempts, 3);
  assert.ok(fs.readFileSync(ALERTS, "utf8").includes(f.id), "alert written");

  // unknown job and unknown type
  assert.equal((await fetch(`${base}/jobs/00000000-0000-0000-0000-000000000000`)).status, 404);
  assert.equal((await fetch(`${base}/jobs`, { method: "POST", body: JSON.stringify({ type: "nope" }) })).status, 422);

  console.log("BE-06: all checks passed");
})().catch((e) => { console.error("FAIL:", e.message); process.exitCode = 1; })
  .finally(() => { procs.forEach((p) => p.kill()); for (const f of [DB, ALERTS]) fs.rmSync(f, { force: true }); });
