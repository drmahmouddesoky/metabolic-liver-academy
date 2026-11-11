# Security policy

The Metabolic Liver Academy is a static, read-only website. It has no accounts,
no database, no server-side code and no forms that send data anywhere. Even so,
it is built and run to the standard of a site that handles health information.

## Reporting a problem

Email **info@metabolicliveracademy.org** with "Security" in the subject.
Please include the page address, what you did, and what you saw. We aim to
reply within 7 days and to fix confirmed problems promptly. Do not open a public
GitHub issue for a security problem until it is fixed.

Researchers can also find this address in
<https://metabolicliveracademy.org/.well-known/security.txt> (RFC 9116).

Please do not test against the site in a way that could disturb visitors
(no load testing, no scanning of GitHub's infrastructure).

## What is in place

| Measure | Where |
| --- | --- |
| **Content Security Policy** on every page: scripts and styles only from this site, with a cryptographic hash for the few inline pieces the build writes. Outside scripts, inline handlers (`onclick=`), `javascript:` links and `<object>`/`<embed>` are refused by the browser. | `build.py` (`csp_for`), checked by `tests/test_csp.py` on every pull request |
| **No third-party code runs on the pages.** Fonts are self-hosted. The visit counter is a single image request, not a script. Videos load from `youtube-nocookie.com` only after the visitor presses play. | `main.js`, `fonts/`, `legal.html#privacy` |
| **Referrer policy** `strict-origin-when-cross-origin`: outside sites never see which page a visitor came from. | `build.py` |
| **Frame-busting** so pages cannot be embedded in another site (clickjacking). GitHub Pages cannot send `X-Frame-Options`, so this runs in the page. | `main.js` |
| **Data files are treated as untrusted.** Everything from `data/*.js` is HTML-escaped before display; links must be `http(s)`, `mailto` or `tel`, or a path on this site; YouTube ids must look like ids. | `main.js` (`esc`, `safeUrl`, `ytId`) |
| **Calculators run only in the browser.** Nothing typed is stored or sent. Inputs are range-checked. | `calc.js`, `main.js`, `tests/test_edges.py` |
| **HTTPS enforced** by GitHub Pages (HSTS). The policy also carries `upgrade-insecure-requests`. | GitHub Pages settings, `build.py` |
| **Supply chain:** GitHub Actions are pinned to commit hashes, Python tools are pinned in `requirements-dev.txt`, Dependabot proposes updates, and the checks workflow has read-only permissions. The Radar workflow can write only two data files. | `.github/` |
| **Reproducible build:** CI rebuilds the site from `src/` and `content/` and fails if the committed pages differ. | `.github/workflows/checks.yml` |
| **Offline copy** (service worker) caches only this site's own files. | `sw.js` |

## Limits of a static host

GitHub Pages cannot send custom HTTP headers. That means:

- The Content Security Policy is delivered as a `<meta>` tag. Browsers honour it, but
  the `frame-ancestors` and `report-uri` directives only work as headers, so clickjacking
  protection relies on the frame-busting script above.
- `X-Content-Type-Options`, `Permissions-Policy` and `Cross-Origin-Opener-Policy` cannot be set.

If the domain is ever proxied through Cloudflare (orange cloud), these headers can be added
with a Cloudflare "Transform Rules" or "Response Header" rule at no cost:

```
Content-Security-Policy: (the same policy as the page) ; frame-ancestors 'none'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## Account hygiene (for the maintainer)

- Keep two-factor authentication on the GitHub account, the domain registrar, GoatCounter
  and beehiiv. Prefer a passkey or an authenticator app over SMS.
  Status: GitHub enabled 11 November 2026 (founder's confirmation). Cloudflare, GoatCounter and
  beehiiv: to be confirmed.
- Keep "Enforce HTTPS" switched on in the repository's Pages settings.
- Protect the `main` branch with a ruleset: block force pushes and branch deletion. If you also
  require the "Site checks" status before merging, give the Publication Radar workflow a bypass
  (its daily commit lands on `main` directly and does not run the checks), or the daily update will
  be refused. Done 11 November 2026: ruleset "Protect main" is active on the default branch with
  "Restrict deletions" and "Block force pushes" (verified through the GitHub API).
- Never commit secrets. The only secret the site uses, the optional `NCBI_API_KEY`, lives in
  the repository's Actions secrets.
- When adding a GitHub Action, pin it to a commit hash and let Dependabot update it.
