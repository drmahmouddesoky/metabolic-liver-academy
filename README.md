# Metabolic Liver Academy (MLA)

Free, bilingual (English + Arabic) education on fatty liver disease (MASLD and MASH)
for patients and doctors. Founded by Dr. Mahmoud Desoky.

Live at: https://drmahmouddesoky.github.io/metabolic-liver-academy/

## The pages

| File | Page |
| --- | --- |
| `index.html` | Home: two doors (patient / doctor), fibrosis scale, events, news, videos |
| `patients.html` | Plain guide, risk check, liver journey, questions, urgent care |
| `academy.html` | For doctors: hubs, learning by role, FIB-4 calculator, lectures |
| `guidance.html` | Fibrosis pathway, topics, how we review evidence |
| `news.html` | News and events with filters |
| `about.html` | Founder, mission, publications, partners |
| `legal.html` | Disclaimer, privacy, conflicts of interest, editorial policy, terms |

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

Every piece of text is written twice, side by side:

```html
<span data-lang="en">English text</span><span data-lang="ar">النص العربي</span>
```

The site shows only the language the visitor picks.

## Privacy

The tools run only in the visitor's browser. Nothing they type is stored or sent.
There is no tracking and no analytics.
