# Study notes — PostgreSQL MVCC (multiversion concurrency control)

_FL-04 pipeline · Codex (gpt-5.5) runner · synthesize→draft→review · wall-clock 150s · source: src-mvcc.txt_

The cited [PostgreSQL MVCC introduction](https://www.postgresql.org/docs/current/mvcc-intro.html) supports most notes, but four claims are unsupported or overbroad.

## Unsupported claims

1. [UNSUPPORTED] “Transactions use snapshots instead of real-time concurrent changes.”

   The source guarantees a snapshot for each SQL statement, not necessarily one unchanged snapshot for an entire transaction.

2. [UNSUPPORTED] “Transaction A continues seeing its snapshot” after Transaction B updates the row.

   The page does not establish transaction-wide snapshot persistence. That behavior depends on the isolation level.

3. [UNSUPPORTED] “Some applications still require explicit table-level, row-level, or advisory locks.”

   The source says these facilities are available and may be preferred for explicitly managing conflicts; it does not say applications necessarily require them.

4. [UNSUPPORTED] “No contradictions are stated.”

   This is undefined and not a claim made by the source.

# FINAL notes

## Problem

PostgreSQL uses MVCC to maintain data consistency while allowing reads and writes not to block each other. ([PostgreSQL documentation](https://www.postgresql.org/docs/current/mvcc-intro.html))

## Core concepts

- **Snapshot:** Each SQL statement sees a snapshot of the database from a particular point in time.
- **Transaction isolation:** Snapshots prevent statements from seeing inconsistent data produced by concurrent updates.
- **Nonblocking access:** Reading does not block writing, and writing does not block reading.
- **Reduced contention:** MVCC avoids traditional locking methodologies to minimize lock contention in multiuser environments.
- **Serializable isolation:** PostgreSQL maintains this nonblocking behavior at its strictest isolation level through Serializable Snapshot Isolation.

([PostgreSQL documentation](https://www.postgresql.org/docs/current/mvcc-intro.html))

## Minimal example

One SQL statement reads a row from its snapshot while another transaction updates that row. The read and write locks do not conflict, so the read does not block the write and the write does not block the read. ([PostgreSQL documentation](https://www.postgresql.org/docs/current/mvcc-intro.html))

## Gotchas

- A snapshot can represent an earlier database state rather than current concurrent changes.
- Proper use of MVCC generally provides better performance than explicit locks, but “generally” is not an unconditional guarantee.
- PostgreSQL also provides table-level, row-level, and advisory locks for applications that prefer to manage particular conflicts explicitly.

([PostgreSQL documentation](https://www.postgresql.org/docs/current/mvcc-intro.html))

## Open questions

The cited introduction does not explain:

- How row versions are stored and created.
- How old row versions are cleaned up.
- The precise visibility rules for row versions.

([PostgreSQL documentation](https://www.postgresql.org/docs/current/mvcc-intro.html))
