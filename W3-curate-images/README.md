# Kill Your Darlings: Curate Your Images

Assignment: *Kill your darlings: Curate Your Images* (General AI Fluency, Week 3)
Author: Miguel Garcia Roman
Maps to the content plan in [../W3-content-cta-map](../W3-content-cta-map); style set
by [../W3-identity-kit](../W3-identity-kit).

Rule I'm holding to: **the work is shown with real captures, never an AI stand-in.**
AI is allowed only for connective tissue (a hero texture, icons), and only if it
stays out of the way.

## Image list (matched to the content map)

| # | Where | Image | Kind | Call |
|---|-------|-------|------|------|
| 1 | Home hero | Faint terminal-window texture behind the claim | **AI (generated)** | Connective tissue only; must not read as a screenshot or compete with the real captures below. |
| 2 | Work · Case 1 | `flyrank list` / `show` in a real terminal | **Real capture** | It's the proof. Cropped to the prompt + output, legible. |
| 3 | Work · Case 1 | `flyrank submit` showing the **303** response | **Real capture** | The single most load-bearing image on the site — the claim's punchline, verifiable. |
| 4 | Work · Case 2 | `curl` against BE-01 → 2xx JSON (`/hello`, `/time`) | **Real capture** | Shows the endpoint answering, not described. |
| 5 | Work · Case 3 | `docker compose up` + data-survives-restart proof | **Real capture** | Persistence proven on screen (named volume), not claimed. |
| 6 | About | Headshot | **Real photo** | The subject is me → a real photo, per the rule below. |
| 7 | Global | Favicon / monogram | **Vector (hand-made)** | `mg` in the heading font — see [../W3-identity-kit/favicon.svg](../W3-identity-kit/favicon.svg). Not AI. |

Most images are real captures of real work. Exactly one AI image (the hero texture)
and it's deliberately the quietest thing on the page.

## Where each call was made (and why)

- **Real capture — anything that is the work (2–5).** These *are* the evidence for
  my claim. An AI mock of a terminal would be the exact lie the claim is supposed to
  disprove. Non-negotiable: real runs, cropped clean, text legible.
- **Real photo — anything that is me (6).** The subject is a person, so it's a
  photograph, not a generated face.
- **AI — connective tissue only (1).** The hero background is texture, not
  information. Generated so it can match the kit's mood exactly; kept low-contrast
  so it never out-shouts capture #3 right on top of it.
- **Vector, hand-made — the mark (7).** My initials in my own type; making it by
  hand is trivial and keeps the identity coherent (favicon == H1 font).

## Consistent style for the generated set (a set, not a pile)

Only one AI image ships, but I generated it as a *held style* so future connective
tissue (icons, section dividers) can join the same set:

> **Style prompt (held steady across iterations):** "Subtle monochrome terminal
> texture — faint scanline grid, deep slate-blue `#1F3A5F` on near-white `#FBFBF9`,
> low contrast, no text, no UI chrome, flat, calm, lots of negative space. Editorial
> background, not an illustration."

I iterated the *subject* (grid density, vignette) while keeping color, contrast, and
flatness pinned, so every generated asset reads as the same material — matching the
"terminal at rest" mood from the identity kit.

## Rejection note (the graded discernment part)

**Rejected:** an AI "developer at a desk, glowing dual monitors, city skyline at
night" hero — the obvious generative-stock image.

**Why:** two failures at once. (1) It's a *person who isn't me* standing in for me —
exactly the AI-stand-in the brief forbids; if a face appears it has to be my real
photo. (2) It's loud, saturated, and generic — it would out-shout the one image that
matters (the real `303` capture) and say "smart person, various skills," which is
the summary my whole positioning is built to fail. Calm texture that frames the work
beats a hero that competes with it. Killed it; kept the faint terminal texture instead.

## Pass / revise — self-check

- **Images map to real needs; work shown with real captures, not AI stand-ins** →
  five of seven are real captures/photo; the work is never generated. ✓
- **Any AI images share one consistent style/mood** → one AI image, generated under
  a held style prompt so the set stays coherent. ✓
- **A real photo where the subject is the person** → headshot on `/about`. ✓
- **Rejection note shows genuine judgment** → rejected the generative-stock hero for
  two concrete reasons (fake stand-in + competes with the proof), not taste. ✓
