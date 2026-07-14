// A polite scraper: reads robots.txt and obeys it, identifies itself, rate-limits,
// backs off on errors, and stays on one host. Collects quotes.toscrape.com into
// structured JSONL records (next week's RAG corpus).
//
//   node scraper.js [baseUrl] [maxPages] [outFile]
//   node scraper.js https://quotes.toscrape.com 5 quotes.jsonl
const fs = require("fs");
const { parseRobots } = require("./robots");
const { extract } = require("./extract");

const UA =
  "FlyRank-intern-scraper/1.0 (+https://github.com/migarci2/FlyRank; educational, polite)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url, tries = 3) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    // Back off and retry on rate-limit / transient server errors.
    if (res.status === 429 || res.status >= 500) {
      const wait = 1000 * attempt;
      console.warn(`  ${res.status} on ${url} — backing off ${wait}ms (try ${attempt})`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.text();
  }
  throw new Error(`gave up after ${tries} tries: ${url}`);
}

async function loadRobots(origin) {
  try {
    const res = await fetch(`${origin}/robots.txt`, { headers: { "User-Agent": UA } });
    if (!res.ok) return parseRobots("", UA); // no robots.txt = allowed
    return parseRobots(await res.text(), UA);
  } catch {
    return parseRobots("", UA);
  }
}

async function scrape(baseUrl, maxPages, outFile) {
  const base = new URL(baseUrl);
  const robots = await loadRobots(base.origin);
  // Politeness floor: obey Crawl-delay if given, never faster than 1 req/sec.
  const delay = Math.max((robots.crawlDelay || 0) * 1000, 1000);
  console.log(`host=${base.host} crawl-delay=${delay}ms max-pages=${maxPages}`);

  const out = fs.createWriteStream(outFile, { flags: "w" });
  let path = base.pathname === "/" ? "/" : base.pathname;
  let pages = 0;
  let total = 0;

  while (path && pages < maxPages) {
    const url = new URL(path, base.origin);
    if (url.host !== base.host) break; // never wander off the starting host
    if (!robots.isAllowed(url.pathname)) {
      console.warn(`  robots disallows ${url.pathname} — stopping`);
      break;
    }

    const html = await fetchText(url.href);
    const { records, next } = extract(html);
    for (const rec of records) {
      out.write(JSON.stringify({ ...rec, source: url.href }) + "\n");
    }
    total += records.length;
    pages++;
    console.log(`  page ${pages}: ${url.pathname} -> ${records.length} records`);

    path = next;
    if (path && pages < maxPages) await sleep(delay); // be polite between hits
  }

  out.end();
  console.log(`done: ${total} records from ${pages} pages -> ${outFile}`);
  return { pages, total };
}

if (require.main === module) {
  const [, , baseUrl = "https://quotes.toscrape.com", maxPages = "5", outFile = "quotes.jsonl"] =
    process.argv;
  scrape(baseUrl, Number(maxPages), outFile).catch((e) => {
    console.error("FAIL:", e.message);
    process.exit(1);
  });
}

module.exports = { scrape };
