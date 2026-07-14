// Same factory shape as BE-04: the service depends only on this interface
//   createUser({email,hash,salt}) -> user | null (null = email taken)
//   findByEmail(email)            -> user | null
//   findById(id)                  -> user | null
// so memory <-> postgres is one env var (STORE) and touches nothing in routes.
function makeRepo(kind) {
  if (kind === "postgres") return require("./postgres");
  if (kind === "memory") return require("./memory");
  throw new Error(`unknown STORE: ${kind}`);
}

module.exports = { makeRepo };
