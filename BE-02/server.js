const http = require("http");
const { DatabaseSync } = require("node:sqlite");

// ponytail: node:sqlite is stdlib on Node 22+, so no better-sqlite3 dependency.
const db = new DatabaseSync(process.env.DB_FILE || "tasks.db");

db.exec(`CREATE TABLE IF NOT EXISTS tasks (
  id    INTEGER PRIMARY KEY,
  title TEXT    NOT NULL,
  done  INTEGER NOT NULL DEFAULT 0
)`);

// Seed only on a virgin table, so restarts never duplicate the examples.
if (db.prepare("SELECT COUNT(*) AS n FROM tasks").get().n === 0) {
  const insert = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)");
  insert.run("Read the assignment", 1);
  insert.run("Connect the CRUD to SQLite", 0);
  insert.run("Prove the data survives a restart", 0);
}

// SQLite has no boolean, so done is stored 0/1 and re-typed on the way out.
const row = (r) => r && { id: r.id, title: r.title, done: !!r.done };

const q = {
  list: db.prepare("SELECT * FROM tasks ORDER BY id"),
  get: db.prepare("SELECT * FROM tasks WHERE id = ?"),
  insert: db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?) RETURNING *"),
  update: db.prepare("UPDATE tasks SET title = ?, done = ? WHERE id = ? RETURNING *"),
  del: db.prepare("DELETE FROM tasks WHERE id = ?"),
};

const send = (res, code, body) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

async function handler(req, res) {
  const path = new URL(req.url, "http://localhost").pathname;
  const m = path.match(/^\/tasks\/(\d+)$/);
  const id = m && Number(m[1]);
  const notFound = { error: "Task not found" };

  if (req.method === "GET" && path === "/tasks") return send(res, 200, q.list.all().map(row));

  if (req.method === "GET" && id) {
    const task = row(q.get.get(id));
    return task ? send(res, 200, task) : send(res, 404, notFound);
  }

  if (req.method === "POST" && path === "/tasks") {
    const body = await readJson(req);
    if (!body || typeof body.title !== "string" || !body.title.trim())
      return send(res, 400, { error: "title is required" });
    return send(res, 201, row(q.insert.get(body.title.trim(), body.done ? 1 : 0)));
  }

  if (req.method === "PUT" && id) {
    const body = await readJson(req);
    if (!body || typeof body.title !== "string" || !body.title.trim())
      return send(res, 400, { error: "title is required" });
    const task = row(q.update.get(body.title.trim(), body.done ? 1 : 0, id));
    return task ? send(res, 200, task) : send(res, 404, notFound);
  }

  if (req.method === "DELETE" && id) {
    return q.del.run(id).changes ? send(res, 204, null) : send(res, 404, notFound);
  }

  send(res, 404, notFound);
}

function readJson(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : null);
      } catch {
        resolve(null); // malformed JSON is just a missing body -> 400 above
      }
    });
  });
}

const server = http.createServer((req, res) =>
  handler(req, res).catch(() => send(res, 500, { error: "internal error" }))
);

if (require.main === module) {
  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`listening on http://localhost:${port}`));
}

module.exports = { server };
