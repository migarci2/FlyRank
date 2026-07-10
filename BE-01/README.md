# BE-01 — First API endpoint

Smallest possible backend: two JSON endpoints, no dependencies (Node stdlib).

## Run

```bash
node server.js
```

## Endpoints

- `GET /hello` → `{ "message": "Hello from FlyRank BE-01" }`
- `GET /time`  → `{ "now": "2026-07-10T..." }`

## Call it

```bash
curl http://localhost:3000/hello
curl http://localhost:3000/time
```

Or open http://localhost:3000/hello in your browser.
