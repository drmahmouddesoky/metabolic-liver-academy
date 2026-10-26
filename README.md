# Metabolic Liver Academy (MLA)

Free, bilingual (English + Arabic) education on fatty liver disease (MASLD and MASH)
for patients and doctors. Founded by Dr. Mahmoud Al Desoky.

Live at: https://metabolicliveracademy.org/ (the old github.io address forwards here)

## How the site is built

- `src/*.html`: the page sources, with English and Arabic side by side.
- `content/learn.py`: the patient Q&A library (English + Arabic).
- `content/ref.py`: the doctors' reference library (English + Arabic).
- `content/modules.py`: teaching modules (textbook-chapter pages with graded recommendations, figures, a case and a quiz).
- `chrome.py`: the header, main menu and footer shared by every page (and the founder's name, `FOUNDER`).
- `src/_404.html`: the "page not found" page (built into `404.html`, English and Arabic together).
- `build.py`: turns these into the real pages.
  - English pages at the site root (e.g. `patients.html`, `learn/fibroscan.html`)
  - Arabic pages under `ar/` (e.g. `ar/patients.html`), so Google can find them in Arabic
  - `sitemap.xml` for search engines

Run `python3 build.py` after changing anything in `src/` or `content/`, then commit everything.
Do not edit the generated `*.html` files directly; they are overwritten by the build.

**News, events, videos and experts need no build.** Edit `data/news.js`, `data/lectures.js` or
`data/experts.js` on GitHub and commit.

`REVIEW.md` is the medical review checklist. `ASSETS.md` records where every image comes from and its licence; update it when you add an image.

`tests/test_fib4.py`, `tests/test_nfs.py` and `tests/test_calcs.py` check the calculators (known values and cut-off edges). Run them before changing a calculator. `tests/test_edges.py` checks that bad inputs (blank, zero, negative, text, extreme) are rejected safely.

Fonts are self-hosted in `fonts/` (IBM Plex, SIL Open Font License), so pages make no requests to Google.

| Source | Page |
| --- | --- |
| `src/index.html` | Home: two doors (patient / doctor), fibrosis scale, events, news, videos |
| `src/patients.html` | Patient Portal: plain guide, risk check, liver journey, questions, urgent care |
| `content/learn.py` | Patient Q&A: `learn.html` plus one page per question |
| `content/ref.py` | Doctors' reference: `ref.html` plus 11 topic pages |
| `src/academy.html` | Physician Portal: hubs, learning by role, FIB-4 and NFS calculators, lectures |
| `src/calculators.html` + `calc.js` | Calculator hub: Agile 3+, Agile 4, FAST, FibroScan explainer, FLI, HSI, HOMA-IR, BMI and waist-to-height (each with its original paper) |
| `src/guidance.html` | Fibrosis pathway, lifestyle, drugs, surgery, heart risk, special groups, sources |
| `src/guides.html` | Printable patient guides: plate, shopping, walking plan, Ramadan |
| `src/lectures.html` | Lectures: Arabic patient videos (play on the page) and professional talks |
| `src/experts.html`, `src/expert.html` | Meet the Expert: expert cards with filters, and one interview page per expert (from `data/experts.js`) |
| `src/radar.html` | Publication Radar: daily PubMed papers (Global and MENA) |
| `src/news.html` | News and events with filters |
| `src/about.html` | Mission, founder, publications |
| `src/partners.html` | Partners and independence (no partners yet) |
| `src/contact.html` | Contact: email and LinkedIn only |
| `src/legal.html` | Disclaimer, privacy, conflicts of interest, editorial policy, terms |

## Posting news or an event (the file you will use most)

1. On GitHub, open `data/news.js` and click the pencil icon.
2. Copy the example block at the top (between `{` and `},`).
3. Paste it below the line `window.MLA_NEWS = [`.
4. Fill in the values. Keep the "quotes" and the comma after `}`.
   - `type`: `"health"` (health news), `"events"` (conferences, webinars) or `"mine"` (Academy activities)
   - `date`: `"2026-11-14"` (year-month-day)
   - For events, add `time` (Riyadh time) and `gmt`.
5. Click **Commit changes**. The site updates in a minute or two.

Copyright rule: never paste a whole article. Write two or three sentences in your
own words and link to the source.

## Adding an expert (Meet the Expert)

1. On GitHub, open `data/experts.js` and click the pencil icon.
2. Copy one whole sample block (from `{` to `},`) and paste it below the line `window.MLA_EXPERTS = [`.
3. Fill in the values (the top of the file explains each one). Keep the "quotes".
4. Delete the line `sample: true`.
5. Set `approved: true` only when you hold the expert's **written** approval of their bio,
   photo and interview. Without it, the entry is never shown.
6. For a photo, upload it to `images/experts/` (square, about 600 x 600) and put its path in `photo`.
7. Click **Commit changes**. The expert appears on Meet the Expert in a minute or two, with a page
   at `expert.html?id=...`. If you add a `session` date, it also shows on the home page until that day.

Delete the three sample blocks once you have real experts.

## Adding a video or talk

Open `data/lectures.js`. Videos need the YouTube id (the code after `watch?v=`).

## Writing in two languages

In `src/`, every piece of text is written twice, side by side:

```html
<span data-lang="en">English text</span><span data-lang="ar">النص العربي</span>
```

The build keeps only the English text in the English pages and only the Arabic text in the Arabic pages.

## Publication Radar (updates itself)

`radar.html` lists new MASLD / MASH and obesity papers from PubMed, with a Global tab and a MENA tab.

- A GitHub robot (`.github/workflows/radar.yml`) runs every day at 06:17 Riyadh time.
- It runs `scripts/radar_fetch.py`, which searches PubMed and rewrites `data/radar.js` (all papers)
  and `data/radar-recent.js` (the last 32 days, loaded first so the page opens fast; the full list
  loads only when a visitor picks 90 days or All).
- You never need to edit these files. To update now: GitHub > **Actions** > **Publication Radar** > **Run workflow**.
- To change the topics or the countries, edit the word lists at the top of `scripts/radar_fetch.py`.
- Visitors' browsers never contact PubMed; they only read `data/radar.js`.

## Privacy

The tools run only in the visitor's browser. Nothing they type is stored or sent.
There is no tracking and no cookies. Pages load nothing from other websites,
except the private visit counter below.

## Private visit counter (only you see the numbers)

The site counts visits with GoatCounter (free, no cookies, no personal data,
so no cookie banner is needed). The numbers appear only on your own dashboard,
https://drmahmouddesoky.goatcounter.com, never on the site. It is switched on
(`var GOATCOUNTER = 'drmahmouddesoky';` in `main.js`).

How it was set up:

1. Signed up at https://www.goatcounter.com with the site code `drmahmouddesoky`.
2. Keep "Allow public access to the dashboard" switched off in GoatCounter's settings.
3. In `main.js`, the code sits between the quotes: `var GOATCOUNTER = 'drmahmouddesoky';`.

To switch it off again, empty the quotes.

## Mailing list (beehiiv)

Every page has a "Stay in touch" strip above the footer with **Join our mailing list** and
**Contact us**. "Join our mailing list" opens the Academy's beehiiv page,
`https://metabolic-liver-academy.beehiiv.com/subscribe` (set in `main.js`). If that line is
emptied, the button falls back to an email to
the Academy with "Subscribe" in the subject.

To connect beehiiv (free plan; past issues also become public web pages):
1. Sign up at https://www.beehiiv.com and create a publication called "Metabolic Liver Academy".
2. In **Settings**, switch on **double opt-in** (people confirm by email), and switch **off**
   any ad network, "Boosts" or recommendations, so no adverts appear in Academy emails.
3. Copy your publication's subscribe page link (it looks like
   `https://<your-name>.beehiiv.com/subscribe`).
