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

## Final prompt, run on two models

**Final prompt:** V4's decomposition + V3's output structure + V1 role + V2 context,
with the V5 example included but explicitly marked "for format only, do not reuse
its field names."

**Claude:** cautious and verification-first. It refused to state the auth field as
fact until the "verify with one request" step, and flagged *which* claims it was
inferring vs. reading. Tone: dry, hedged where it should be. Failure point: slightly
over-explained the RSC background I didn't ask for.

**ChatGPT (GPT):** more decisive and better formatted out of the box — clean table,
confident contract. Failure point: that confidence cut both ways — it **invented a
plausible `/api/submit` REST endpoint** that doesn't exist, exactly the kind of
hallucination that's dangerous here because it *looks* right. It only self-corrected
when I added "confirm the endpoint exists in the traffic before stating it."

**Specific takeaway (not "both were fine"):** for reverse-engineering, Claude's
hedging is a feature — it maps cleanly to "don't trust a field until a real request
returns 2xx." GPT gets me a cleaner artifact faster but needs an explicit
"don't invent endpoints; cite the traffic" guard or it will confidently fabricate
one. I'd draft with GPT, verify with Claude.

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
