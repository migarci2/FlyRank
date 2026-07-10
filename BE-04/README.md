# BE-04 — Containerize your stack

Assignment: *Containerize your stack* (Backend AI Engineering, Week 2)
Author: Miguel Garcia Roman

Run Postgres in Docker, swap the in-memory store for a real Postgres repository
**without changing the service or its routes**, and start app + database with one
command.

## The one decision that made it easy

Storage lives behind a repository interface (`init / create / list / get`).
`server.js` depends only on that shape, so switching stores is a single env var
(`STORE=memory|postgres`) and touches nothing in the routes. The in-memory store
(`repo/memory.js`) is the "A2" version kept for tests; `repo/postgres.js` is the
same interface backed by real SQL.

```
server.js ── uses ──► repo (interface) ──► memory.js   (tests, no DB)
                                       └──► postgres.js (docker, durable)
```

## Run

```bash
cp .env.example .env
docker compose up --build       # starts Postgres, waits for it healthy, then the app
```

- App: http://localhost:3000  (override host port with `APP_PORT=3010 docker compose up`)
- Postgres runs in its own container; the app waits on a healthcheck
  (`depends_on: condition: service_healthy`) so it never races the DB.

Endpoints (unchanged from the in-memory service):

```bash
curl -X POST localhost:3000/items -d '{"text":"hello"}'
curl localhost:3000/items
curl localhost:3000/items/1
curl localhost:3000/health      # {"ok":true,"store":"postgres"}
```

Run the store-agnostic check with no database:

```bash
node test.js        # ok - repo contract holds
```

## Persistence proof (real run)

Data lives in the named volume `pgdata`, so `docker compose down` (without `-v`)
keeps it. Captured:

```
# create, then list
POST /items {"text":"survive the restart"} -> {"id":1,...}
POST /items {"text":"second item"}         -> {"id":2,...}
GET  /items -> [{"id":2,...},{"id":1,"text":"survive the restart",...}]

# restart the whole stack (volume kept)
$ docker compose down        # containers removed, pgdata volume NOT removed
$ docker compose up -d

# same query, data still there
GET  /items -> [{"id":2,...},{"id":1,"text":"survive the restart",...}]
```

Both rows survived a full container teardown and restart — persistence is on the
volume, not in the process.

## Layout

```
server.js            http service + routes (store-agnostic)
repo/index.js        factory: picks memory or postgres by env
repo/memory.js       in-memory store (the "A2" version)
repo/postgres.js     Postgres store, same interface
db/schema.sql        items table (also applied idempotently on app startup)
Dockerfile           app image
docker-compose.yml   app + postgres, named volume, healthcheck
.env.example         copy to .env
test.js              one runnable check of the repo contract
```

## Requirements checklist

- [x] Postgres in Docker with a **volume**
- [x] `.env` + `.env.example`
- [x] table created (`db/schema.sql`, idempotent on startup)
- [x] Postgres repository, same interface as in-memory
- [x] service and routes unchanged across the swap
- [x] `docker compose up` starts app + database together
- [x] persistence proven across a restart