4. On GitHub, open `main.js`, find `var NEWSLETTER_URL = '';` and paste the link between the quotes.
   Click **Commit changes**. Every "Join our mailing list" button now opens your subscribe page.

To send a newsletter: **Start writing** in beehiiv. Keep each email short, link to the site,
write Arabic and English as separate sections, and never include patient details.

## Menu, dark mode, share pictures and the app

- The header, side menu and footer are written into every page by `build.py`, from `chrome.py`.
  On computers the menu sits down the left side (right side in Arabic); on phones the menu button slides it in.
  To change a menu item, edit `MENU` in `chrome.py` and run `python3 build.py`.
- `main.js` makes the menu, dark mode switch, share buttons and "Install app" button work.
- Dark mode follows the visitor's phone or computer; the moon/sun button switches it and is remembered.
- Share pictures (shown on WhatsApp, LinkedIn, X): `images/og-en.png`, `images/og-ar.png` and one per
  main page in `images/og/`. To redraw them after changing a page title, see `scripts/make_share_images.js`.
- `manifest.webmanifest`, `sw.js` and `icons/` make the site installable on phones. `sw.js` always loads the newest pages when online and keeps the last copy for offline use.

## Changing the founder's name

Edit `FOUNDER` at the top of `chrome.py` (English and Arabic), run `python3 build.py`, and commit.
The name updates in the footer, page records and search-engine data. The About page text
(`src/about.html`) is edited by hand.

## Your domain (done)

The site lives at https://metabolicliveracademy.org/ (bought on Cloudflare, hosted free on GitHub Pages).

- The `CNAME` file holds the domain. Do not delete it.
- `build.py` has `SITE = "https://metabolicliveracademy.org/"`. Every page address, the sitemap,
  `robots.txt` and share pictures come from this line.
- The DNS records (four `A` records and a `www` `CNAME`) are set in Cloudflare. Leave them as they are.
- GitHub sends visitors from the old github.io address to the new domain, so old links keep working.
  Your personal page at drmahmouddesoky.github.io is not affected.
- Google Search Console: the sitemap to submit is https://metabolicliveracademy.org/sitemap.xml.
