// Minimal robots.txt parser — enough to be a polite citizen, not a full RFC 9309.
// Honors the rules for our User-agent (falling back to the "*" group), plus
// Crawl-delay. Unknown directives are ignored.
// ponytail: covers User-agent / Disallow / Allow / Crawl-delay for this task;
//           swap in a full parser if you ever crawl hostile/complex robots.

function parseRobots(text, userAgent) {
  const groups = {}; // agent -> { disallow:[], allow:[], crawlDelay:null }
  let current = [];
  const uaLower = userAgent.toLowerCase();

  for (const raw of text.split("\n")) {
    const line = raw.replace(/#.*/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (field === "user-agent") {
      const agent = value.toLowerCase();
      if (!groups[agent]) groups[agent] = { disallow: [], allow: [], crawlDelay: null };
      current = [groups[agent]];
    } else if (current.length) {
      const g = current[0];
      if (field === "disallow") g.disallow.push(value);
      else if (field === "allow") g.allow.push(value);
      else if (field === "crawl-delay") g.crawlDelay = Number(value) || null;
    }
  }

  // Pick the most specific matching group: our UA if present, else "*".
  const mine = Object.keys(groups).find((a) => a !== "*" && uaLower.includes(a));
  const group = groups[mine] || groups["*"] || { disallow: [], allow: [], crawlDelay: null };

  return {
    crawlDelay: group.crawlDelay,
    isAllowed(path) {
      // Longest matching rule wins; Allow beats Disallow on a tie (RFC behaviour).
      let decision = true;
      let best = -1;
      for (const [rules, allow] of [[group.allow, true], [group.disallow, false]]) {
        for (const rule of rules) {
          if (rule === "") continue; // empty Disallow = allow everything
          if (path.startsWith(rule) && rule.length >= best) {
            best = rule.length;
            decision = allow;
          }
        }
      }
      return decision;
    },
  };
}

module.exports = { parseRobots };
