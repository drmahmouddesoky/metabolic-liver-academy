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

  /* ---------- Header ---------- */
  var page = document.body.getAttribute('data-page') || '';
  var nav = [
    ['patients', 'patients.html', 'Patients', 'المرضى'],
    ['learn', 'learn.html', 'Q&A', 'أسئلة وأجوبة'],
    ['academy', 'academy.html', 'Academy', 'الأكاديمية'],
    ['guidance', 'guidance.html', 'Guidance', 'الإرشادات'],
    ['news', 'news.html', 'News & Events', 'الأخبار والفعاليات'],
    ['about', 'about.html', 'About', 'من نحن']
  ];
  var mark = '<svg class="brand-mark" viewBox="0 0 34 34" aria-hidden="true">' +
    '<rect x="1" y="5" width="5.2" height="24" rx="2.6" fill="#3E9C7B"/>' +
    '<rect x="7.7" y="5" width="5.2" height="24" rx="2.6" fill="#94B95A"/>' +
    '<rect x="14.4" y="5" width="5.2" height="24" rx="2.6" fill="#E0B43C"/>' +
    '<rect x="21.1" y="5" width="5.2" height="24" rx="2.6" fill="#D97B3A"/>' +
    '<rect x="27.8" y="5" width="5.2" height="24" rx="2.6" fill="#A3423E"/></svg>';

  var header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML =
    '<a class="skip" href="#main">' + bi('Skip to content', 'انتقل إلى المحتوى') + '</a>' +
    '<div class="wrap">' +
      '<a class="brand" href="' + ROOT + 'index.html">' + mark +
        '<span>' + bi('Metabolic Liver Academy', 'أكاديمية الكبد الأيضي') +
        '<small>' + bi('Healthy Liver. Healthy Life.', 'كبد سليم. حياة صحية.') + '</small></span></a>' +
      '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">' + bi('Menu', 'القائمة') + '</button>' +
      '<nav class="nav" id="site-nav" aria-label="Main">' +
        nav.map(function (n) {
          return '<a href="' + ROOT + n[1] + '"' + (n[0] === page ? ' aria-current="page"' : '') + '>' + bi(n[2], n[3]) + '</a>';
        }).join('') +
        '<a class="lang-btn" href="' + twinUrl() + '" hreflang="' + (html.lang === 'ar' ? 'en' : 'ar') + '" lang="' + (html.lang === 'ar' ? 'en' : 'ar') + '">' + (html.lang === 'ar' ? 'English' : 'العربية') + '</a>' +
      '</nav>' +
    '</div>';
  document.body.insertBefore(header, document.body.firstChild);

  var menuBtn = header.querySelector('.menu-btn');
  menuBtn.addEventListener('click', function () {
    var open = !header.classList.contains('open');
    header.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
  });

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
        '<li><a href="' + ROOT + 'legal.html#editorial">' + bi('How we review content', 'كيف نراجع المحتوى') + '</a></li>' +
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
        '<img src="https://i.ytimg.com/vi/' + esc(v.id) + '/hqdefault.jpg" alt="" loading="lazy" width="480" height="270">' +
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
     Rule-out < 1.30 (use < 2.0 from age 65); rule-in > 2.67.
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
      } else if (score > 2.67) {
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
      if (age >= 65) notes.push(t('Age 65 or over: lower cut-off of 2.0 used.', 'العمر 65 سنة أو أكثر: استُخدم الحد الأدنى 2.0.'));
      out.className = 'result ' + cls;
      out.innerHTML = '<div class="score">' + score.toFixed(2) + '</div>' +
        '<h3>' + head + '</h3><p>' + body + '</p>' +
        notes.map(function (n) { return '<p>' + n + '</p>'; }).join('') +
        '<p class="fine">' + t('Cut-offs: below ' + low.toFixed(1) + ' low, 2.67 and above high. Supports, but never replaces, clinical judgement. Nothing you type is stored or sent.',
          'الحدود: أقل من ' + low.toFixed(1) + ' منخفض، و2.67 فأكثر مرتفع. أداة مساعدة لا تغني أبدًا عن التقييم السريري. لا يُحفظ أو يُرسل أي شيء تكتبه.') + '</p>';
      out.focus();
    });
  }
})();
