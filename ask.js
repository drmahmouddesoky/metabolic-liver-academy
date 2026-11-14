/* ============================================================
   "Ask the Academy" – the AI helper on ask.html
   - Sends the visitor's question to the Academy's own Cloudflare
     AI Search, which has read the pages of this website and answers
     only from them (rules are set in the Cloudflare dashboard).
   - Nothing else is sent: no name, no cookies, no page history.
     Only the question and the earlier questions/answers of this chat.
   - No code from any other website runs here. Answers are shown as
     plain text (never as HTML) and links are kept to this site only.
   ============================================================ */
(function () {
  'use strict';

  /* The public address of the AI Search instance "mla-site".
     Must match ASK_HOST in build.py (the page's Content Security Policy). */
  var ASK_HOST = 'https://2aca7004-64b6-4a4e-ac76-5622b96cca54.search.ai.cloudflare.com';
  var SITE = 'https://metabolicliveracademy.org/';
  var MAX_LEN = 500;          /* longest question accepted */
  var MAX_TURNS = 6;          /* earlier messages sent along for context */
  /* Writes clean Arabic and English (the default model mixed in stray foreign words). */
  var MODEL = '@cf/deepseek-ai/deepseek-v4-flash-0731';

  var html = document.documentElement;
  var AR = html.lang === 'ar';
  function t(en, ar) { return AR ? ar : en; }

  var form = document.getElementById('ask-form');
  var input = document.getElementById('ask-input');
  var log = document.getElementById('ask-log');
  var btn = document.getElementById('ask-send');
  var count = document.getElementById('ask-count');
  if (!form || !input || !log) return;

  var history = [];
  var busy = false;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* Keep only links to pages of this website. */
  function siteLink(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) {
      return u.indexOf(SITE) === 0 ? u : '';
    }
    return '';
  }

  /* Turn a page address into a short readable name. */
  function pageName(u) {
    var p = u.replace(SITE, '').replace(/\.html$/, '').replace(/^ar\//, '');
    if (!p || p === 'index') return t('Home page', 'الصفحة الرئيسية');
    p = p.split('/').pop().replace(/[-_]+/g, ' ');
    return p.charAt(0).toUpperCase() + p.slice(1);
  }

  function addBubble(who, text) {
    var b = el('div', 'ask-msg ' + who);
    var lines = String(text || '').split(/\n{2,}/);
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].trim()) b.appendChild(el('p', null, lines[i].trim()));
    }
    log.appendChild(b);
    b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return b;
  }

  function addSources(bubble, urls) {
    var seen = {}, list = [];
    for (var i = 0; i < urls.length; i++) {
      var u = siteLink(urls[i]);
      if (u && !seen[u]) { seen[u] = 1; list.push(u); }
    }
    if (!list.length) return;
    var box = el('div', 'ask-sources');
    box.appendChild(el('span', 'small muted', t('Read more on our pages: ', 'اقرأ المزيد في صفحاتنا: ')));
    for (var j = 0; j < list.length && j < 4; j++) {
      var a = el('a', null, pageName(list[j]));
      a.href = list[j];
      box.appendChild(a);
    }
    bubble.appendChild(box);
  }

  /* Pull page addresses out of the reply, whatever shape it comes in. */
  function sourcesOf(data) {
    var out = [];
    var chunks = (data && (data.chunks || (data.search_results) || (data.result && data.result.chunks))) || [];
    for (var i = 0; i < chunks.length; i++) {
      var c = chunks[i] || {};
      var item = c.item || {};
      var md = item.metadata || c.metadata || c.attributes || {};
      out.push(md.url || md.source_url || item.key || c.filename || c.url || '');
    }
    return out;
  }

  function answerOf(data) {
    try {
      if (data.choices && data.choices[0]) {
        var m = data.choices[0].message || {};
        return m.content || data.choices[0].text || '';
      }
      if (data.result && data.result.response) return data.result.response;
      if (data.response) return data.response;
    } catch (e) { /* fall through */ }
    return '';
  }

  function setBusy(on) {
    busy = on;
    btn.disabled = on;
    input.disabled = on;
    form.classList.toggle('busy', on);
  }

  input.addEventListener('input', function () {
    if (count) count.textContent = input.value.length + ' / ' + MAX_LEN;
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (busy) return;
    var q = input.value.replace(/\s+/g, ' ').trim();
    if (!q) return;
    if (q.length > MAX_LEN) q = q.slice(0, MAX_LEN);
    addBubble('me', q);
    input.value = '';
    if (count) count.textContent = '0 / ' + MAX_LEN;
    var wait = addBubble('bot wait', t('Looking through our pages…', 'نبحث في صفحاتنا…'));
    setBusy(true);

    var msgs = history.slice(-MAX_TURNS).concat([{ role: 'user', content: q }]);
    fetch(ASK_HOST + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({ model: MODEL, messages: msgs, stream: false })
    }).then(function (r) {
      if (r.status === 429) throw new Error('busy');
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    }).then(function (data) {
      wait.remove();
      var text = answerOf(data) || t('Sorry, I could not find an answer on our pages.', 'عذرًا، لم أجد إجابة في صفحاتنا.');
      var b = addBubble('bot', text);
      addSources(b, sourcesOf(data));
      history.push({ role: 'user', content: q }, { role: 'assistant', content: text });
    }).catch(function (e) {
      wait.remove();
      addBubble('bot err', e && e.message === 'busy'
        ? t('Many people are asking right now. Please try again in a minute.', 'هناك أسئلة كثيرة الآن. من فضلك حاول مرة أخرى بعد دقيقة.')
        : t('Sorry, the helper is not available right now. Please try again later, or browse our pages.', 'عذرًا، المساعد غير متاح الآن. حاول لاحقًا، أو تصفّح صفحاتنا.'));
    }).then(function () {
      setBusy(false);
      input.focus();
    });
  });
})();
