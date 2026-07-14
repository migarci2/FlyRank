// One runnable check, no database: password hashing, token verify (incl. expiry
// and tamper), and the 401/403 route behaviour end-to-end through the handler.
//   node test.js
const assert = require("assert");
const http = require("http");
const auth = require("./auth");
const { handler } = require("./server"); // STORE defaults to memory

// --- unit: password hashing ---------------------------------------------------
{
  const { hash, salt } = auth.hashPassword("hunter2");
  assert.ok(auth.verifyPassword("hunter2", salt, hash), "correct password verifies");
  assert.ok(!auth.verifyPassword("wrong", salt, hash), "wrong password rejected");
}

// --- unit: token verify, tamper, expiry --------------------------------------
{
  const { token } = auth.issueToken(42);
  assert.strictEqual(auth.verifyToken(token).userId, 42, "valid token -> userId");
  assert.strictEqual(auth.verifyToken(token + "x"), null, "tampered token rejected");
  assert.strictEqual(auth.verifyToken("a.b.c"), null, "garbage token rejected");

  // force the clock past expiry -> token must stop verifying
  const { token: t2, expires } = auth.issueToken(7, 1000);
  auth._setClock(() => expires + 1);
  assert.strictEqual(auth.verifyToken(t2), null, "expired token rejected");
  auth._setClock(() => Date.now());
}

// --- integration: drive the real handler over a socket -----------------------
function req(method, path, { body, token } = {}) {
  return new Promise((resolve) => {
    const server = http.createServer(handler).listen(0, () => {
      const opts = {
        host: "127.0.0.1",
        port: server.address().port,
        method,
        path,
        headers: { "Content-Type": "application/json" },
      };
      if (token) opts.headers.Authorization = `Bearer ${token}`;
      const r = http.request(opts, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          server.close();
          resolve({ status: res.statusCode, json: data ? JSON.parse(data) : null });
        });
      });
      if (body) r.write(JSON.stringify(body));
      r.end();
    });
  });
}

(async () => {
  const creds = { email: "a@b.com", password: "pw12345" };

  let r = await req("GET", "/me");
  assert.strictEqual(r.status, 401, "no token -> 401");

  r = await req("POST", "/register", { body: creds });
  assert.strictEqual(r.status, 201, "register -> 201");

  r = await req("POST", "/register", { body: creds });
  assert.strictEqual(r.status, 409, "duplicate email -> 409");

  r = await req("POST", "/login", { body: { ...creds, password: "nope" } });
  assert.strictEqual(r.status, 401, "wrong password -> 401");

  r = await req("POST", "/login", { body: { email: "nobody@x.com", password: "x" } });
  assert.strictEqual(r.status, 401, "unknown email -> 401 (same as wrong pw)");

  r = await req("POST", "/login", { body: creds });
  assert.strictEqual(r.status, 200, "login -> 200");
  const token = r.json.token;

  r = await req("GET", "/me", { token });
  assert.strictEqual(r.status, 200, "valid token -> 200");
  assert.strictEqual(r.json.email, creds.email, "returns the logged-in user");

  r = await req("GET", "/admin", { token });
  assert.strictEqual(r.status, 403, "authenticated non-admin -> 403");

  console.log("ok - auth: hashing, tokens, and 401/403 all hold");
})().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});
