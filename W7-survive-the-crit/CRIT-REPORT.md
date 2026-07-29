# Portfolio Crit — migarci2.dev

*Structured fresh-eyes review, 2026-07-29. Reviewer: AI agent (no prior context;
given only the live URL and the proof statement). Kept verbatim.*

## First 90 seconds

Dark, confident, genuinely distinctive: pixel-type hero over a galaxy — "systems. security. intelligence. / I build close to the machine." Scroll: three projects — Linux Kernel ("6 confirmed patches · C · LFX mentorship"), ProofMesh ("Mathematics, made collaborative. Lean 4 · AI"), agenctf ("Agents for real security work"). Then "6 confirmed patches. Team Europe. Team Spain." Then a contact footer: "Let's build something real."

My honest read after 90 seconds: this is a talented low-level/security student — kernel patches, CTF, formal methods. Impressive for his stage. But I could not tell you what he'd *do for me*. "I build close to the machine" is a mood, not a claim. Nothing mentions integrations, undocumented systems, APIs, or shipping tools. And when I did what the site asks — clicked a project to read the work — two of the three cards dumped me on a bare GitHub profile whose bio says "📚 Student!" with four school exercises pinned. I searched: **there is no public ProofMesh or agenctf repo at all** (both 404 under migarci2; not in his 79 public repos). The only readable work is six kernel commits — real, verifiable, and genuinely his — but they're strcpy→strscpy conversions and two ntfs3 backports, not "the small tool that makes an undocumented backend usable."

## Verdict on the proof statement

**Can I state what he does?** Partially — "kernel/security student who ships upstream" comes through. The proof statement — *"I take an undocumented backend system and ship the small, reliable tool that makes it usable — reading the wire, not waiting for docs"* — does **not** come through. It is never stated, paraphrased, or implied anywhere on the site.

**Does the work back it up?** No. The kernel page proves *upstream process discipline* (excellent, but a different claim). ProofMesh and agenctf — the two projects that could carry the tool-shipping story — are unreadable: no repos exist. The agenctf blog post has exactly the right mindset (dossiers, harnesses, "logs as UI") but there's nothing to read. **The one action — read a repo, then email — is currently impossible for 2 of 3 projects.** The funnel is: intriguing card → generic student profile → back button.

## Must-fix

1. **The "read one repo" action dead-ends.** ProofMesh and agenctf cards, plus "view the work ↗", all link to `https://github.com/migarci2` (profile root). `github.com/migarci2/proofmesh` and `/agenctf` return 404; neither appears among his public repos. *Fix: publish both repos (even partial, with a real README), deep-link each card directly to its repo, and pin them.* This is the single highest-leverage fix on the site.

2. **The GitHub profile — where every work link lands — actively contradicts the site.** Bio: "📚 Student!". Tagline: "Man is the measure of all things". Pinned: ft_transcendence, webserv, Cub3d, modl (42-school exercises). The busy founding engineer's last impression before deciding whether to email is "student doing coursework." *Fix: rewrite the profile README around the proof statement, pin ProofMesh, agenctf, and a kernel-patch index repo.*

3. **The positioning is never stated.** Hero: "systems. security. intelligence." Meta description (the Google snippet): *"Computer Engineering student building systems, security tooling, AI agents and open-source technical products."* — leads with "student," lists four directions, claims none. *Fix: one concrete sentence in the hero and meta, e.g. "I take undocumented backends and ship the small, reliable tools that make them usable." Then let the kernel page do the proving.*

4. **No shown project demonstrates the claim.** Kernel = upstream hygiene; ProofMesh = math; agenctf = closest in spirit but invisible. There is no artifact of the form "here's a half-documented API I reverse-engineered from traffic, and here's the 500-line tool with tests that made it usable." *Fix: ship one such repo and make it project 01 or 02. Without it the proof statement is aspiration, not proof.*

5. **The footer's most prominent CTA is a fake email button.** `<button type="button">send one ↗</button>` next to "2 signals received" doesn't open email — it POSTs to `/api/signal` and increments a counter (verified: 2 → "3 signals received · signal sent ✓"; the ↗ arrow falsely signals an external action). The real `email` link is a smaller plain link above it. *Fix: keep the counter gimmick but relabel it ("ping ✓"), and make the emphasized CTA an actual `mailto:` — ideally with a prefilled subject.* (Note: my test click added one to your public counter.)

6. **The site breaks its own "small, reliable" promise.** (a) Blog footer says "hit ⌘K for the command palette" — no palette opens on ⌘K or Ctrl+K on any page (verified in DOM). (b) Blog nav contains a "game" link → `/#game`, an anchor that doesn't exist on the homepage (only `top/content/work/contact`) — it silently dumps you at the hero. A reviewer whose pitch is *reliability* cannot ship a false keyboard-shortcut claim and a dead nav link. *Fix: delete the ⌘K line (or build it) and remove/fix "game".*

## Nice-to-have

1. **Nav label drift:** the homepage calls the blog "notes"; blog pages call it "blog". Pick one.
2. **"Team Europe. Team Spain." is unexplained** on the homepage — a non-CTF reader has no idea it means ECSC/ICC selection. Three words of context ("CTF — represented Spain, ECSC") would convert confusion into a credential.
3. **The kernel page could connect to the proof statement:** the six patches are one class of bug (unsafe `strcpy`) hunted across four subsystems — that's a *systematic sweep*, which is exactly the wire-reading temperament. One sentence on *how you found them* (tooling? coccinelle? grep + audit?) would do more than the mentorship link.
4. **CV leads with education** ("Computer Engineering undergraduate…") and buries the shipping story. Reorder: open source and projects first for this audience.
5. **The agenctf blog post shows a CLI transcript but links to nothing** — once the repo exists, link it from the post; that post is your best pre-sell.
6. **Page title** is just "Miguel Garcia Roman" — cheap slot for the positioning line.

## What's genuinely good

- **/kernel is the best page on the site — protect it.** "Patches, not claims." Every entry deep-links to the actual commit in `torvalds/linux` or `gregkh/linux`, with subsystem, date, and honest status ("Backported to 6.1.y and signed off by Greg Kroah-Hartman"). This is exactly the evidentiary instinct the proof statement needs — it just needs a sibling page for a wire-reading project.
- **The design is distinctive and disciplined.** Cohesive pixel-type + galaxy aesthetic, restrained accent color, clean mobile rendering at 375px, fast loads. It doesn't look like a template, and nothing here needs a redesign.
- **The blog voice is real.** "Write the changelog like a bug report. No adjectives." / the agenctf lessons about agents "hallucinating a story about progress." Specific, unpadded, engineer-to-engineer. Three posts is plenty; don't force cadence.
- **No inflated numbers.** "6 confirmed patches" is modest, exact, and checkable. Keep that honesty — it's rarer than talent.

**Bottom line:** the aesthetic and the evidence discipline are hire-signal quality; the funnel is broken at its only conversion point. Publish the two missing repos (or one new wire-reading tool), deep-link the cards, fix the GitHub landing page, and state the claim in one sentence — the rest of the site already knows how to prove things.
