import http from "node:http";
import { triage, statusForProviderError } from "./src/triage.js";

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 10_000) reject(new Error("request body too large"));
    });
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : null); }
      catch { reject(new Error("invalid JSON")); }
    });
    req.on("error", reject);
  });
}

export function makeHandler(runTriage = triage) {
  return async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (req.method === "GET" && url.pathname === "/health") return send(res, 200, { ok: true });
    if (req.method !== "POST" || url.pathname !== "/triage") return send(res, 404, { error: "not found" });
    try {
      const result = await runTriage(await readJson(req));
      return send(res, result.status, result.body);
    } catch (error) {
      return send(res, statusForProviderError(error), { error: statusForProviderError(error) === 504 ? "model timed out" : "model provider failed" });
    }
  };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  http.createServer(makeHandler()).listen(process.env.PORT || 3000, () => {
    console.log(`listening on http://localhost:${process.env.PORT || 3000}`);
  });
}
