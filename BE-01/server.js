const http = require("http");

const routes = {
  "/hello": { message: "Hello from FlyRank BE-01" },
  "/time": { now: null }, // filled per-request below
};

const server = http.createServer((req, res) => {
  const body = routes[req.url];
  res.writeHead(body ? 200 : 404, { "Content-Type": "application/json" });
  if (req.url === "/time") return res.end(JSON.stringify({ now: new Date().toISOString() }));
  res.end(JSON.stringify(body ?? { error: "not found" }));
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`listening on http://localhost:${port}`));
