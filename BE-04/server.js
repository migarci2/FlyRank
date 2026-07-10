const http = require("http");
const { makeRepo } = require("./repo");

// The service and its routes don't know where data lives. All storage goes
// through the repo interface (create/list/get), so swapping memory <-> Postgres
// is one env var and touches nothing below.
const repo = makeRepo(process.env.STORE || "memory");

function send(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function handler(req, res) {
  try {
    const url = new URL(req.url, "http://localhost");

    if (req.method === "POST" && url.pathname === "/items") {
      const text = await readJson(req).then((b) => b && b.text);
      if (!text) return send(res, 400, { error: "text required" });
      return send(res, 201, await repo.create(text));
    }
    if (req.method === "GET" && url.pathname === "/items") {
      return send(res, 200, await repo.list());
    }
    const m = url.pathname.match(/^\/items\/(\d+)$/);
    if (req.method === "GET" && m) {
      const item = await repo.get(Number(m[1]));
      return item ? send(res, 200, item) : send(res, 404, { error: "not found" });
    }
    if (req.method === "GET" && url.pathname === "/health") {
      return send(res, 200, { ok: true, store: repo.kind });
    }
    send(res, 404, { error: "not found" });
  } catch (err) {
    send(res, 500, { error: String(err.message || err) });
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      if (!data) return resolve(null);
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error("invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

async function main() {
  await repo.init();
  const port = process.env.PORT || 3000;
  http.createServer(handler).listen(port, () =>
    console.log(`listening on http://localhost:${port} (store=${repo.kind})`)
  );
}

if (require.main === module) main();
module.exports = { handler };
