/* ============================================================
   Publication Radar – shows the papers in data/radar.js
   The list is refreshed every day by a GitHub robot
   (.github/workflows/radar.yml). Nothing here contacts PubMed:
   the visitor's browser only reads the local data file.
   ============================================================ */
(function () {
  'use strict';
  var list = document.getElementById('radar-list');
  if (!list) return;

  var AR = document.documentElement.lang === 'ar';
  /* The page first loads data/radar-recent.js (recent papers only, small and
     fast). The full list, data/radar.js, is fetched only when the visitor
     picks a longer period than the recent file covers. */
  var data = window.MLA_RADAR || { items: [] };
  var items = data.items || [];
  var full = !data.recentDays;
  var waiting = null;
  function needFull() { return !full && (st.days === 0 || st.days > data.recentDays - 2); }
  function loadFull(done) {
    if (waiting) { waiting.push(done); return; }
    waiting = [done];
    var me = document.querySelector('script[src*="radar-recent.js"]');
    var s = document.createElement('script');
    s.src = me ? me.getAttribute('src').replace('radar-recent.js', 'radar.js') : 'data/radar.js';
    s.onload = function () {
      data = window.MLA_RADAR || data; items = data.items || items; full = true;
      var q = waiting; waiting = null; q.forEach(function (f) { f(); });
    };
    s.onerror = function () { full = true; var q = waiting; waiting = null; q.forEach(function (f) { f(); }); };
    document.body.appendChild(s);
  }
  var PAGE = 25;

  var TYPES = {
    guideline: ['Guideline', 't-guide'],
    meta: ['Meta-analysis', 't-meta'],
    rct: ['Randomized trial', 't-rct'],
    trial: ['Clinical trial', 't-trial'],
    review: ['Review', 't-review'],
    obs: ['Observational', 't-obs'],
    research: ['Original research', 't-res']
  };
  var TOPICS = {
    masld: 'MASLD/MASH', obesity: 'Obesity', drugs: 'Drugs', fibrosis: 'Fibrosis tests',
    cancer: 'Cirrhosis/HCC', heart: 'Heart', children: 'Children', ai: 'AI'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function toDate(s) { var p = String(s || '').split('-'); return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1); }
  var today = new Date(); today.setHours(0, 0, 0, 0);
  function ageDays(s) { return s ? Math.round((today - toDate(s)) / 86400000) : 9999; }
  function fmt(s) { return s ? toDate(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''; }
  function link(it) { return it.doi ? 'https://doi.org/' + encodeURI(it.doi) : 'https://pubmed.ncbi.nlm.nih.gov/' + esc(it.p) + '/'; }

  /* ---------- Stamp ---------- */
  var stamp = document.getElementById('radar-stamp');
  if (data.updated) {
    var u = new Date(data.updated.replace('Z', ':00Z'));
    var when = isNaN(u) ? data.updated : u.toLocaleDateString(AR ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    stamp.textContent = (AR ? 'آخر تحديث: ' : 'Last updated: ') + when;
  } else {
    stamp.textContent = AR ? 'التحديث الأول قيد التنفيذ. عُد بعد قليل.' : 'The first update is on its way. Please check back shortly.';
  }

  /* ---------- Card ---------- */
  function card(it, compact) {
    var ty = TYPES[it.k] || TYPES.research;
    var chips = (it.c || []).map(function (c) { return '<span class="chip c-place">' + esc(c) + '</span>'; }).join('') +
      (it.g || []).slice(0, compact ? 2 : 4).map(function (g) { return TOPICS[g] ? '<span class="chip">' + TOPICS[g] + '</span>' : ''; }).join('');
    return '<article class="paper' + (compact ? ' compact' : '') + '">' +
      '<div class="paper-top"><span class="ptype ' + ty[1] + '">' + ty[0] + '</span>' +
      '<time datetime="' + esc(it.d) + '">' + fmt(it.d) + '</time></div>' +
      '<h3><a href="' + link(it) + '" target="_blank" rel="noopener">' + esc(it.t) + '</a></h3>' +
      '<p class="paper-meta"><strong>' + esc(it.j) + '</strong>' + (it.a ? ' · ' + esc(it.a) : '') + '</p>' +
      (chips ? '<p class="chips">' + chips + '</p>' : '') +
      (compact ? '' : '<p class="paper-links"><a href="https://pubmed.ncbi.nlm.nih.gov/' + esc(it.p) + '/" target="_blank" rel="noopener">PubMed</a>' +
        (it.doi ? ' · <a href="https://doi.org/' + encodeURI(it.doi) + '" target="_blank" rel="noopener">DOI</a>' : '') + '</p>') +
      '</article>';
  }

  /* ---------- Top picks ---------- */
  var rank = { guideline: 0, meta: 1, rct: 2 };
  var picks = items.filter(function (it) { return it.k in rank && ageDays(it.d) <= 30; })
    .sort(function (a, b) { return (rank[a.k] - rank[b.k]) || (a.d < b.d ? 1 : -1); })
    .slice(0, 6);
  if (picks.length) {
    document.getElementById('radar-picks').innerHTML = picks.map(function (it) { return card(it, true); }).join('');
  } else {
    document.getElementById('picks-section').hidden = true;
  }

  /* ---------- Filters ---------- */
  var st = { region: 'global', days: 30, type: '', topic: '', q: '', shown: PAGE };
  function inRegion(it, r) { return r === 'mena' ? it.m : it.w; }
  var counts = data.counts || { global: items.filter(function (i) { return i.w; }).length, mena: items.filter(function (i) { return i.m; }).length };
  document.getElementById('count-global').textContent = '(' + counts.global + ')';
  document.getElementById('count-mena').textContent = '(' + counts.mena + ')';

  function current() {
    var words = st.q.toLowerCase().split(/\s+/).filter(Boolean);
    return items.filter(function (it) {
      if (!inRegion(it, st.region)) return false;
      if (st.days && ageDays(it.d) > st.days) return false;
      if (st.type && it.k !== st.type) return false;
      if (st.topic && (it.g || []).indexOf(st.topic) < 0) return false;
      if (words.length) {
        var hay = (it.t + ' ' + it.j + ' ' + it.a + ' ' + (it.c || []).join(' ')).toLowerCase();
        for (var i = 0; i < words.length; i++) if (hay.indexOf(words[i]) < 0) return false;
      }
      return true;
    });
  }

  var countEl = document.getElementById('radar-count');
  var more = document.getElementById('radar-more');
  function render() {
    if (needFull()) {
      countEl.textContent = AR ? 'جارٍ تحميل الأبحاث الأقدم…' : 'Loading older papers…';
      loadFull(render);
      return;
    }
    var res = current();
    if (!items.length) {
      list.innerHTML = '<p class="empty">' + (AR ? 'ستظهر الأبحاث هنا بعد أول تحديث تلقائي.' : 'Papers will appear here after the first automatic update.') + '</p>';
      countEl.textContent = ''; more.hidden = true; return;
    }
    countEl.textContent = AR ? ('عدد الأبحاث: ' + res.length) : (res.length + (res.length === 1 ? ' paper' : ' papers'));
    list.innerHTML = res.length ? res.slice(0, st.shown).map(function (it) { return card(it, false); }).join('')
      : '<p class="empty">' + (AR ? 'لا توجد أبحاث تطابق هذا البحث. جرّب فترة أطول أو كلمات أخرى.' : 'No papers match. Try a longer period or different words.') + '</p>';
    more.hidden = res.length <= st.shown;
  }

  document.querySelectorAll('.radar-tabs [role="tab"]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.radar-tabs [role="tab"]').forEach(function (t) { t.setAttribute('aria-selected', t === tab); });
      document.getElementById('radar-panel').setAttribute('aria-labelledby', tab.id);
      st.region = tab.getAttribute('data-region'); st.shown = PAGE; render();
    });
  });
  var period = document.getElementById('radar-period');
  period.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    period.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    st.days = +b.getAttribute('data-days'); st.shown = PAGE; render();
  });
  document.getElementById('radar-type').addEventListener('change', function () { st.type = this.value; st.shown = PAGE; render(); });
  document.getElementById('radar-topic').addEventListener('change', function () { st.topic = this.value; st.shown = PAGE; render(); });
  var timer;
  document.getElementById('radar-q').addEventListener('input', function () {
    var v = this.value; clearTimeout(timer);
    timer = setTimeout(function () { st.q = v; st.shown = PAGE; render(); }, 150);
  });
  more.addEventListener('click', function () { st.shown += PAGE; render(); });

  render();
})();
