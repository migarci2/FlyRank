const http = require("http");
const crypto = require("crypto");

// Same stack as BE-02: node:sqlite is stdlib, so the queue is a table, not a
// service. ponytail: SQLite-as-queue is fine for one box and low volume; the
// upgrade path when volume matters is Postgres SKIP LOCKED or a real broker.
const db = require("./db");

const q = {
  byKey: db.prepare("SELECT * FROM jobs WHERE idempotency_key = ?"),
  get: db.prepare("SELECT * FROM jobs WHERE id = ?"),
  insert: db.prepare(`INSERT INTO jobs (id, type, payload, idempotency_key, created_at, updated_at)
                      VALUES (?, ?, ?, ?, ?, ?)`),
};

const TYPES = new Set(["summarize", "sleep", "fail", "report"]);

const view = (j) => j && {
  id: j.id, type: j.type, status: j.status, attempts: j.attempts,
  result: j.result ? JSON.parse(j.result) : null, error: j.error,
  created_at: j.created_at, updated_at: j.updated_at,
};

const send = (res, code, body, headers) => {
  res.writeHead(code, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify(body));
};

async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const m = url.pathname.match(/^\/jobs\/([0-9a-f-]+)$/);

  if (req.method === "POST" && url.pathname === "/jobs") {
    let body = "";
    for await (const chunk of req) body += chunk;
    let data;
    try { data = JSON.parse(body || "{}"); } catch { return send(res, 400, { error: "Invalid JSON" }); }
    if (!TYPES.has(data.type)) return send(res, 422, { error: `type must be one of: ${[...TYPES].join(", ")}` });

    // Idempotency: same key = same job, no matter how many times the client
    // retries the POST. The UNIQUE column is the mechanism, not app logic.
    const key = req.headers["idempotency-key"] || null;
    if (key) {
      const dup = q.byKey.get(key);
      if (dup) return send(res, 200, view(dup), { Location: `/jobs/${dup.id}` });
    }
    const id = crypto.randomUUID();
    const now = Date.now();
    try {
      q.insert.run(id, data.type, JSON.stringify(data.payload || {}), key, now, now);
    } catch (e) {           // lost the race on the same key: return the winner
      const dup = key && q.byKey.get(key);
      if (dup) return send(res, 200, view(dup), { Location: `/jobs/${dup.id}` });
      throw e;
    }
    // The whole point: accept fast (202), work happens in worker.js.
    return send(res, 202, view(q.get.get(id)), { Location: `/jobs/${id}` });
  }

  if (req.method === "GET" && m) {
    const job = q.get.get(m[1]);
    return job ? send(res, 200, view(job)) : send(res, 404, { error: "Job not found" });
  }

  // Artifact serving for report jobs: the job result carries this link —
  // store and link, never pass PDF bytes through the queue or the status JSON.
  const rep = url.pathname.match(/^\/reports\/(report-[\w.-]+\.pdf)$/);
  if (req.method === "GET" && rep) {
    const file = require("path").join(__dirname, "../BE-report/artifacts", rep[1]);
    if (!require("fs").existsSync(file)) return send(res, 404, { error: "No such report" });
    res.writeHead(200, { "Content-Type": "application/pdf" });
    return res.end(require("fs").readFileSync(file));
  }

  if (req.method === "GET" && url.pathname === "/health") return send(res, 200, { ok: true });
  return send(res, 404, { error: "Not found" });
}

const port = process.env.PORT || 3000;
http.createServer((req, res) =>
  handler(req, res).catch((e) => send(res, 500, { error: e.message }))
).listen(port, () => console.log(`BE-06 API on :${port} (jobs answer 202; worker.js does the work)`));
