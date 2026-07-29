# Explain It Like You Built It

Assignment: *Explain It Like You Built It* (General AI Fluency, Week 6)
Author: Miguel Garcia Roman

---

## The part I picked: how "deploy" actually pushes my site live

I picked the step I typed most and understood least end-to-end:
`npm run build && npx wrangler deploy`. I write systems code — I wanted to know
what those eight seconds actually *do*, because "it goes to the cloud" is not an
explanation, it's a shrug. I had AI tutor me through it (my standing rule from
FL-01: explain the trade-off, don't hand me the answer), asking follow-ups until
I could predict what each step produces before running it. Then I proved it to
myself by looking: the `out/` folder is right there, and `curl -i` shows who
answers.

## The explanation (for a friend who's never built a site)

Imagine your website is a book. There are two very different moments: *writing
the book* and *putting copies in every bookshop*.

**Writing the book is the build.** My site's source code isn't web pages — it's
recipes for web pages (components, templates, a folder of blog posts). When I
run `npm run build`, a program follows every recipe and bakes the real thing:
plain HTML files (the words), CSS files (the typography and layout), JavaScript
files (the interactive bits), fonts and images. It all lands in a folder called
`out/`. Here's the part that surprised me: after this step, **the framework I
built the site with is gone**. Nothing in `out/` needs Node or React "running"
— it's just files, the way a printed book no longer needs the author's pen. I
can open the folder and read every page it produced. If the build has an error,
nothing gets published at all — you can't print half a book.

**Deploy is distribution, not printing.** `npx wrangler deploy` takes the
`out/` folder and uploads it to Cloudflare, which is less like "a server" and
more like a chain of thousands of small bookshops around the world (data
centres). It only ships copies of files that changed — it compares fingerprints,
like noticing only chapter 3 was edited — which is why my deploys say things
like "38 uploaded, 45 already uploaded". Then it tells the chain: "when anyone
asks for `migarci2.dev`, hand them these files." A minute later someone in
Japan gets my homepage from a shop near Japan, not from my laptop. My laptop
can be off; the book is in the shops, not in my pen.

**How does the visitor find the right shop?** That's DNS — the phone book part
— which I wrote up separately in [PF-04](../PF-04): typing my domain resolves,
through a chain of "ask the next guy", to Cloudflare's nearest address.

**And the one dynamic thing.** In [Week 8](../W8-make-it-do-something) I added
a tiny program that *does* run on Cloudflare's side (the signal counter). The
mental model holds: the bookshop hands out printed pages for everything, except
one counter at the till that it updates when asked. That's the entire divide
between "static" and "backend", and now I can point at the exact line in my
config where it happens (`main: worker.js` vs `assets: ./out`).

## How I know I actually get it (not pasted output)

Predictions I can now make and verify: delete `out/` and the site stays up
(the shops have copies; my folder is irrelevant after upload). Edit a post
without rebuilding and deploy — nothing changes (I'd be shipping the old
baked files; the recipe isn't the book). Break the build — the live site is
untouched. I tested the first two this month without thinking about it, which
is how I know the model finally lives in my head and not in a chat log.

## Pass / revise — self-check

- **Explanation in my own words, actually correct** → book/bookshop model maps
  1:1 to build artifact vs CDN distribution, verified against my real deploys. ✓
- **Demonstrates learning, not pasted output** → the surprises and predictions
  are mine; each claim is checkable against this repo's own deploy logs. ✓
