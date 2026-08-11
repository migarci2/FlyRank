import assert from "node:assert/strict";
import http from "node:http";
import { parseOutput } from "./src/schema.js";
import { callWithRetries, triage } from "./src/triage.js";
import { makeHandler } from "./server.js";

assert.equal(parseOutput("```json\n{\"category\":\"bug\",\"urgency\":\"high\",\"confidence\":0.9,\"reason\":\"It crashes.\"}\n```").category, "bug");
assert.throws(() => parseOutput('{"category":"invented"}'));

let calls = 0;
const repaired = await triage({ text: "The app crashes" }, { call: async () => {
  calls++;
  return calls === 1 ? "not json" : '{"category":"bug","urgency":"high","confidence":0.95,"reason":"The app crashes."}';
} });
assert.equal(repaired.status, 200);
assert.equal(calls, 2, "one repair call only");

let quarantined;
const rejected = await triage({ text: "bad output" }, {
  call: async () => "still not json",
  quarantineWrite: async (entry) => { quarantined = entry; },
});
assert.equal(rejected.status, 422);
assert.equal(quarantined.prompt_version, "triage-v1");

let attempts = 0;
const retryResult = await callWithRetries(async () => {
  attempts++;
  if (attempts < 3) throw Object.assign(new Error("busy"), { status: 503 });
  return "ok";
}, async () => {});
assert.equal(retryResult, "ok");
assert.equal(attempts, 3);

await assert.rejects(() => callWithRetries(async () => {
  throw Object.assign(new Error("bad key"), { status: 401 });
}, async () => {}), /bad key/);

function request(server, body) {
  return new Promise((resolve) => {
    const req = http.request({ host: "127.0.0.1", port: server.address().port, path: "/triage", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.end(JSON.stringify(body));
  });
}

const server = http.createServer(makeHandler()).listen(0);
process.env.LLM_STUB = "1";
assert.equal((await request(server, {})).status, 400);
assert.equal((await request(server, { text: "hello" })).status, 200);
process.env.LLM_ENABLED = "false";
assert.equal((await request(server, { text: "hello" })).status, 503);
server.close();

console.log("ok - validation, repair, quarantine, retries, stub and kill switch");
