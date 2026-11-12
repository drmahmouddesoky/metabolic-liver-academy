/* ============================================================
   Metabolic Liver Academy – locked course modules
   Module 1 of each course is open. The other modules are published
   only in encrypted form (AES-256-GCM) in locked/<course>/. A learner's
   access code unlocks the course key inside the browser:
     PBKDF2-SHA256(code, course salt) -> 16-byte code id + 32-byte key
     that key opens the course key wrapped for this code (keys.json),
     and the course key opens the module (<slug>.<lang>.json).
   The code is never sent anywhere. Once accepted, the course key is
   kept in this browser (localStorage) so other modules open directly.
   Written by scripts/lock_modules.py; see README "Locked courses".
   ============================================================ */
(function () {
  'use strict';
  var root = document.getElementById('locked-root');
  if (!root) return;
  var html = document.documentElement;
  var lang = html.lang === 'ar' ? 'ar' : 'en';
  function t(en, ar) { return lang === 'ar' ? ar : en; }
  var series = root.getAttribute('data-series');
  var slug = root.getAttribute('data-slug');
  var base = (document.body.getAttribute('data-root') || '') + (lang === 'ar' ? '../' : '') + 'locked/' + series + '/';
  var STORE = 'mla-course-' + series;
  var form = document.getElementById('lock-form');
  var input = document.getElementById('lock-code');
  var msg = document.getElementById('lock-msg');
  var enc = new TextEncoder();
  var subtle = window.crypto && window.crypto.subtle;

  function b64d(s) { var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function b64e(a) { var s = ''; for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
  function say(text, bad) { msg.textContent = text; msg.classList.toggle('error', !!bad); }
  function store(k) { try { if (k) localStorage.setItem(STORE, k); else localStorage.removeItem(STORE); } catch (e) { /* private mode */ } }
  function stored() { try { return localStorage.getItem(STORE); } catch (e) { return null; } }
  function getJSON(url) {
    return fetch(url, { cache: 'no-cache', credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error('missing');
      return r.json();
    });
  }
  function gcmOpen(rawKey, packed, aad) {
    return subtle.importKey('raw', rawKey, 'AES-GCM', false, ['decrypt']).then(function (k) {
      return subtle.decrypt({ name: 'AES-GCM', iv: packed.slice(0, 12), additionalData: enc.encode(aad) }, k, packed.slice(12));
    });
  }

  /* Open this module with the course key. */
  function openModule(courseKeyB64) {
    return getJSON(base + slug + '.' + lang + '.json').then(function (doc) {
      return gcmOpen(b64d(courseKeyB64), b64d(doc.data), 'mla-mod:' + series + '/' + slug + '/' + lang);
    }).then(function (plain) {
      root.innerHTML = new TextDecoder().decode(plain);   /* authenticated by AES-GCM: only the Academy can produce it */
      root.classList.remove('is-locked');
      var lockBtn = document.createElement('p');
      lockBtn.className = 'fine lock-again';
      lockBtn.innerHTML = '<button type="button" class="linkish">' + t('Forget my access code on this device', 'انسَ رمز الدخول على هذا الجهاز') + '</button>';
      root.querySelector('.mod-body').appendChild(lockBtn);
      lockBtn.querySelector('button').addEventListener('click', function () { store(null); location.reload(); });
      document.dispatchEvent(new CustomEvent('mla:unlocked', { detail: { root: root } }));
      if (location.hash) { var el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
    });
  }

  /* Turn a typed code into the course key, using this course's keys.json. */
  function unlockWith(code) {
    var clean = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length < 8) return Promise.reject(new Error('short'));
    return getJSON(base + 'keys.json').then(function (keys) {
      return subtle.importKey('raw', enc.encode(clean), 'PBKDF2', false, ['deriveBits']).then(function (pw) {
        return subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: b64d(keys.salt), iterations: keys.iter }, pw, 384);
      }).then(function (bits) {
        bits = new Uint8Array(bits);
        var id = b64e(bits.slice(0, 16));
        var entry = (keys.codes || []).filter(function (e) { return e.id === id; })[0];
        if (!entry) throw new Error('unknown');
        return gcmOpen(bits.slice(16, 48), b64d(entry.w), 'mla-key:' + series);
      });
    }).then(function (courseKey) { return b64e(new Uint8Array(courseKey)); });
  }

  if (!subtle || !window.fetch) {
    say(t('This browser cannot open locked modules. Please use a current version of Chrome, Safari, Edge or Firefox.',
          'لا يستطيع هذا المتصفح فتح الوحدات المقفلة. يُرجى استخدام إصدار حديث من Chrome أو Safari أو Edge أو Firefox.'), true);
    if (form) form.querySelector('button').disabled = true;
  } else {
    var saved = stored();
    if (saved) {
      say(t('Opening…', 'جارٍ الفتح…'));
      openModule(saved).catch(function () {
        store(null);
        say(t('Your access has been renewed. Please enter your access code again.', 'جُدّد الدخول إلى الدورة. يُرجى إدخال رمز الدخول مرة أخرى.'));
      });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button');
      btn.disabled = true;
      say(t('Checking your code…', 'جارٍ التحقق من الرمز…'));
      unlockWith(input.value).then(function (key) {
        return openModule(key).then(function () { store(key); });
      }).catch(function (err) {
        btn.disabled = false;
        say(err && err.message === 'missing'
          ? t('This module could not be loaded. Please try again later.', 'تعذّر تحميل هذه الوحدة. يُرجى المحاولة لاحقًا.')
          : t('This code is not valid for this course, or it has been withdrawn.', 'هذا الرمز غير صالح لهذه الدورة أو أُلغي.'), true);
        input.focus();
      });
    });
  }

  /* ---------- Request access: prepares an email to the Academy ---------- */
  var rq = document.getElementById('request-form');
  if (rq) {
    rq.addEventListener('submit', function (e) {
      e.preventDefault();
      var out = document.getElementById('request-msg');
      function v(id) { return document.getElementById(id).value.trim(); }
      var missing = [];
      if (!v('rq-name')) missing.push(t('name', 'الاسم'));
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('rq-email'))) missing.push(t('email', 'البريد الإلكتروني'));
      if (!v('rq-role')) missing.push(t('profession', 'المهنة'));
      if (!v('rq-place')) missing.push(t('institution and country', 'جهة العمل والدولة'));
      if (!document.getElementById('rq-consent').checked) missing.push(t('your agreement', 'موافقتك'));
      if (missing.length) {
        out.textContent = t('Please add: ', 'يرجى إضافة: ') + missing.join(t(', ', '، '));
        out.classList.add('error');
        return;
      }
      var course = (document.querySelector('.mod-no') || {}).textContent || series;
      var title = (document.querySelector('h1') || {}).textContent || slug;
      var body = [
        'Course access request',
        '',
        'Course and module: ' + course.trim() + ' – ' + title.trim(),
        'Page: ' + location.href.split('#')[0],
        '',
        'Name: ' + v('rq-name'),
        'Email: ' + v('rq-email'),
        'Profession: ' + v('rq-role'),
        'Specialty: ' + (v('rq-specialty') || '-'),
        'Institution and country: ' + v('rq-place'),
        'How I will use the course: ' + (v('rq-why') || '-'),
        '',
        'I agree that the Academy keeps this request to decide on access and to send me my code.'
      ].join('\n');
      var to = 'info@metabolicliveracademy.org';
      var link = document.getElementById('request-send');
      link.href = 'mailto:' + to + '?subject=' + encodeURIComponent('Course access request: ' + v('rq-name')) + '&body=' + encodeURIComponent(body);
      out.classList.remove('error');
      out.innerHTML = t('Your email app should now open with the request ready: press Send. If nothing opens, email ',
                        'يُفترض أن يفتح تطبيق البريد الآن والطلب جاهز: اضغط إرسال. إن لم يُفتح شيء فراسل ') +
        '<a href="mailto:' + to + '">' + to + '</a>' + t(' with the same details.', ' بالتفاصيل نفسها.');
      link.click();
    });
  }
})();
