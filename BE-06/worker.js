const { execFileSync } = require("child_process");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const db = require("./db");

// Atomic claim: one UPDATE both picks the job and marks it running, so two
// workers can poll the same table and never double-claim. attempts counts the
// claim itself — a job that crashes the worker mid-run still burned its try.
const claim = db.prepare(`
  UPDATE jobs SET status='running', attempts=attempts+1, updated_at=?
  WHERE id = (SELECT id FROM jobs WHERE status='queued' AND run_at <= ?
              ORDER BY created_at LIMIT 1)
  RETURNING *`);
const finish = db.prepare("UPDATE jobs SET status=?, result=?, error=?, run_at=?, updated_at=? WHERE id=?");

// Alerts non-negotiable: when a job exhausts its retries a human must find
// out. ponytail: a log line + stderr; the upgrade path is a webhook POST here.
function alert(job, err) {
  const line = `${new Date().toISOString()} ALERT job ${job.id} (${job.type}) failed after ${job.attempts} attempts: ${err}\n`;
  fs.appendFileSync(process.env.ALERTS_FILE || "alerts.log", line);
  process.stderr.write(line);
}

const handlers = {
  // The slow operation this queue exists for: an AI call (Claude CLI on this
  // machine). Re-running it for the same job just overwrites the same result
  // row — idempotent by construction.
  summarize({ db_file = "../BE-02/tasks.db" } = {}) {
    const tasks = new DatabaseSync(db_file, { readOnly: true })
      .prepare("SELECT title, done FROM tasks ORDER BY id").all();
    const prompt = "One-paragraph status summary, plain words, of this task list:\n" +
      tasks.map((t) => `- [${t.done ? "x" : " "}] ${t.title}`).join("\n");
    const out = execFileSync("claude", ["-p", prompt], { encoding: "utf8", timeout: 120000 });
    return { summary: out.trim(), tasks: tasks.length };
  },
  sleep({ ms = 500 } = {}) {                    // deterministic job for tests
    execFileSync("sleep", [String(ms / 1000)]);
    return { slept_ms: ms };
  },
  fail() { throw new Error("this job always fails (retry/alert demo)"); },
  report(payload) { return require("../BE-report/report.js").generate(payload); },
};

function tick() {
  let job;
  try { job = claim.get(Date.now(), Date.now()); }
  catch (e) { console.error("claim failed (will retry):", e.message); return false; }
  if (!job) return false;
  console.log(`worker: ${job.type} ${job.id} (attempt ${job.attempts}/${job.max_attempts})`);
  try {
    const result = handlers[job.type](JSON.parse(job.payload));
    finish.run("done", JSON.stringify(result), null, job.run_at, Date.now(), job.id);
  } catch (err) {
    if (job.attempts >= job.max_attempts) {
      finish.run("failed", null, String(err.message || err), job.run_at, Date.now(), job.id);
      alert(job, err.message || err);
    } else {
      // Exponential backoff before the next try: 1s, 2s, 4s...
      const delay = 2 ** (job.attempts - 1) * (Number(process.env.BACKOFF_MS) || 1000);
      finish.run("queued", null, String(err.message || err), Date.now() + delay, Date.now(), job.id);
    }
  }
  return true;
}

const POLL_MS = Number(process.env.POLL_MS) || 250;
console.log(`BE-06 worker polling every ${POLL_MS}ms`);
setInterval(tick, POLL_MS);

// Scheduled reports (BE-report stretch goal): enqueue one report job per day.
// The idempotency key IS the schedule — "report-<date>" can only ever insert
// once per day, so worker restarts never double-schedule.
if (process.env.SCHEDULE_REPORT_MS) {
  const enqueue = db.prepare(`INSERT OR IGNORE INTO jobs (id, type, idempotency_key, created_at, updated_at)
                              VALUES (?, 'report', ?, ?, ?)`);
  setInterval(() => {
    const day = new Date().toISOString().slice(0, 10);
    enqueue.run(require("crypto").randomUUID(), `report-${day}`, Date.now(), Date.now());
  }, Number(process.env.SCHEDULE_REPORT_MS));
}
