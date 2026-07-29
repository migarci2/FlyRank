// Two checks: (1) the generator makes a structurally valid PDF with correct
// SQL aggregates; (2) the full pipeline works through the BE-06 queue —
// POST a report job, worker renders it, artifact is served over HTTP.
const { spawn } = require("child_process");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { generate } = require("./report");

// scratch task data with a known shape
const TASKS = "test-tasks.db";
fs.rmSync(TASKS, { force: true });
const tdb = new DatabaseSync(TASKS);
tdb.exec("CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT, done INTEGER)");
for (const [t, d] of [["escaped (parens) \\ backslash", 1], ["pending one", 0], ["pending two", 0]])
  tdb.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)").run(t, d);

// (1) generator: valid PDF, right numbers, parens escaped without corruption
const out = generate({ db_file: TASKS, out_dir: "test-artifacts", stamp: "test" });
assert.deepEqual({ total: out.stats.total, done: out.stats.done, pending: out.stats.pending },
                 { total: 3, done: 1, pending: 2 });
const pdf = fs.readFileSync(out.file, "latin1");
assert.ok(pdf.startsWith("%PDF-1.4") && pdf.trimEnd().endsWith("%%EOF"), "PDF envelope");
assert.ok(pdf.includes("xref") && pdf.includes("/Root"), "xref+trailer present");
assert.ok(pdf.includes("escaped \\(parens\\)"), "text escaped, not mangled");

// (2) pipeline through the BE-06 queue
const QDB = "test-queue.db", PORT = 3107;
const cwd = path.join(__dirname, "../BE-06");
fs.rmSync(path.join(cwd, QDB), { force: true });   // the DB lives in BE-06/ (the spawn cwd)
const env = { ...process.env, DB_FILE: QDB, PORT, POLL_MS: 50 };
const procs = [spawn("node", ["server.js"], { env, cwd }), spawn("node", ["worker.js"], { env, cwd })];
const base = `http://localhost:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  for (let i = 0; ; i++) {
    try { await fetch(`${base}/health`); break; }
    catch { if (i > 50) throw new Error("server never came up"); await sleep(100); }
  }
  const payload = { db_file: path.resolve(TASKS), out_dir: path.join(__dirname, "artifacts"), stamp: "pipeline-test" };
  const r = await fetch(`${base}/jobs`, { method: "POST", body: JSON.stringify({ type: "report", payload }) });
  assert.equal(r.status, 202);
  const job = await r.json();
  let done;
  for (const t0 = Date.now(); ; await sleep(60)) {
    done = await (await fetch(`${base}/jobs/${job.id}`)).json();
    if (done.status === "done" || done.status === "failed") break;
    if (Date.now() - t0 > 5000) throw new Error("report job never finished");
  }
  assert.equal(done.status, "done");
  const got = await fetch(base + done.result.url);           // store and link
  assert.equal(got.status, 200);
  assert.equal(got.headers.get("content-type"), "application/pdf");
  assert.ok((await got.arrayBuffer()).byteLength > 500, "non-trivial artifact");

  console.log("BE-report: all checks passed");
})().catch((e) => { console.error("FAIL:", e.message); process.exitCode = 1; })
  .finally(() => {
    procs.forEach((p) => p.kill());
    fs.rmSync(TASKS, { force: true }); fs.rmSync(path.join(cwd, QDB), { force: true });
    fs.rmSync("test-artifacts", { recursive: true, force: true });
    fs.rmSync(path.join(__dirname, "artifacts/report-pipeline-test.pdf"), { force: true });
  });
