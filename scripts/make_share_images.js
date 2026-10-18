/* Makes the share pictures (1200 x 630) shown when a page is shared on
   WhatsApp, LinkedIn, X or Telegram: images/og-en.png, images/og-ar.png
   and one per main page in images/og/.

   You only need this if you change a page title or add a main page.
   It needs Node.js and Playwright, and the site served locally:
     python3 -m http.server 8765          (in the repository folder)
     npm install playwright
     node scripts/make_share_images.js
   Then run python3 build.py (it uses a page's picture when one exists). */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BASE = 'http://127.0.0.1:8765/';

/* page file: [English title, Arabic title] */
const PAGES = {
  patients: ['Patient Portal', 'بوابة المرضى'],
  learn: ['Questions and answers about fatty liver', 'أسئلة وأجوبة عن الكبد الدهني'],
  guides: ['Printable guides for patients', 'أدلة للمرضى قابلة للطباعة'],
  academy: ['Physician Portal', 'بوابة الأطباء'],
  ref: ['Reference library for doctors', 'المكتبة المرجعية للأطباء'],
  guidance: ['MASLD guidance for clinicians', 'إرشادات MASLD للأطباء'],
  calculators: ['MASLD calculators for clinicians', 'حاسبات MASLD للأطباء'],
  lectures: ['Lectures', 'المحاضرات'],
  experts: ['Meet the Expert', 'لقاء مع خبير'],
  radar: ['Publication Radar', 'رادار الأبحاث'],
  news: ['News and events', 'الأخبار والفعاليات'],
  about: ['About the Academy', 'عن الأكاديمية'],
  partners: ['Partners and independence', 'الشركاء والاستقلالية'],
  contact: ['Contact us', 'تواصل معنا']
};
const HOME = ['Fatty liver is common, silent, and treatable when found early.', 'الكبد الدهني شائع وصامت، ويمكن علاجه إذا اكتُشف مبكرًا.'];

const mark = fs.readFileSync(path.join(ROOT, 'favicon.svg'), 'utf8');
function html(lang, title) {
  const ar = lang === 'ar';
  return `<!doctype html><html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8">
<link rel="stylesheet" href="${BASE}fonts/fonts.css"><style>
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#F4F7F6;font-family:'IBM Plex Sans','IBM Plex Sans Arabic',sans-serif;color:#0F2B2C;display:flex;flex-direction:column;justify-content:space-between;padding:72px 84px;position:relative;overflow:hidden}
.bar{position:absolute;inset:auto 0 0 0;height:14px;display:flex}.bar i{flex:1}
.top{display:flex;align-items:center;gap:22px}.top svg{width:84px;height:84px}
.name{font-size:${ar ? 44 : 40}px;font-weight:600;color:#155E5C;line-height:1.2}
h1{font-size:${ar ? 64 : 66}px;font-weight:600;line-height:${ar ? 1.35 : 1.12};max-width:960px;letter-spacing:${ar ? 0 : -0.5}px}
p{font-size:30px;color:#526567;line-height:1.4}
</style></head><body>
<div class="top">${mark}<div class="name">${ar ? 'أكاديمية الكبد والتمثيل الغذائي' : 'Metabolic Liver Academy'}</div></div>
<h1>${title}</h1>
<p>${ar ? 'تثقيف مجاني عن الكبد الدهني (MASLD) للمرضى والأطباء · العربية والإنجليزية' : 'Free MASLD education for patients and doctors · Arabic and English'}</p>
<div class="bar"><i style="background:#3E9C7B"></i><i style="background:#94B95A"></i><i style="background:#E0B43C"></i><i style="background:#D97B3A"></i><i style="background:#A3423E"></i></div>
</body></html>`;
}

(async () => {
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto(BASE + 'legal.html');   /* same address as the fonts, so they load */
  async function shot(lang, title, file) {
    await p.setContent(html(lang, title), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(ROOT, file) });
  }
  for (const lang of ['en', 'ar']) {
    await shot(lang, HOME[lang === 'ar' ? 1 : 0], `images/og-${lang}.png`);
    for (const [name, t] of Object.entries(PAGES)) await shot(lang, t[lang === 'ar' ? 1 : 0], `images/og/${name}-${lang}.png`);
  }
  await b.close();
  console.log('Share images written.');
})();
