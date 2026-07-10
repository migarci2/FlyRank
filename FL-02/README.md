# FL-02 — Prompting Fundamentals on Real Tasks v2

Assignment: *Prompting Fundamentals on Real Tasks v2* (General AI Fluency, Week 2)
Author: Miguel Garcia Roman

**Target task (from [FL-01](../FL-01), task #1):** *Given a page/HTTP traffic from
an undocumented web app, identify an endpoint's contract — method, URL, required
fields, and auth — accurately enough that a script hits it and gets a 2xx.*

This is the exact task behind the FlyRank CLI, so I could check every answer
against ground truth I already had.

---

## Naive prompt (pre-track)

```
How do I find the API for this website?
```
**Output:** generic advice — "open DevTools, check the Network tab, look for XHR
requests." True but useless for *this* app, which has no REST API at all (it uses
Next.js Server Actions). The naive prompt got a naive, un-grounded answer.

## V1 — technique: **role assignment**

```
You are an API archaeologist who reverse-engineers undocumented web apps by
reading their network traffic. How do I find the API for this site?
```
- **Output difference:** the role made it stop giving beginner DevTools steps and
  start naming real artifacts — RSC/flight payloads, `Next-Action` headers, action
  ids. The role pulled in the right vocabulary. Still generic to "a site," not mine.

## V2 — technique: **context and motivation**

```
[role as above]
Context: the app is Next.js on Vercel, login is Auth.js (LinkedIn), and there is no
public REST API — mutations go through Server Actions. I want to submit a form from
a CLI. Motivation: the action id changes each deploy, so I need something that
won't break.
```
- **Output difference:** with the real stack, it correctly predicted the submit
  path is a POST to the page URL with a `$ACTION_ID_...` field, and — because I
  gave it the *motivation* (survive deploys) — it recommended scraping the action
  id from the live page instead of hard-coding. That's the exact decision the real
  CLI uses. Context is what made it *right*, not just plausible.

## V3 — technique: **output structure**

```
[above]
Return the contract as: METHOD | URL | required form fields | how auth is carried |
how the action id is obtained. Nothing else.
```
- **Output difference:** turned a paragraph into a checklist I could act on and
  verify field-by-field. It exposed a gap — it hadn't said *where* auth lived; the
  structure forced it to fill in "session cookie `__Secure-authjs.session-token`."

## V4 — technique: **step decomposition**

```
[above]
Walk it step by step: (1) how to confirm there's no REST API, (2) how to find the
submit action on the page, (3) how to identify required fields, (4) how to carry
auth, (5) how to verify with one request. Do the steps in order.
```
- **Output difference:** the ordering caught an error the flat version made. In V3
  it assumed a `Next-Action` *header*; decomposed into "verify with one request,"
  it correctly noted the **no-JS form path** (the `$ACTION_ID_` field name) is the
  robust one for a CLI. Step decomposition surfaced the more reliable mechanism.

## V5 — technique: **few-shot example**

```
[above]
Example of a finished contract (different app):
  METHOD: POST
  URL: /intern/assignments/<CODE>
  fields: $ACTION_ID_<hex> (marker), program_item_id, deliverable_urls, notes
  auth: Cookie __Secure-authjs.session-token
  action id: scraped from the hidden input on the assignment page each run
Now produce the same contract for the target endpoint.
```
- **Output difference:** the example locked the format and the *precision level*.
  Outputs stopped hand-waving ("some kind of token") and matched the shape exactly.
  One caveat: with the example present, the model tended to **echo the example's
  field names** even when asked about a different endpoint — few-shot anchors hard,
  so the example has to be close to the target or it biases the answer.

---

## Final prompt, run on two models (real runs)

**Final prompt:** V4's decomposition + V3's output structure + V1 role + V2 context,
given the same evidence (the observed `<form>` snippet) to both models. Ground truth
was known — I'd already built the working CLI — so I could grade accuracy, not vibes.

**GPT-5.5** (run via the Codex CLI):

```
POST | inferred - verify: /intern/assignments/FL-02 (form action absent) |
inferred - verify: $ACTION_ID_403289...c723, program_item_id=FL-02,
return_path=/intern/assignments/FL-02, deliverable_urls, notes, attachments;
multipart/form-data | Cookie: __Secure-authjs.session-token=<token> |
One POST to the verified form URL; inspect response/status. Deploy-proof: fetch the
page and extract the current $ACTION_ID_* before each submission; no REST API
appears in the provided evidence.
```

**Claude:**

```
METHOD: POST
URL: /intern/assignments/FL-02 — form has method=POST and no action, so a no-JS
     submit posts to the current page URL (Next.js MPA Server Action). Verify.
required fields: $ACTION_ID_...c723 (name is the action marker, empty value),
     program_item_id=FL-02, return_path=/intern/assignments/FL-02,
     deliverable_urls, notes, attachments (optional); multipart/form-data
auth: Cookie __Secure-authjs.session-token (Auth.js). Plus: Server Actions require
     the Origin header to match Host (built-in CSRF check) — inferred, verify.
verification: one multipart POST with cookie + Origin header; success = 303 to
     return_path. Deploy-proof: scrape the $ACTION_ID hash from the page each run.
```

**Honest comparison (not "both were fine"):**

- **Accuracy:** both got the core contract right and — notably — **neither
  hallucinated a REST endpoint.** GPT-5.5 explicitly stated "no REST API appears in
  the provided evidence." (I expected the classic confident-fabrication failure and
  did not get it; that's the value of actually running it instead of assuming.)
- **Discipline vs. completeness:** GPT was more *literal* about the "mark inferred"
  rule — it flagged even the URL as `inferred - verify` because the form's `action`
  attribute was empty. Claude *committed* to the URL with the reasoning (the Next.js
  no-action convention) but still said verify. GPT errs cautious; Claude errs toward
  committing-with-justification.
- **The decisive difference — two details only Claude gave, both operationally
  required:** (1) the **Origin-header CSRF check** Next.js enforces on Server
  Actions — miss it and the POST is rejected; my real CLI sets it. (2) **success =
  HTTP 303**, the concrete signal to check. GPT's "inspect response/status" is
  correct but wouldn't have told me *what* to look for.
- **Tone/structure:** GPT packed it into one dense line (great for a machine,
  harder to read); Claude used the labeled structure and was easier to scan.

**Takeaway:** for this task GPT-5.5 is accurate and admirably disciplined about not
overclaiming — the "invents endpoints" reputation didn't hold on a real run. But
Claude surfaced the two things that make the request *actually succeed* (Origin
header, 303). I'd take Claude's answer to implement from, and keep GPT's literal
"mark everything inferred until a request confirms it" as the verification mindset.

---

## Reusable template (works without my context)

```
You are an API archaeologist reverse-engineering an undocumented web app from its
own traffic.

Context: <stack / framework / auth / what you already observed>.
Motivation: <why you need it, and any constraint like "must survive deploys">.

Do it step by step, in order:
1. Confirm whether a documented/REST API exists at all.
2. Locate the specific request that performs <the action>.
3. Identify required fields and their source.
4. Identify how auth is carried.
5. State how to verify with exactly one request.

Rule: never state an endpoint or field as fact unless it appears in the observed
traffic. Mark anything inferred as "inferred — verify."

Return only:
METHOD | URL | required fields | auth mechanism | verification request
```

Swap the `<...>` and it applies to any undocumented endpoint on any stack — the
"mark inferred, verify with one request" rule is what keeps either model honest.
