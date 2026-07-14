const http = require("http");
const { makeRepo } = require("./repo");
const auth = require("./auth");

const repo = makeRepo(process.env.STORE || "memory");

function send(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

// Pull { userId } off a "Authorization: Bearer <token>" header, or null.
function currentUser(req) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  return auth.verifyToken(token); // null if missing/invalid/expired
}

async function handler(req, res) {
  try {
    const url = new URL(req.url, "http://localhost");

    // --- register: create a user, store only a salted scrypt hash -----------
    if (req.method === "POST" && url.pathname === "/register") {
      const body = await readJson(req);
      const email = body && String(body.email || "").trim().toLowerCase();
      const password = body && body.password;
      if (!email || !password) return send(res, 400, { error: "email and password required" });
      const { hash, salt } = auth.hashPassword(password);
      const user = await repo.createUser({ email, hash, salt });
      if (!user) return send(res, 409, { error: "email already registered" });
      return send(res, 201, { id: user.id, email: user.email });
    }

    // --- login: verify, hand back a stateless session token -----------------
    if (req.method === "POST" && url.pathname === "/login") {
      const body = await readJson(req);
      const email = body && String(body.email || "").trim().toLowerCase();
      const password = body && body.password;
      const user = email ? await repo.findByEmail(email) : null;
      // Same generic 401 for unknown-email and wrong-password: don't leak which
      // accounts exist (the enumeration fix from the Prompt Ladder's V5).
      const ok = user && auth.verifyPassword(password || "", user.salt, user.hash);
      if (!ok) return send(res, 401, { error: "invalid credentials" });
      const { token, expires } = auth.issueToken(user.id);
      return send(res, 200, { token, expires });
    }

    // --- protected: answers only for logged-in users (honest 401) -----------
    if (req.method === "GET" && url.pathname === "/me") {
      const who = currentUser(req);
      if (!who) return send(res, 401, { error: "authentication required" });
      const user = await repo.findById(who.userId);
      if (!user) return send(res, 401, { error: "authentication required" });
      return send(res, 200, { id: user.id, email: user.email, is_admin: user.is_admin });
    }

    // --- authz demo: authenticated but not allowed -> honest 403 ------------
    if (req.method === "GET" && url.pathname === "/admin") {
      const who = currentUser(req);
      if (!who) return send(res, 401, { error: "authentication required" });
      const user = await repo.findById(who.userId);
      if (!user) return send(res, 401, { error: "authentication required" });
      if (!user.is_admin) return send(res, 403, { error: "forbidden" });
      return send(res, 200, { ok: true, admin: user.email });
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
