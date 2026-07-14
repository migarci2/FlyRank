// One runnable check, no network: extraction cleans real markup into structured
// records, and the robots parser actually blocks what it should.  node test.js
const assert = require("assert");
const { extract } = require("./extract");
const { parseRobots } = require("./robots");

// --- extraction: a trimmed but real quotes.toscrape.com fragment -------------
const html = `
<div class="quote" itemscope>
  <span class="text" itemprop="text">“The world as we have created it is a process of our &amp; thinking.”</span>
  <span>by <small class="author" itemprop="author">Albert Einstein</small></span>
  <div class="tags"> Tags:
    <a class="tag" href="/tag/change/">change</a>
    <a class="tag" href="/tag/world/">world</a>
  </div>
</div>
<div class="quote" itemscope>
  <span class="text" itemprop="text">“It is our choices that show what we truly are.”</span>
  <span>by <small class="author" itemprop="author">J.K. Rowling</small></span>
  <div class="tags"> Tags: <a class="tag" href="/tag/choices/">choices</a> </div>
</div>
<li class="next"><a href="/page/2/">Next</a></li>`;

const { records, next } = extract(html);
assert.strictEqual(records.length, 2, "two quotes extracted");
assert.strictEqual(records[0].author, "Albert Einstein", "author parsed");
assert.ok(!/[“”]/.test(records[0].text), "curly quotes stripped");
assert.ok(records[0].text.includes("& thinking"), "entities decoded");
assert.deepStrictEqual(records[0].tags, ["change", "world"], "tags collected");
assert.deepStrictEqual(records[1].tags, ["choices"], "single tag ok");
assert.strictEqual(next, "/page/2/", "next-page link found");

// --- robots: obey Disallow, honor Crawl-delay --------------------------------
const robots = parseRobots(
  `User-agent: *\nDisallow: /private/\nCrawl-delay: 2\n`,
  "FlyRank-intern-scraper"
);
assert.strictEqual(robots.isAllowed("/page/2/"), true, "public path allowed");
assert.strictEqual(robots.isAllowed("/private/x"), false, "disallowed path blocked");
assert.strictEqual(robots.crawlDelay, 2, "crawl-delay parsed");

// empty Disallow means "allow everything"
const open = parseRobots(`User-agent: *\nDisallow:\n`, "anything");
assert.strictEqual(open.isAllowed("/anything"), true, "empty disallow = open");

console.log("ok - scraper: extraction cleans records and robots rules are obeyed");
