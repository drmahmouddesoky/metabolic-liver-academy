/* Founder's desk: switch counting of this device's visits off or on.
   main.js skips the GoatCounter visit when this flag is set. */
(function () {
  var KEY = 'mla-no-count';
  var state = document.getElementById('count-state');
  var btn = document.getElementById('count-toggle');
  function get() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return null; } }
  function set(v) { try { if (v) localStorage.setItem(KEY, '1'); else localStorage.removeItem(KEY); } catch (e) { /* private mode */ } }
  function show() {
    var off = get();
    if (off === null) {
      state.textContent = 'This browser does not allow saving the setting (private mode?).';
      btn.hidden = true;
      return;
    }
    state.className = off ? 'off' : '';
    state.textContent = off ? 'Your visits on this device are NOT counted.' : 'Your visits on this device are counted like anyone else’s.';
    btn.textContent = off ? 'Count my visits again on this device' : 'Don’t count my visits on this device';
    btn.hidden = false;
  }
  btn.addEventListener('click', function () { set(!get()); show(); });
  show();
})();
