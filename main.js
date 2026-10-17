/* ============================================================
   Metabolic Liver Academy – shared script
   - Builds the header and footer on every page
   - English / Arabic switch (remembers the choice in this browser)
   - News list, video list, risk checklist, FIB-4 calculator
   Nothing typed into the tools is sent anywhere or stored.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Language ----------
     Each page is built in one language: English pages at the site root,
     Arabic pages under /ar/. The page's own <html lang> decides. */
  var html = document.documentElement;
  if (html.lang !== 'ar') html.lang = 'en';
  html.dir = html.lang === 'ar' ? 'rtl' : 'ltr';
  /* Path from this page back to its language root ("" or "../") */
  var ROOT = document.body.getAttribute('data-root') || '';
  function twinUrl() {
    var l = document.querySelector('link[rel="alternate"][hreflang="' + (html.lang === 'ar' ? 'en' : 'ar') + '"]');
    return l ? l.getAttribute('href') : (html.lang === 'ar' ? ROOT + '../index.html' : ROOT + 'ar/index.html');
  }

  function t(en, ar) { return html.lang === 'ar' ? ar : en; }
  function bi(en, ar) {
    return '<span data-lang="en">' + en + '</span><span data-lang="ar">' + ar + '</span>';
  }

  /* ---------- Header + left side menu ----------
     Top bar: logo, language switch, menu button (phones and tablets).
     Side menu: groups that fold open, like the SGA platform.
     On wide screens it stays on the left (right in Arabic); on small
     screens it slides in when the menu button is pressed. */
  var page = document.body.getAttribute('data-page') || '';
  var segs = location.pathname.split('/');
  var file = (segs[segs.length - 1] || 'index.html').replace(/\.html$/, '');
  var dir = segs[segs.length - 2] || '';
  var here = dir === 'learn' ? 'learn' : dir === 'ref' ? 'ref' : dir === 'modules' ? 'modules' : (file === 'index' ? 'home' : file);

  function icon(d) {
    return '<svg class="side-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }
  var I = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    steth: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
    radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12l6-6"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/>',
    chev: '<path d="M9 6l6 6-6 6"/>'
  };
  /* [key, link, English, Arabic] — key marks the page you are on */
  var menu = [
    { key: 'home', href: 'index.html', ico: 'home', en: 'Home', ar: 'الرئيسية' },
    { ico: 'heart', en: 'For patients', ar: 'للمرضى', items: [
      ['patients', 'patients.html', 'Patient Portal', 'بوابة المرضى'],
      ['', 'patients.html#risk', 'Check your risk', 'افحص خطرك'],
      ['learn', 'learn.html', 'Questions & answers', 'أسئلة وأجوبة'],
      ['guides', 'guides.html', 'Printable guides', 'أدلة للطباعة']
    ] },
    { ico: 'steth', en: 'For doctors', ar: 'للأطباء', items: [
      ['academy', 'academy.html', 'Physician Portal', 'بوابة الأطباء'],
      ['modules', 'academy.html#modules', 'Teaching modules', 'الوحدات التعليمية'],
      ['', 'academy.html#fib4', 'Calculators (FIB-4, NFS)', 'الحاسبات (FIB-4 و NFS)'],
      ['guidance', 'guidance.html', 'Guidance', 'الإرشادات'],
      ['ref', 'ref.html', 'Reference library', 'المكتبة المرجعية']
    ] },
    { key: 'radar', href: 'radar.html', ico: 'radar', en: 'Publication Radar', ar: 'رادار الأبحاث' },
    { key: 'news', href: 'news.html', ico: 'cal', en: 'News & Events', ar: 'الأخبار والفعاليات' },
    { key: 'about', href: 'about.html', ico: 'info', en: 'About', ar: 'من نحن' },
    { key: 'legal', href: 'legal.html', ico: 'shield', en: 'Policies', ar: 'السياسات' }
  ];
  function cur(key) { return key && key === here ? ' aria-current="page"' : ''; }
  var sideHtml = menu.map(function (m, gi) {
    if (!m.items) {
      return '<a class="side-link" href="' + ROOT + m.href + '"' + cur(m.key) + '>' + icon(I[m.ico]) + '<span>' + t(m.en, m.ar) + '</span></a>';
    }
    var open = m.items.some(function (it) { return it[0] && it[0] === here; });
    return '<div class="side-group' + (open ? ' open' : '') + '">' +
      '<button type="button" class="side-link side-toggle" aria-expanded="' + open + '" aria-controls="side-g' + gi + '">' +
        icon(I[m.ico]) + '<span>' + t(m.en, m.ar) + '</span>' + icon(I.chev).replace('side-ico', 'side-chev') + '</button>' +
      '<div class="side-sub" id="side-g' + gi + '">' +
        m.items.map(function (it) {
          return '<a href="' + ROOT + it[1] + '"' + cur(it[0]) + '>' + t(it[2], it[3]) + '</a>';
        }).join('') +
      '</div></div>';
  }).join('');

  var mark = '<svg class="brand-mark" viewBox="0 0 34 34" aria-hidden="true">' +
    '<rect x="1" y="5" width="5.2" height="24" rx="2.6" fill="#3E9C7B"/>' +
    '<rect x="7.7" y="5" width="5.2" height="24" rx="2.6" fill="#94B95A"/>' +
    '<rect x="14.4" y="5" width="5.2" height="24" rx="2.6" fill="#E0B43C"/>' +
    '<rect x="21.1" y="5" width="5.2" height="24" rx="2.6" fill="#D97B3A"/>' +
    '<rect x="27.8" y="5" width="5.2" height="24" rx="2.6" fill="#A3423E"/></svg>';

  var header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML =
    '<a class="skip" href="#main">' + t('Skip to content', 'انتقل إلى المحتوى') + '</a>' +
    '<div class="bar">' +
      '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="side-nav" aria-label="' + t('Open menu', 'افتح القائمة') + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>' +
      '<a class="brand" href="' + ROOT + 'index.html">' + mark +
        '<span>' + t('Metabolic Liver Academy', 'أكاديمية الكبد الأيضي') +
        '<small>' + t('Healthy Liver. Healthy Life.', 'كبد سليم. حياة صحية.') + '</small></span></a>' +
      '<a class="lang-btn" href="' + twinUrl() + '" hreflang="' + (html.lang === 'ar' ? 'en' : 'ar') + '" lang="' + (html.lang === 'ar' ? 'en' : 'ar') + '">' + (html.lang === 'ar' ? 'English' : 'العربية') + '</a>' +
    '</div>';
  document.body.insertBefore(header, document.body.firstChild);

  var side = document.createElement('nav');
  side.className = 'side-nav';
  side.id = 'side-nav';
  side.setAttribute('aria-label', t('Main', 'القائمة الرئيسية'));
  side.innerHTML = sideHtml;
  header.parentNode.insertBefore(side, header.nextSibling);
  var shade = document.createElement('div');
  shade.className = 'side-shade';
  side.parentNode.insertBefore(shade, side.nextSibling);
  document.body.classList.add('has-side');

  Array.prototype.forEach.call(side.querySelectorAll('.side-toggle'), function (b) {
    b.addEventListener('click', function () {
      var g = b.parentNode, open = !g.classList.contains('open');
      g.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open);
    });
  });
  var menuBtn = header.querySelector('.menu-btn');
  function setMenu(open) {
    document.body.classList.toggle('side-open', open);
    menuBtn.setAttribute('aria-expanded', open);
  }
  menuBtn.addEventListener('click', function () { setMenu(!document.body.classList.contains('side-open')); });
  shade.addEventListener('click', function () { setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  side.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  /* ---------- Footer ---------- */
  var footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML =
    '<div class="wrap"><div class="foot-grid">' +
      '<div><p><strong>' + bi('Metabolic Liver Academy', 'أكاديمية الكبد الأيضي') + '</strong></p>' +
        '<p class="note">' + bi(
          'Education only. This site does not give medical advice, diagnosis or treatment. Always talk to your own doctor about your health. In an emergency, call your local emergency number.',
          'هذا الموقع للتثقيف فقط، ولا يقدّم استشارة طبية أو تشخيصًا أو علاجًا. تحدّث دائمًا مع طبيبك عن صحتك. في الحالات الطارئة اتصل برقم الطوارئ في بلدك.') + '</p></div>' +
      '<div><ul>' +
        '<li><a href="' + ROOT + 'legal.html#disclaimer">' + bi('Disclaimer', 'إخلاء المسؤولية') + '</a></li>' +
        '<li><a href="' + ROOT + 'legal.html#privacy">' + bi('Privacy', 'الخصوصية') + '</a></li>' +
        '<li><a href="' + ROOT + 'legal.html#conflicts">' + bi('Conflicts of interest', 'تضارب المصالح') + '</a></li>' +
        '<li><a href="' + ROOT + 'legal.html#governance">' + bi('How we review content', 'كيف نراجع المحتوى') + '</a></li>' +
        '<li><a href="' + ROOT + 'legal.html#terms">' + bi('Terms of use', 'شروط الاستخدام') + '</a></li>' +
      '</ul></div>' +
      '<div><ul>' +
        '<li><a href="mailto:mdesoky15@gmail.com">' + bi('Email', 'البريد الإلكتروني') + '</a></li>' +
        '<li><a href="https://www.linkedin.com/in/drmahmoudaldesoky" target="_blank" rel="noopener">LinkedIn</a></li>' +
        '<li><a href="https://www.youtube.com/channel/UCNzyfqdKJP9BDp35L8eNxGA" target="_blank" rel="noopener">YouTube</a></li>' +
        '<li><a href="https://orcid.org/0000-0002-1422-0886" target="_blank" rel="noopener">ORCID</a></li>' +
      '</ul></div>' +
    '</div>' +
    '<div class="bottom">© ' + new Date().getFullYear() + ' ' + bi('Metabolic Liver Academy (MLA). Founded by Dr. Mahmoud Desoky.', 'أكاديمية الكبد الأيضي. أسسها د. محمود الدسوقي.') + '</div></div>';
  document.body.appendChild(footer);

  /* ---------- Helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function parseDate(s) {
    var p = String(s).split('-');
    return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1);
  }
  function fmtDate(s, lang) {
    var parts = String(s).split('-');
    var opts = parts.length === 1 ? { year: 'numeric' } : parts.length === 2 ? { year: 'numeric', month: 'long' } : { year: 'numeric', month: 'short', day: 'numeric' };
    return parseDate(s).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', opts);
  }
  var TYPE_LABEL = {
    health: ['Health news', 'أخبار صحية'],
    events: ['Event', 'فعالية'],
    mine: ['My activities', 'أنشطتي']
  };

  /* ---------- News & events ---------- */
  function renderNews(box, opts) {
    var items = (window.MLA_NEWS || []).slice();
    var filter = opts.filter || 'all';
    if (filter !== 'all') items = items.filter(function (n) { return n.type === filter; });
    if (opts.upcomingOnly) {
      var today = new Date(); today.setHours(0, 0, 0, 0);
      items = items.filter(function (n) { return n.type === 'events' && parseDate(n.date) >= today; })
        .sort(function (a, b) { return parseDate(a.date) - parseDate(b.date); });
    } else {
      /* Future events live in the "Upcoming" list only */
      var now = new Date(); now.setHours(0, 0, 0, 0);
      items = items.filter(function (n) { return !(n.type === 'events' && parseDate(n.date) > now); });
      items.sort(function (a, b) { return parseDate(b.date) - parseDate(a.date); });
    }
    if (opts.limit) items = items.slice(0, opts.limit);
    if (!items.length) {
      box.innerHTML = '<p class="empty">' + (opts.upcomingOnly
        ? bi('No upcoming events are listed yet. New conferences and talks appear here as soon as they are added.', 'لا توجد فعاليات قادمة حتى الآن. ستظهر المؤتمرات والمحاضرات الجديدة هنا فور إضافتها.')
        : bi('Nothing in this section yet.', 'لا يوجد محتوى في هذا القسم بعد.')) + '</p>';
      return;
    }
    box.innerHTML = items.map(function (n) {
      var tl = TYPE_LABEL[n.type] || TYPE_LABEL.health;
      var link = n.link ? '<a href="' + esc(n.link) + '" target="_blank" rel="noopener">' + bi(n.linkLabel_en || 'Read the original', n.linkLabel_ar || 'اقرأ المصدر الأصلي') + '</a>' : '';
      var when = n.time ? '<span class="when-extra">' + bi(esc(n.time) + ' Riyadh time (' + esc(n.gmt || '') + ' GMT)', esc(n.time) + ' بتوقيت الرياض (' + esc(n.gmt || '') + ' غرينتش)') + '</span>' : '';
      var where = n.place_en ? '<span class="when-extra">' + bi(esc(n.place_en), esc(n.place_ar || n.place_en)) + '</span>' : '';
      return '<article class="post">' +
        '<div><time datetime="' + esc(n.date) + '">' + bi(fmtDate(n.date, 'en'), fmtDate(n.date, 'ar')) + '</time>' + when + where + '</div>' +
        '<div><span class="tag">' + bi(tl[0], tl[1]) + '</span>' +
        '<h3>' + bi(esc(n.title_en), esc(n.title_ar || n.title_en)) + '</h3>' +
        '<p>' + bi(esc(n.summary_en), esc(n.summary_ar || n.summary_en)) + '</p>' + link + '</div></article>';
    }).join('');
  }
  document.querySelectorAll('[data-news]').forEach(function (box) {
    var opts = { limit: +box.getAttribute('data-limit') || 0, upcomingOnly: box.hasAttribute('data-upcoming'), filter: 'all' };
    renderNews(box, opts);
    var bar = document.querySelector('[data-filters-for="' + box.id + '"]');
    if (bar) {
      bar.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        opts.filter = b.getAttribute('data-filter');
        renderNews(box, opts);
      });
    }
  });

  /* ---------- Videos ---------- */
  document.querySelectorAll('[data-videos]').forEach(function (box) {
    var list = (window.MLA_VIDEOS || []).slice(0, +box.getAttribute('data-limit') || 99);
    box.innerHTML = list.map(function (v) {
      return '<a class="video" href="https://www.youtube.com/watch?v=' + esc(v.id) + '" target="_blank" rel="noopener" lang="ar" dir="rtl">' +
        '<span class="video-thumb" aria-hidden="true"><svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="23" fill="currentColor"/><path d="M19 15l15 9-15 9z" fill="#fff"/></svg><em>' + esc(v.length) + '</em></span>' +
        '<div><strong>' + esc(v.title) + '</strong><small>' + esc(v.length) + ' · ' + esc(v.year) + '</small></div></a>';
    }).join('');
  });
  document.querySelectorAll('[data-talks]').forEach(function (box) {
    var list = (window.MLA_TALKS || []).slice().sort(function (a, b) { return parseDate(b.date) - parseDate(a.date); });
    if (!list.length) { box.innerHTML = '<p class="empty">' + bi('Talks will be listed here.', 'ستظهر المحاضرات هنا.') + '</p>'; return; }
    box.innerHTML = list.map(function (x) {
      return '<article class="post"><div><time>' + bi(fmtDate(x.date, 'en'), fmtDate(x.date, 'ar')) + '</time></div><div>' +
        '<h3>' + esc(x.title) + '</h3><p class="muted">' + esc(x.event) + '</p>' +
        (x.link ? '<a href="' + esc(x.link) + '" target="_blank" rel="noopener">' + esc(x.linkLabel || 'Open') + '</a>' : '') +
        '</div></article>';
    }).join('');
  });

  /* ---------- Consent gate for tools ---------- */
  document.querySelectorAll('[data-consent]').forEach(function (cb) {
    var target = document.getElementById(cb.getAttribute('data-consent'));
    function sync() { target.disabled = !cb.checked; }
    cb.addEventListener('change', sync);
    sync();
  });

  /* ---------- Risk checklist (no score, no storage) ---------- */
  var checklist = document.getElementById('risk-form');
  if (checklist) {
    checklist.addEventListener('submit', function (e) {
      e.preventDefault();
      var out = document.getElementById('risk-result');
      var names = ['weight', 'sugar', 'pressure', 'fats'];
      var answered = names.every(function (n) { return checklist.querySelector('input[name="' + n + '"]:checked'); });
      if (!answered) {
        out.hidden = false; out.className = 'result';
        out.innerHTML = '<p class="error">' + bi('Please answer all four questions.', 'يرجى الإجابة عن الأسئلة الأربعة.') + '</p>';
        out.focus();
        return;
      }
      var yes = names.filter(function (n) { return checklist.querySelector('input[name="' + n + '"]:checked').value === 'yes'; }).length;
      var alcohol = (checklist.querySelector('input[name="alcohol"]:checked') || {}).value === 'yes';
      var html2;
      if (yes > 0) {
        out.className = 'result mid';
        html2 = '<h3>' + bi('You may be at higher risk of fatty liver.', 'قد تكون أكثر عرضة لمرض الكبد الدهني.') + '</h3>' +
          '<p>' + bi('You have ' + yes + ' of the common risk factors. Ask your doctor about a liver check. It often starts with a simple blood-test score called FIB-4.',
            'لديك ' + yes + ' من عوامل الخطر الشائعة. اسأل طبيبك عن فحص الكبد. غالبًا يبدأ بحساب بسيط من تحليل الدم اسمه FIB-4.') + '</p>';
      } else {
        out.className = 'result low';
        html2 = '<h3>' + bi('Your answers do not show the common risk factors.', 'إجاباتك لا تُظهر عوامل الخطر الشائعة.') + '</h3>' +
          '<p>' + bi('Keep up healthy habits. If you have symptoms or worries, talk to your doctor.', 'حافظ على عاداتك الصحية. إذا كانت لديك أعراض أو مخاوف، تحدّث مع طبيبك.') + '</p>';
      }
      if (alcohol) {
        html2 += '<p>' + bi('You said you drink alcohol regularly. Tell your doctor, because alcohol and metabolic risk together can harm the liver faster.',
          'ذكرت أنك تتناول الكحول بانتظام. أخبر طبيبك، لأن اجتماع الكحول مع عوامل الخطر الأيضية قد يضرّ الكبد أسرع.') + '</p>';
      }
      html2 += '<p class="fine">' + bi('This is an education tool, not a diagnosis. It does not replace your doctor.', 'هذه أداة تثقيفية وليست تشخيصًا، ولا تُغني عن طبيبك.') + '</p>';
      out.hidden = false;
      out.innerHTML = html2;
      out.focus();
    });
  }

  /* ---------- FIB-4 calculator (for clinicians) ----------
     FIB-4 = (age × AST) / (platelets × √ALT)
     Rule-out < 1.30 (use < 2.0 from age 65); rule-in >= 2.67.
     Not validated under age 35. */
  var fib = document.getElementById('fib4-form');
  if (fib) {
    fib.addEventListener('submit', function (e) {
      e.preventDefault();
      var out = document.getElementById('fib4-result');
      function num(id) { var v = parseFloat(String(document.getElementById(id).value).replace(',', '.')); return isFinite(v) ? v : NaN; }
      var age = num('f-age'), ast = num('f-ast'), alt = num('f-alt'), plt = num('f-plt');
      var bad = [];
      if (!(age >= 18 && age <= 100)) bad.push(t('age (18 to 100 years)', 'العمر (18 إلى 100 سنة)'));
      if (!(ast > 0 && ast < 5000)) bad.push('AST');
      if (!(alt > 0 && alt < 5000)) bad.push('ALT');
      if (!(plt > 0 && plt < 2000)) bad.push(t('platelets (×10⁹/L)', 'الصفائح (×10⁹/لتر)'));
      out.hidden = false;
      if (bad.length) {
        out.className = 'result';
        out.innerHTML = '<p class="error">' + t('Check these values: ', 'راجع هذه القيم: ') + esc(bad.join(t(', ', '، '))) + '</p>';
        out.focus();
        return;
      }
      var score = (age * ast) / (plt * Math.sqrt(alt));
      var low = age >= 65 ? 2.0 : 1.3;
      var cls, head, body;
      if (score < low) {
        cls = 'low';
        head = t('Low risk of advanced fibrosis', 'خطر منخفض للتليف المتقدّم');
        body = t('Advanced fibrosis is unlikely. Manage metabolic risk and repeat FIB-4 in 1 to 3 years.',
          'التليف المتقدّم غير مرجّح. عالج عوامل الخطر الأيضية وأعد حساب FIB-4 خلال سنة إلى ثلاث سنوات.');
      } else if (score >= 2.67) {
        cls = 'high';
        head = t('High risk of advanced fibrosis', 'خطر مرتفع للتليف المتقدّم');
        body = t('Refer to a liver specialist. Confirm with elastography.',
          'أحِل المريض إلى أخصائي الكبد، وأكّد النتيجة بفحص قياس مرونة الكبد.');
      } else {
        cls = 'mid';
        head = t('Indeterminate', 'نتيجة غير حاسمة');
        body = t('Second-line test needed: transient elastography (e.g. FibroScan) or ELF.',
          'يلزم فحص من الخط الثاني: قياس مرونة الكبد العابر (مثل فيبروسكان) أو اختبار ELF.');
      }
      var notes = [];
      if (age < 35) notes.push(t('FIB-4 is not reliable under age 35. Interpret with care.', 'مؤشر FIB-4 غير موثوق تحت سن 35. فسّر النتيجة بحذر.'));
      if (ast > 200 || alt > 200) notes.push(t('AST or ALT is very high. Acute liver injury can make FIB-4 misleading; repeat when stable.', 'قيمة AST أو ALT مرتفعة جدًا. قد تجعل إصابة الكبد الحادة FIB-4 مضلّلًا، فأعد الحساب عند الاستقرار.'));
      if (age >= 65) notes.push(t('Age 65 or over: lower cut-off of 2.0 used.', 'العمر 65 سنة أو أكثر: استُخدم الحد الأدنى 2.0.'));
      out.className = 'result ' + cls;
      out.innerHTML = '<div class="score">' + score.toFixed(2) + '</div>' +
        '<h3>' + head + '</h3><p>' + body + '</p>' +
        notes.map(function (n) { return '<p>' + n + '</p>'; }).join('') +
        '<p class="fine">' + t('Cut-offs: below ' + low.toFixed(1) + ' low, 2.67 and above high. Supports, but never replaces, clinical judgement. Nothing you type is stored or sent. <a href="' + ROOT + 'ref/fib4-method.html">Method and limits</a>',
          'الحدود: أقل من ' + low.toFixed(1) + ' منخفض، و2.67 فأكثر مرتفع. أداة مساعدة لا تغني أبدًا عن التقييم السريري. لا يُحفظ أو يُرسل أي شيء تكتبه. <a href="' + ROOT + 'ref/fib4-method.html">الطريقة والحدود</a>') + '</p>';
      out.focus();
    });
  }

  /* ---------- NFS calculator (for clinicians) ----------
     NFS = -1.675 + 0.037*age + 0.094*BMI + 1.13*IFG/DM + 0.99*AST/ALT - 0.013*platelets - 0.66*albumin(g/dL)
     Rule-out < -1.455 (use < 0.12 from age 65); rule-in > 0.676.
  */
  var nf = document.getElementById('nfs-form');
  if (nf) {
    nf.addEventListener('submit', function (e) {
      e.preventDefault();
      var out = document.getElementById('nfs-result');
      function num(id) { var v = parseFloat(String(document.getElementById(id).value).replace(',', '.')); return isFinite(v) ? v : NaN; }
      var age = num('n-age'), wt = num('n-wt'), ht = num('n-ht'), ast = num('n-ast'), alt = num('n-alt'), plt = num('n-plt'), alb = num('n-alb');
      var dm = document.getElementById('n-dm').value;
      var unit = document.getElementById('n-alb-unit').value;
      var bad = [];
      if (!(age >= 18 && age <= 100)) bad.push(t('age (18 to 100 years)', 'العمر (18 إلى 100 سنة)'));
      if (!(wt >= 25 && wt <= 350)) bad.push(t('weight (kg)', 'الوزن (كغ)'));
      if (!(ht >= 120 && ht <= 230)) bad.push(t('height (cm)', 'الطول (سم)'));
      if (dm !== '0' && dm !== '1') bad.push(t('diabetes (yes or no)', 'السكري (نعم أو لا)'));
      if (!(ast > 0 && ast < 5000)) bad.push('AST');
      if (!(alt > 0 && alt < 5000)) bad.push('ALT');
      if (!(plt > 0 && plt < 2000)) bad.push(t('platelets (×10⁹/L)', 'الصفائح (×10⁹/لتر)'));
      var albDl = unit === 'gL' ? alb / 10 : alb;
      if (!(albDl >= 1 && albDl <= 7)) bad.push(t('albumin (check the unit)', 'الألبومين (راجع الوحدة)'));
      out.hidden = false;
      if (bad.length) {
        out.className = 'result';
        out.innerHTML = '<p class="error">' + t('Check these values: ', 'راجع هذه القيم: ') + esc(bad.join(t(', ', '، '))) + '</p>';
        out.focus();
        return;
      }
      var bmi = wt / Math.pow(ht / 100, 2);
      var score = -1.675 + 0.037 * age + 0.094 * bmi + 1.13 * (+dm) + 0.99 * (ast / alt) - 0.013 * plt - 0.66 * albDl;
      var low = age >= 65 ? 0.12 : -1.455;
      var cls, head, body;
      if (score < low) {
        cls = 'low';
        head = t('Low risk of advanced fibrosis', 'خطر منخفض للتليف المتقدّم');
        body = t('Advanced fibrosis is unlikely. Manage metabolic risk and repeat a fibrosis score in 1 to 3 years.',
          'التليف المتقدّم غير مرجّح. عالج عوامل الخطر الأيضية وأعد حساب مؤشر التليّف خلال سنة إلى ثلاث سنوات.');
      } else if (score > 0.676) {
        cls = 'high';
        head = t('High risk of advanced fibrosis', 'خطر مرتفع للتليف المتقدّم');
        body = t('Refer to a liver specialist. Confirm with elastography.',
          'أحِل المريض إلى أخصائي الكبد، وأكّد النتيجة بفحص قياس مرونة الكبد.');
      } else {
        cls = 'mid';
        head = t('Indeterminate', 'نتيجة غير حاسمة');
        body = t('Second-line test needed: transient elastography (e.g. FibroScan) or ELF.',
          'يلزم فحص من الخط الثاني: قياس مرونة الكبد العابر (مثل فيبروسكان) أو اختبار ELF.');
      }
      var notes = [t('BMI used: ' + bmi.toFixed(1) + ' kg/m².', 'مؤشر كتلة الجسم المستخدم: ' + bmi.toFixed(1) + ' كغ/م².')];
      if (age < 35) notes.push(t('NFS is not reliable under age 35. Interpret with care.', 'مؤشر NFS غير موثوق تحت سن 35. فسّر النتيجة بحذر.'));
      if (age >= 65) notes.push(t('Age 65 or over: lower cut-off of 0.12 used.', 'العمر 65 سنة أو أكثر: استُخدم الحد الأدنى 0.12.'));
      if (bmi >= 35 || dm === '1') notes.push(t('Severe obesity or diabetes raises NFS; a high score may overestimate risk. Confirm with a second-line test.', 'السمنة الشديدة أو السكري ترفع NFS، وقد تبالغ النتيجة المرتفعة في تقدير الخطر. أكّدها بفحص من الخط الثاني.'));
      out.className = 'result ' + cls;
      out.innerHTML = '<div class="score">' + score.toFixed(2) + '</div>' +
        '<h3>' + head + '</h3><p>' + body + '</p>' +
        notes.map(function (n) { return '<p>' + n + '</p>'; }).join('') +
        '<p class="fine">' + t('Cut-offs: below ' + low + ' low, above 0.676 high. Supports, but never replaces, clinical judgement. Nothing you type is stored or sent. <a href="' + ROOT + 'ref/nfs-method.html">Method and limits</a>',
          'الحدود: أقل من ' + low + ' منخفض، وأعلى من 0.676 مرتفع. أداة مساعدة لا تغني أبدًا عن التقييم السريري. لا يُحفظ أو يُرسل أي شيء تكتبه. <a href="' + ROOT + 'ref/nfs-method.html">الطريقة والحدود</a>') + '</p>';
      out.focus();
    });
  }

  /* ---------- Module self-test (nothing stored) ---------- */
  document.querySelectorAll('.mcq').forEach(function (box) {
    var ans = +box.getAttribute('data-answer');
    box.querySelectorAll('.opt').forEach(function (b) {
      b.addEventListener('click', function () {
        box.querySelectorAll('.opt').forEach(function (x) {
          x.classList.remove('right', 'wrong');
          if (+x.getAttribute('data-i') === ans) x.classList.add('right');
        });
        if (+b.getAttribute('data-i') !== ans) b.classList.add('wrong');
        b.setAttribute('aria-pressed', 'true');
        var why = box.querySelector('.why');
        why.hidden = false;
        var mark = +b.getAttribute('data-i') === ans ? t('Correct. ', 'إجابة صحيحة. ') : t('Not quite. ', 'ليست الإجابة الصحيحة. ');
        if (!why.getAttribute('data-orig')) why.setAttribute('data-orig', why.innerHTML);
        why.innerHTML = '<strong>' + mark + '</strong>' + why.getAttribute('data-orig');
      });
    });
  });

  /* ---------- Module contents: highlight the section in view ---------- */
  var tocLinks = document.querySelectorAll('.mod-toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          tocLinks.forEach(function (a) { a.classList.remove('on'); });
          map[en.target.id].classList.add('on');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }
})();
