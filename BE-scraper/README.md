# BE-scraper — The polite scraper

Assignment: *The polite scraper* (Backend AI Engineering, Week 4)
Author: Miguel Garcia Roman

Collect pages from a practice site, extract and clean the useful fields, save
structured records — and behave like a bot the site owner would actually allow.
Output (`quotes.jsonl`) is next week's RAG corpus.

Target: **quotes.toscrape.com** — a site built for scraping practice. Zero
dependencies: Node's global `fetch` + focused extraction.

## What "polite" means here (each is code, not a promise)

- **Reads robots.txt and obeys it** (`robots.js`). Parses the `User-agent` /
  `Disallow` / `Allow` / `Crawl-delay` rules for our agent (falling back to `*`),
  and stops if a path is disallowed.
- **Identifies itself** — a descriptive `User-Agent` with a contact URL, not a
  spoofed browser string.
- **Rate-limits** — obeys `Crawl-delay` if present, and never goes faster than
  **1 request/second** regardless.
- **Backs off** — `429` and `5xx` trigger an increasing wait and a retry, then it
  gives up rather than hammering.
- **Stays home** — refuses to follow a link off the starting host.
- **Bounded** — a `maxPages` cap; it never crawls the whole internet by accident.

## Run

```bash
node test.js                                    # no network: extraction + robots rules
node scraper.js https://quotes.toscrape.com 3 quotes.jsonl
```

Real run (captured):

```
host=quotes.toscrape.com crawl-delay=1000ms max-pages=3
  page 1: / -> 10 records
  page 2: /page/2/ -> 10 records
  page 3: /page/3/ -> 10 records
done: 30 records from 3 pages -> quotes.jsonl
```

## Output shape (structured, cleaned)

One JSON object per line (`quotes.jsonl`) — entities decoded, wrapping curly quotes
stripped, tags as an array, provenance kept:

```json
{"text":"It is our choices, Harry, that show what we truly are, far more than our abilities.","author":"J.K. Rowling","tags":["abilities","choices"],"source":"https://quotes.toscrape.com/"}
```

`source` is deliberate: a RAG corpus needs to cite where each record came from.

## Decisions

- **JSONL, not one big JSON array.** Append-friendly and streamable — you can feed
  it to the next step line-by-line without loading the whole file.
- **Regex/split extraction, no parser dependency.** The page shape is known and
  stable; a DOM library would be weight I don't need here.
  <!-- ponytail: split+regex tuned to this site; swap in a real HTML parser only when scraping arbitrary/hostile markup -->
- **1 req/sec floor even when robots allows faster.** Practice site or not, the
  habit is the deliverable.

## Requirements checklist

- [x] Collects multiple pages from a practice site
- [x] Extracts + cleans useful fields (text, author, tags)
- [x] Saves structured records (JSONL) with provenance
- [x] Obeys robots.txt, sets a real User-Agent, rate-limits, backs off, host-locked
- [x] One runnable check with no network (`node test.js`)
- [x] Real run captured (30 records) — ready as next week's RAG corpus
