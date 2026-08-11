# Break Your Own Site

Site tested: [https://migarci2.dev](https://migarci2.dev)
Hardening run: 2026-08-11

## Where it broke

| Test | Result | Triage |
| --- | --- | --- |
| Empty/garbage form submission | There is no web form; the contact action is a native `mailto:` link. | Not applicable |
| Double-submit the interactive action | The signal button used to allow ambiguous repeat clicks. It now disables after a successful POST and changes to `ping sent ✓`. | Fixed now |
| Untested device size | Full page checked at 375×812. Navigation, project cards, contact links, and the signal button remain accessible. | Passed |
| Click every project/demo link | `/kernel`, `/blog`, the CV, ProofMesh, `webserv`, and `ft_transcendence` all returned successfully. Generic GitHub-profile links on `webserv` and `ft_transcendence` were replaced with exact repositories; the private AgenCTF project now links to its public case study. | Fixed now |
| Dead navigation | The blog contained a `/#game` link and command-palette action without a matching section. Both were removed. | Fixed now |
| Share/findability metadata | The home page had only a title and description. Canonical, Open Graph, Twitter card, robots, and sitemap metadata are now deployed. | Fixed now |
| Dependency audit | The first audit found 11 advisories, including Next.js. Compatible upgrades reduced `npm audit` to zero findings and the production build still passes. | Fixed now |
| Search my name | Google blocked the automated check; Bing did not surface the domain for the exact-name query yet. | Known limitation: indexing lag; sitemap is live |

## Evidence

- Cloudflare Worker release: `f7b0a4f0-dd7d-4490-89e5-4cd4d9d40dee`
- HTTPS custom domain: [https://migarci2.dev](https://migarci2.dev)
- SEO: [robots.txt](https://migarci2.dev/robots.txt) and [sitemap.xml](https://migarci2.dev/sitemap.xml)
- Analytics proof: [live counter JSON](https://migarci2.dev/api/visit)
- Mobile performance check: DNS 1 ms, TTFB 38 ms, DOM ready 232 ms, total load 383 ms in the test browser.
- Local checks: `npm test`, `npm run build`, and `npm audit` all pass.

## Known limitations

- AgenCTF remains private, so its card links to the public technical case study rather than pretending a public repository exists.
- The lightweight analytics endpoint counts page loads, not unique people. KV increments are intentionally non-atomic at this traffic level; the code names Durable Objects as the upgrade path.
- Search-engine indexing is external and not immediate. The domain, canonical URL, robots file, and sitemap are ready; ranking is not claimed.

This report is the submission for Checkpoint 2 hardening review. The earlier fresh-eyes critique is preserved in [`W7-survive-the-crit`](../W7-survive-the-crit); the site-scoped failures it found are now fixed or explicitly named above.
