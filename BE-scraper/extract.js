// Turn one quotes.toscrape.com page into clean, structured records + the next-page
// link. Tuned to this practice site's markup on purpose.
// ponytail: split+regex extraction for a known, stable page shape; reach for a real
//           HTML parser (e.g. a DOM lib) only when scraping arbitrary sites.

function decode(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function clean(text) {
  // Strip the curly quotes the site wraps every quote in, plus stray whitespace.
  return decode(text).replace(/^[“”"]+|[“”"]+$/g, "").trim();
}

function extract(html) {
  const records = [];
  // Each quote block starts at `class="quote"`; a chunk runs to the next one.
  const chunks = html.split('class="quote"').slice(1);
  for (const chunk of chunks) {
    const text = chunk.match(/<span class="text"[^>]*>([\s\S]*?)<\/span>/);
    const author = chunk.match(/<small class="author"[^>]*>([\s\S]*?)<\/small>/);
    if (!text || !author) continue; // not a real quote block, skip
    const tags = [...chunk.matchAll(/<a class="tag"[^>]*>([\s\S]*?)<\/a>/g)].map((m) =>
      decode(m[1])
    );
    records.push({ text: clean(text[1]), author: decode(author[1]), tags });
  }

  const next = html.match(/<li class="next">\s*<a href="([^"]+)"/);
  return { records, next: next ? next[1] : null };
}

module.exports = { extract, clean, decode };
