/* ============================================================
   Metabolic Liver Academy – shared script
   - Makes the menu, dark mode and language switch work (they are built by build.py)
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

  function t(en, ar) { return html.lang === 'ar' ? ar : en; }
  function bi(en, ar) {
    return '<span data-lang="en">' + en + '</span><span data-lang="ar">' + ar + '</span>';
  }

  /* ---------- Header and main menu ----------
     The header, menu and footer are written into every page by build.py
     (see chrome.py). This script only makes them interactive:
     - phones and tablets: the menu button slides the menu in
     - desktop: Patients / Physicians / About open their short lists
     - the moon/sun button switches dark mode (remembered in this browser) */
  var nav = document.getElementById('site-nav');
  var menuBtn = document.querySelector('.menu-btn');
  var shade = document.querySelector('.nav-shade');
  function setMenu(open) {
    document.body.classList.toggle('nav-open', open);
    if (menuBtn) menuBtn.setAttribute('aria-expanded', open);
    if (shade) shade.hidden = !open;
  }
  function closeSubs(except) {
    if (!nav) return;
    Array.prototype.forEach.call(nav.querySelectorAll('.nav-toggle[aria-expanded="true"]'), function (b) {
      if (b !== except) b.setAttribute('aria-expanded', 'false');
    });
  }
  if (nav && menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(!document.body.classList.contains('nav-open')); });
    if (shade) shade.addEventListener('click', function () { setMenu(false); });
    var closeBtn = nav.querySelector('.nav-close');
    if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); menuBtn.focus(); });
    menuBtn.addEventListener('click', function () {
      if (document.body.classList.contains('nav-open') && closeBtn) closeBtn.focus();
    });
    Array.prototype.forEach.call(nav.querySelectorAll('.nav-toggle'), function (b) {
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') !== 'true';
        closeSubs(b);
        b.setAttribute('aria-expanded', open);
      });
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) { setMenu(false); closeSubs(); } });
    document.addEventListener('click', function (e) { if (!e.target.closest('.nav-item.has-sub')) closeSubs(); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = nav.querySelector('.nav-toggle[aria-expanded="true"]');
      closeSubs();
      if (open) open.focus();
      setMenu(false);
    });
  }

  /* Dark mode. The page's <head> applies a saved choice before it paints;
     with no saved choice the site follows the phone or computer setting. */
  var themeBtn = document.querySelector('.theme-btn');
  function isDark() {
    var t = html.getAttribute('data-theme');
    return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  if (themeBtn) {
    themeBtn.setAttribute('aria-pressed', isDark());
    themeBtn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      themeBtn.setAttribute('aria-pressed', next === 'dark');
      try { localStorage.setItem('mla-theme', next); } catch (e) { /* private mode: not remembered */ }
    });
  }

  var yr = document.querySelector('.site-footer .year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Share buttons (Q&A cards and pages) ----------
     Uses the phone's own share sheet when there is one; otherwise
     shows WhatsApp, X, LinkedIn, Telegram and copy-link options. */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.share-btn');
    if (!b) return;
    e.preventDefault();
    var url = new URL(b.getAttribute('data-share'), location.href).href;
    var title = b.getAttribute('data-title-' + html.lang) || document.title;
    if (navigator.share) { navigator.share({ title: title, url: url }).catch(function () {}); return; }
    var old = document.querySelector('.share-pop');
    if (old) { old.remove(); if (old._for === b) return; }
    var u = encodeURIComponent(url), tt = encodeURIComponent(title);
    var pop = document.createElement('div');
    pop.className = 'share-pop';
    pop._for = b;
    pop.innerHTML =
      '<a target="_blank" rel="noopener" href="https://wa.me/?text=' + tt + '%20' + u + '">WhatsApp</a>' +
      '<a target="_blank" rel="noopener" href="https://x.com/intent/post?text=' + tt + '&url=' + u + '">X</a>' +
      '<a target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=' + u + '">LinkedIn</a>' +
      '<a target="_blank" rel="noopener" href="https://t.me/share/url?url=' + u + '&text=' + tt + '">Telegram</a>' +
      '<button type="button" class="share-copy">' + t('Copy link', 'نسخ الرابط') + '</button>';
    b.insertAdjacentElement('afterend', pop);
    pop.querySelector('.share-copy').addEventListener('click', function () {
      var btn = this;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () {
        btn.textContent = t('Link copied', 'تم نسخ الرابط');
      }, function () { window.prompt(t('Copy this link', 'انسخ هذا الرابط'), url); });
    });
  });

  /* ---------- Private visit counter (GoatCounter) ----------
     Counts page views with no cookies and no personal data. The numbers
     are visible only on the founder's GoatCounter dashboard, never on
     the site. To switch it on, put your GoatCounter site code between
     the quotes, e.g. 'mla' for https://mla.goatcounter.com.
     Leave it empty ('') to switch it off. */
  var GOATCOUNTER = 'drmahmouddesoky';
  var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1';
  if (GOATCOUNTER && !dnt && location.protocol === 'https:') {
    var gc = document.createElement('script');
    gc.async = true;
    gc.src = 'https://gc.zgo.at/count.js';
    gc.setAttribute('data-goatcounter', 'https://' + GOATCOUNTER + '.goatcounter.com/count');
    document.body.appendChild(gc);
  }

  /* ---------- Install as an app ----------
     Android and desktop Chrome/Edge: the browser's own install prompt.
     iPhone/iPad Safari: a short tip (Share, then Add to Home Screen). */
  var siteRoot = ROOT + (html.lang === 'ar' ? '../' : '');
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register(siteRoot + 'sw.js').catch(function () {});
  }
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var inst = document.querySelector('.side-install') || document.createElement('div');
  inst.hidden = true;
  inst.innerHTML = '<button type="button" class="install-btn"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>' +
    t('Install app', 'ثبّت التطبيق') + '</button>' +
    '<p class="install-tip" hidden>' + t('On iPhone or iPad: tap the Share button, then "Add to Home Screen".', 'على iPhone أو iPad: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية».') + '</p>';
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; inst.hidden = false; });
  window.addEventListener('appinstalled', function () { inst.hidden = true; });
  if (!standalone && ios) inst.hidden = false;
  inst.querySelector('.install-btn').addEventListener('click', function () {
    if (deferred) { deferred.prompt(); deferred.userChoice.then(function () { deferred = null; inst.hidden = true; }); }
    else inst.querySelector('.install-tip').hidden = false;
  });

  /* ---------- Helpers ---------- */
  /* Add schema.org data for search engines (used for videos and experts). */
  function addLd(items) {
    if (!items || !items.length) return;
    var sc = document.createElement('script');
    sc.type = 'application/ld+json';
    sc.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': items });
    document.head.appendChild(sc);
  }
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
    mine: ['Academy activities', 'أنشطة الأكاديمية']
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

  /* ---------- Videos ----------
     Home and Physician Portal: cards that open the video on YouTube.
     Lectures page (data-embed): the video plays on the page, but only
     after the visitor presses play (nothing loads from YouTube before). */
  var PLAY = '<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="currentColor"/><path d="M19 15l15 9-15 9z" fill="#fff"/></svg>';
  document.querySelectorAll('[data-videos]').forEach(function (box) {
    var list = (window.MLA_VIDEOS || []).slice(0, +box.getAttribute('data-limit') || 99);
    var embed = box.hasAttribute('data-embed');
    box.innerHTML = list.map(function (v) {
      var info = '<div><strong>' + esc(v.title) + '</strong><small>' + esc(v.length) + ' · ' + esc(v.year) + '</small></div>';
      if (embed) {
        return '<div class="video" lang="ar" dir="rtl"><button type="button" class="video-thumb video-play" data-id="' + esc(v.id) + '" data-title="' + esc(v.title) + '">' +
          PLAY + '<em>' + esc(v.length) + '</em><span class="visually-hidden">' + t('Play video: ', 'شغّل المقطع: ') + esc(v.title) + '</span></button>' + info + '</div>';
      }
      return '<a class="video" href="https://www.youtube.com/watch?v=' + esc(v.id) + '" target="_blank" rel="noopener" lang="ar" dir="rtl">' +
        '<span class="video-thumb" aria-hidden="true">' + PLAY + '<em>' + esc(v.length) + '</em></span>' + info + '</a>';
    }).join('');
    if (!embed) return;
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.video-play');
      if (!b) return;
      var f = document.createElement('iframe');
      f.className = 'video-frame';
      f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(b.getAttribute('data-id')) + '?autoplay=1&rel=0';
      f.title = b.getAttribute('data-title');
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      f.setAttribute('allowfullscreen', '');
      b.replaceWith(f);
      f.focus();
    });
    /* Search engines: describe each video (VideoObject) */
    addLd(list.map(function (v) {
      return { '@type': 'VideoObject', name: v.title, inLanguage: 'ar', uploadDate: String(v.year),
        thumbnailUrl: 'https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg',
        embedUrl: 'https://www.youtube-nocookie.com/embed/' + v.id,
        contentUrl: 'https://www.youtube.com/watch?v=' + v.id,
        description: v.title, publisher: { '@type': 'Organization', name: 'Metabolic Liver Academy' } };
    }));
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

  /* ---------- Meet the Expert ----------
     Everything comes from data/experts.js. An entry is shown only if it is
     a marked sample (sample: true) or the founder has the expert's written
     approval (approved: true). Samples never reach the home page or search
     engines. */
  var EXPERT_TOPICS = {
    'masld': ['MASLD', 'MASLD'],
    'mash-treatment': ['MASH treatment', 'علاج MASH'],
    'obesity': ['Obesity', 'السمنة'],
    'diabetes': ['Diabetes', 'السكري'],
    'nutrition': ['Nutrition', 'التغذية']
  };
  var EXPERT_AUD = { patients: ['For patients', 'للمرضى'], physicians: ['For physicians', 'للأطباء'] };
  var ASSET = html.lang === 'ar' ? '../' : '';   /* expert pages sit at the top of each language folder */
  var EXPERTS = (window.MLA_EXPERTS || []).filter(function (e) { return e && e.id && (e.sample === true || e.approved === true); });
  function xf(e, k) { return e[k + '_' + html.lang] || e[k + '_en'] || ''; }
  function xlist(e, k) { return e[k + '_' + html.lang] || e[k + '_en'] || []; }
  function initials(name) {
    var w = String(name).replace(/\(.*?\)/g, '').replace(/^(prof\.?|dr\.?|د\.|أ\.د\.)\s*/i, '').trim().split(/\s+/);
    return (w[0] || '').charAt(0) + (w.length > 1 ? w[w.length - 1].charAt(0) : '');
  }
  var PERSON_ICON = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="18" r="8" fill="currentColor" opacity=".55"/><path d="M8 42c2-9 9-13 16-13s14 4 16 13" fill="currentColor" opacity=".55"/></svg>';
  function expertPhoto(e, size) {
    if (e.photo) return '<img src="' + esc(ASSET + e.photo) + '" alt="" width="' + size + '" height="' + size + '" loading="lazy" decoding="async">';
    return e.sample ? PERSON_ICON : '<span aria-hidden="true">' + esc(initials(e.name_en || e.name_ar)) + '</span>';
  }
  var SAMPLE_BADGE = '<span class="sample-badge">' + t('Sample entry, not a real person', 'مثال، وليس شخصًا حقيقيًا') + '</span>';
  function expertTags(e) {
    return (e.topics || []).filter(function (k) { return EXPERT_TOPICS[k]; }).map(function (k) { return '<span class="chip">' + t(EXPERT_TOPICS[k][0], EXPERT_TOPICS[k][1]) + '</span>'; }).join('') +
      (e.audience || []).filter(function (k) { return EXPERT_AUD[k]; }).map(function (k) { return '<span class="chip c-aud">' + t(EXPERT_AUD[k][0], EXPERT_AUD[k][1]) + '</span>'; }).join('');
  }

  var exGrid = document.getElementById('ex-grid');
  if (exGrid) {
    var exState = { topic: '', aud: '' };
    var drawExperts = function () {
      var list = EXPERTS.filter(function (e) {
        return (!exState.topic || (e.topics || []).indexOf(exState.topic) > -1) && (!exState.aud || (e.audience || []).indexOf(exState.aud) > -1);
      });
      document.getElementById('ex-count').textContent = list.length
        ? t(list.length + (list.length === 1 ? ' interview' : ' interviews'), 'عدد اللقاءات: ' + list.length) : '';
      exGrid.innerHTML = list.length ? list.map(function (e) {
        return '<a class="expert-card' + (e.sample ? ' is-sample' : '') + '" href="expert.html?id=' + encodeURIComponent(e.id) + '">' +
          '<span class="ex-photo">' + expertPhoto(e, 96) + '</span><span class="ex-body">' +
          (e.sample ? SAMPLE_BADGE : '') +
          '<strong class="ex-name">' + esc(xf(e, 'name')) + '</strong>' +
          '<span class="ex-title">' + esc(xf(e, 'title')) + (xf(e, 'country') ? ' · ' + esc(xf(e, 'country')) : '') + '</span>' +
          '<span class="ex-topic">' + esc(xf(e, 'topic')) + '</span>' +
          '<span class="ex-tags">' + expertTags(e) + '</span></span></a>';
      }).join('') : '<p class="empty">' + t('No interviews match these filters yet.', 'لا توجد لقاءات تطابق هذا الاختيار بعد.') + '</p>';
    };
    ['ex-topic', 'ex-aud'].forEach(function (gid) {
      var g = document.getElementById(gid);
      g.addEventListener('click', function (ev) {
        var b = ev.target.closest('button'); if (!b) return;
        g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        exState[gid === 'ex-topic' ? 'topic' : 'aud'] = b.getAttribute('data-v');
        drawExperts();
      });
    });
    drawExperts();
  }

  var exPage = document.getElementById('expert-page');
  if (exPage) {
    var exId = new URLSearchParams(location.search).get('id');
    var ex = EXPERTS.filter(function (e) { return e.id === exId; })[0];
    if (!ex) {
      exPage.innerHTML = '<header class="page-head"><div class="wrap"><h1>' + t('We could not find this expert', 'لم نعثر على هذا الخبير') + '</h1>' +
        '<p><a href="experts.html">' + t('See all expert interviews', 'اطّلع على كل لقاءات الخبراء') + '</a></p></div></header>';
    } else {
      var name = xf(ex, 'name');
      var other = html.lang === 'ar' ? 'en' : 'ar';
      var langName = { en: t('English', 'الإنجليزية'), ar: t('Arabic', 'العربية') };
      var tk = xlist(ex, 'takeaways');
      var qa = ex.qa || [];
      var pubs = (ex.publications || []).filter(function (p) { return p && p.url; });
      var h = '<header class="page-head expert-head"><div class="wrap">' +
        '<nav class="crumbs small" aria-label="' + t('Breadcrumb', 'مسار التنقل') + '"><a href="experts.html">' + t('Meet the Expert', 'لقاء مع خبير') + '</a></nav>' +
        (ex.sample ? '<p class="sample-note" role="note">' + t('This is a sample page that shows the layout. It is not a real expert or a real interview.', 'هذه صفحة نموذجية لعرض التصميم، وليست لخبير حقيقي أو لقاء حقيقي.') + '</p>' : '') +
        '<div class="expert-hero"><span class="ex-photo big">' + expertPhoto(ex, 160) + '</span><div>' +
        '<p class="eyebrow">' + esc(xf(ex, 'topic')) + '</p>' +
        '<h1>' + esc(name) + '</h1>' +
        '<p class="ex-title">' + esc(xf(ex, 'title')) + (xf(ex, 'country') ? ' · ' + esc(xf(ex, 'country')) : '') + '</p>' +
        '<p class="ex-tags">' + expertTags(ex) + '</p></div></div></div></header>';
      h += '<section class="section"><div class="wrap read">';
      if (ex.video) {
        h += '<h2 class="h-small">' + t('The interview', 'اللقاء') + '</h2>' +
          '<div class="video expert-video"><button type="button" class="video-thumb video-play" data-id="' + esc(ex.video) + '" data-title="' + esc(name) + '">' + PLAY +
          '<span class="visually-hidden">' + t('Play the interview with ', 'شغّل اللقاء مع ') + esc(name) + '</span></button></div>' +
          '<p class="fine">' + t('Recorded in ', 'سُجّل باللغة ') + langName[ex.language || 'en'] + '. ' +
          t('The video loads from YouTube only when you press play.', 'لا يُحمَّل المقطع من يوتيوب إلا عند الضغط على التشغيل.') + '</p>';
      }
      if (tk.length) {
        h += '<div class="takeaways"><h2 class="h-small">' + t('Key takeaways', 'النقاط الأساسية') + '</h2><ul class="ticks">' +
          tk.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
      }
      if (qa.length) {
        h += '<h2>' + t('Questions and answers', 'أسئلة وأجوبة') + '</h2><dl class="expert-qa">' +
          qa.map(function (q) { return '<dt>' + esc(q['q_' + html.lang] || q.q_en) + '</dt><dd>' + esc(q['a_' + html.lang] || q.a_en) + '</dd>'; }).join('') + '</dl>';
      }
      var tr = ex['transcript_' + html.lang], trOther = ex['transcript_' + other];
      if (tr || trOther) {
        var trLabel = (ex.language || 'en') === html.lang ? t('Full transcript', 'النص الكامل')
          : t('English text of an interview recorded in ' + langName[ex.language], 'النص العربي للقاء سُجّل باللغة ' + langName[ex.language]);
        if (tr) h += '<details class="transcript" open><summary>' + trLabel + '</summary><div class="tr-text">' + esc(tr).replace(/\n/g, '<br>') + '</div></details>';
        if (trOther) h += '<details class="transcript" lang="' + other + '" dir="' + (other === 'ar' ? 'rtl' : 'ltr') + '"><summary>' +
          (other === 'ar' ? 'النص باللغة العربية' : 'Text in English') + '</summary><div class="tr-text">' + esc(trOther).replace(/\n/g, '<br>') + '</div></details>';
      }
      h += '<h2 class="h-small">' + t('About the expert', 'عن الخبير') + '</h2><p>' + esc(xf(ex, 'bio')) + '</p>';
      if (pubs.length || (ex.profile && ex.profile.url)) {
        h += '<ul class="ticks">' + pubs.map(function (p) { return '<li><a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.label || p.url) + '</a></li>'; }).join('') +
          (ex.profile && ex.profile.url ? '<li><a href="' + esc(ex.profile.url) + '" target="_blank" rel="noopener">' + esc(ex.profile.label || t('Professional profile', 'الملف المهني')) + '</a></li>' : '') + '</ul>';
      }
      h += '<aside class="record small" aria-label="' + t('Page record', 'سجل الصفحة') + '"><dl>' +
        (ex.recorded ? '<dt>' + t('Recorded', 'تاريخ التسجيل') + '</dt><dd>' + esc(fmtDate(ex.recorded, html.lang)) + '</dd>' : '') +
        (ex.reviewed ? '<dt>' + t('Last reviewed', 'آخر مراجعة') + '</dt><dd>' + esc(fmtDate(ex.reviewed, html.lang)) + '</dd>' : '') +
        '<dt>' + t('Disclosure', 'الإفصاح') + '</dt><dd>' + esc(xf(ex, 'disclosure') || t('No disclosure provided yet.', 'لم يُقدَّم إفصاح بعد.')) + '</dd></dl>' +
        '<p>' + t('Education only, not personal medical advice. The expert\'s views are their own. ', 'للتثقيف فقط، وليس استشارة طبية شخصية. الآراء الواردة تعبّر عن الخبير. ') +
        '<a href="experts.html">' + t('All expert interviews', 'كل لقاءات الخبراء') + '</a></p></aside>';
      h += '</div></section>';
      exPage.innerHTML = h;
      exPage.addEventListener('click', function (ev) {
        var b = ev.target.closest('.video-play'); if (!b) return;
        var f = document.createElement('iframe');
        f.className = 'video-frame';
        f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(b.getAttribute('data-id')) + '?autoplay=1&rel=0';
        f.title = b.getAttribute('data-title');
        f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
        f.setAttribute('allowfullscreen', '');
        b.replaceWith(f); f.focus();
      });
      document.title = name + ' | ' + t('Meet the Expert', 'لقاء مع خبير') + ' | ' + t('Metabolic Liver Academy', 'أكاديمية الكبد والتمثيل الغذائي');
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', xf(ex, 'topic') + ' – ' + name);
      if (ex.sample) {
        var nr = document.createElement('meta'); nr.name = 'robots'; nr.content = 'noindex'; document.head.appendChild(nr);
      } else {
        var person = { '@type': 'Person', name: ex.name_en, alternateName: ex.name_ar, jobTitle: ex.title_en,
          sameAs: pubs.map(function (p) { return p.url; }).concat(ex.profile && ex.profile.url ? [ex.profile.url] : []) };
        var ld = [person];
        if (ex.video) ld.push({ '@type': 'VideoObject', name: name + ': ' + xf(ex, 'topic'), description: xf(ex, 'topic'),
          uploadDate: ex.recorded || undefined, thumbnailUrl: 'https://i.ytimg.com/vi/' + ex.video + '/hqdefault.jpg',
          embedUrl: 'https://www.youtube-nocookie.com/embed/' + ex.video, inLanguage: ex.language || 'en',
          transcript: ex['transcript_' + (ex.language || 'en')] || undefined });
        addLd(ld);
      }
    }
  }

  /* Home page: upcoming live expert sessions (real, approved experts only) */
  document.querySelectorAll('[data-expert-sessions]').forEach(function (box) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var list = EXPERTS.filter(function (e) { return !e.sample && e.session && parseDate(e.session) >= today; })
      .sort(function (a, b) { return parseDate(a.session) - parseDate(b.session); }).slice(0, 3);
    if (!list.length) {
      box.innerHTML = '<p class="empty">' + t('New interviews with liver, metabolic and obesity experts are being prepared. Session dates will appear here and in ',
        'نُعدّ لقاءات جديدة مع خبراء في الكبد والأيض والسمنة. ستظهر مواعيد الجلسات هنا وفي ') +
        '<a href="news.html">' + t('News', 'الأخبار') + '</a>.</p>';
      return;
    }
    box.innerHTML = '<div class="session-strip">' + list.map(function (e) {
      return '<a class="session-card" href="expert.html?id=' + encodeURIComponent(e.id) + '"><time>' + bi(fmtDate(e.session, 'en'), fmtDate(e.session, 'ar')) + '</time>' +
        '<strong>' + esc(xf(e, 'name')) + '</strong><span class="muted small">' + esc(xf(e, 'topic')) + '</span></a>';
    }).join('') + '</div>';
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

  /* Read a number typed on any keyboard: accepts Arabic-Indic (٠-٩) and
     Persian (۰-۹) digits, and "," or "٫" as the decimal mark. */
  function toNum(raw) {
    var s = String(raw).trim()
      .replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 0x0660; })
      .replace(/[۰-۹]/g, function (d) { return d.charCodeAt(0) - 0x06F0; })
      .replace(/[٫,]/g, '.');
    var v = parseFloat(s);
    return isFinite(v) ? v : NaN;
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
      function num(id) { return toNum(document.getElementById(id).value); }
      var age = num('f-age'), ast = num('f-ast'), alt = num('f-alt'), plt = num('f-plt');
      var bad = [];
      if (!(age >= 18 && age <= 100)) bad.push(t('age (18 to 100 years)', 'العمر (18 إلى 100 سنة)'));
      if (!(ast > 0 && ast < 5000)) bad.push('AST');
      if (!(alt > 0 && alt < 5000)) bad.push('ALT');
      if (!(plt >= 10 && plt <= 1000)) bad.push(t('platelets (10 to 1000 ×10⁹/L)', 'الصفائح (10 إلى 1000 ×10⁹/لتر)'));
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
      function num(id) { return toNum(document.getElementById(id).value); }
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
      if (!(plt >= 10 && plt <= 1000)) bad.push(t('platelets (10 to 1000 ×10⁹/L)', 'الصفائح (10 إلى 1000 ×10⁹/لتر)'));
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
