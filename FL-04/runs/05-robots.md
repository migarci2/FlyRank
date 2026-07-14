# Study notes — robots.txt / Robots Exclusion Protocol (RFC 9309)

_FL-04 pipeline · Codex (gpt-5.5) runner · synthesize→draft→review · wall-clock 265s · source: src-robots.txt_

## Unsupported claims

- [UNSUPPORTED] “Each group has … one or more `Allow` or `Disallow` rules.” The final group may contain no rules.
- [UNSUPPORTED] “A `5xx` response requires complete disallow … until 30 days have elapsed.” Thirty days is only an example of a reasonably long period, after which crawlers may treat the file as unavailable or continue using a cached copy.
- [UNSUPPORTED] “Tie-breaking … is not covered.” The RFC says an equivalent `Allow` rule should take precedence over `Disallow`.
- [UNSUPPORTED] “No contradiction is stated.” This is not traceable to the citation.

## FINAL notes

### Problem

The Robots Exclusion Protocol defines how crawlers discover and interpret `/robots.txt` rules controlling access to server resources. [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html)

### Core concepts

- Rules are organized into groups. A group has one or more `User-agent` lines followed by `Allow` or `Disallow` rules; the final group may contain no rules.
- The file must be UTF-8 encoded, use the `text/plain` media type, and be located at the lowercase, top-level path `/robots.txt`.
- User-agent matching is case-insensitive. Matching groups are combined. `*` is the fallback when no specific group matches. If neither a specific user-agent nor `*` matches, no rules apply.
- The matching rule with the most octets wins. Path matching should be case-sensitive. If no rule matches, access is allowed.
- `#` begins a comment, `$` marks the end of a pattern, and `*` matches zero or more characters.
- If equivalent `Allow` and `Disallow` rules match, the `Allow` rule should be used.

[RFC 9309, Sections 2.1–2.3](https://www.rfc-editor.org/rfc/rfc9309.html#section-2)

### Minimal example

```text
User-agent: *
Disallow: /private
```

Because no more-specific user-agent group exists, this group tells all crawlers not to access paths beginning with `/private`. Unmatched URIs remain allowed. [RFC 9309, Section 2.2](https://www.rfc-editor.org/rfc/rfc9309.html#section-2.2)

### Gotchas

- All groups matching the same user-agent are combined.
- For a `4xx` response, a crawler may access any resource on the server.
- For a `5xx` response or network error, a crawler must initially assume complete disallow. If the file remains unreachable for a reasonably long period—for example, 30 days—the crawler may treat it as unavailable or continue using a cached copy.
- Cached contents should not normally be used for more than 24 hours unless the file is unreachable.
- A crawler’s parsing limit must be at least 500 KiB.

[RFC 9309, Sections 2.3–2.5](https://www.rfc-editor.org/rfc/rfc9309.html#section-2.3)
