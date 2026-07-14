# Study notes — scrypt vs Argon2id for password hashing (OWASP)

_FL-04 pipeline · Codex (gpt-5.5) runner · synthesize→draft→review · wall-clock 144s · source: src-kdf.txt_

Checked against the current [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

## Unsupported claims

- [UNSUPPORTED] “bcrypt has a 72-byte maximum input length.” OWASP qualifies this as true for **most implementations**, which may have different or smaller limits.
- [UNSUPPORTED] “The supplied material does not cover pepper generation and rotation.” It covers secure generation, storage, compromise handling, and the password resets required to change a pepper.
- [UNSUPPORTED] “The supplied material does not cover algorithm migration steps.” OWASP provides several migration approaches.
- [UNSUPPORTED] “The supplied material does not cover hardware-specific tuning.” It explains that work factors must be tested on the actual servers, although it provides no universal hardware-specific values.
- [UNSUPPORTED] “Contradictions.” No particular contradiction is identified, so this is not a verifiable open question.

# FINAL notes

## Problem

Password hashing should make brute-force guessing expensive. Use a slow, memory-hard algorithm, preferably Argon2id, to resist GPU-accelerated attacks. [Source](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

## Core concepts

- Argon2id is the preferred choice because it balances resistance to side-channel and GPU-based attacks.
- Use scrypt when Argon2id is unavailable.
- Use bcrypt only for legacy systems where Argon2id and scrypt are unavailable.
- Use PBKDF2 when FIPS-140 compliance is required.
- A unique, randomly generated salt prevents precomputed lookup-table attacks.
- A shared pepper provides defense in depth and must be stored separately from password hashes.
- Slow, memory-hard algorithms make brute-force attacks more difficult, expensive, and time-consuming.

[Source](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

## Minimal example

Hash each password with Argon2id using:

- `m=19456` (19 MiB)
- `t=2`
- `p=1`
- A unique, randomly generated salt

If using a pepper, store it outside the password database, such as in a secrets vault or HSM. [Source](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

## Gotchas

1. Use scrypt as a fallback when Argon2id is unavailable, not merely as a matter of preference.
2. For most bcrypt implementations, enforce a maximum password length of 72 bytes—or less if the implementation has a smaller limit—and use a work factor of at least 10.
3. Do not store the pepper alongside password hashes; otherwise, it cannot protect hashes against an attacker who obtains only the database.

[Source](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

## Open questions

The cited source does not specify:

- An exact salt length
- A particular library or implementation to use
