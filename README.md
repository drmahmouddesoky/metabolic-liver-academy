# Metabolic Liver Academy (MLA)

Free, bilingual (English + Arabic) education on fatty liver disease (MASLD and MASH)
for patients and doctors. Founded by Dr. Mahmoud Desoky.

Live at: https://drmahmouddesoky.github.io/metabolic-liver-academy/

## How the site is built

- `src/*.html`: the page sources, with English and Arabic side by side.
- `content/learn.py`: the patient Q&A library (English + Arabic).
- `content/ref.py`: the doctors' reference library (English + Arabic).
- `build.py`: turns these into the real pages.
  - English pages at the site root (e.g. `patients.html`, `learn/fibroscan.html`)
  - Arabic pages under `ar/` (e.g. `ar/patients.html`), so Google can find them in Arabic
  - `sitemap.xml` for search engines

Run `python3 build.py` after changing anything in `src/` or `content/`, then commit everything.
Do not edit the generated `*.html` files directly; they are overwritten by the build.

**News, events and videos need no build.** Edit `data/news.js` or `data/lectures.js` on GitHub and commit.

`REVIEW.md` is the medical review checklist.

`tests/test_fib4.py` checks the FIB-4 calculator (known values and cut-off edges). Run it before changing the calculator.

Fonts are self-hosted in `fonts/` (IBM Plex, SIL Open Font License), so pages make no requests to Google.

| Source | Page |
| --- | --- |
| `src/index.html` | Home: two doors (patient / doctor), fibrosis scale, events, news, videos |
| `src/patients.html` | Plain guide, risk check, liver journey, questions, urgent care |
| `content/learn.py` | Patient Q&A: `learn.html` plus one page per question |
| `content/ref.py` | Doctors' reference: `ref.html` plus 11 topic pages |
| `src/academy.html` | For doctors: hubs, learning by role, FIB-4 calculator, lectures |
| `src/guidance.html` | Fibrosis pathway, lifestyle, drugs, surgery, heart risk, special groups, sources |
| `src/guides.html` | Printable patient guides: plate, shopping, walking plan, Ramadan |
| `src/news.html` | News and events with filters |
| `src/about.html` | Founder, mission, publications, partners |
| `src/legal.html` | Disclaimer, privacy, conflicts of interest, editorial policy, terms |

## Posting news or an event (the file you will use most)

1. On GitHub, open `data/news.js` and click the pencil icon.
2. Copy the example block at the top (between `{` and `},`).
3. Paste it below the line `window.MLA_NEWS = [`.
4. Fill in the values. Keep the "quotes" and the comma after `}`.
   - `type`: `"health"`, `"events"` or `"mine"`
   - `date`: `"2026-11-14"` (year-month-day)
   - For events, add `time` (Riyadh time) and `gmt`.
5. Click **Commit changes**. The site updates in a minute or two.

Copyright rule: never paste a whole article. Write two or three sentences in your
own words and link to the source.

## Adding a video or talk

Open `data/lectures.js`. Videos need the YouTube id (the code after `watch?v=`).

## Writing in two languages

In `src/`, every piece of text is written twice, side by side:

```html
<span data-lang="en">English text</span><span data-lang="ar">النص العربي</span>
```

The build keeps only the English text in the English pages and only the Arabic text in the Arabic pages.

## Privacy

The tools run only in the visitor's browser. Nothing they type is stored or sent.
There is no tracking and no analytics, and pages load nothing from other websites.
