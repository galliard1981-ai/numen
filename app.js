(function () {
'use strict';
var PLAY_URL = '';            // put the Google Play link here when the native app exists
var CODE_RE = /^[A-Za-z0-9_-]{3,32}$/;
var ADS = [
  ['Guitar Study Companion', 'A pocket device for learning guitar'],
  ['Guitar Study Companion software', 'Guitar lessons and training on your computer'],
  ['Mindful Soloist', 'Backing tracks for guitar practice'],
  ['Yoga Asana Companion', 'A pocket device for learning yoga postures'],
  ['Yoga Companion app', 'Build and follow your yoga sequences'],
  ['Expressivoice', 'Expressive narration from your text'],
  ['CultEQ Voice Studio', 'Voice-over studio for your projects'],
  ['Philosophical Advisor app', 'Philosophical counseling in your pocket']
];

var store = {
  get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
var sess = {
  get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
  set: function (k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) {} }
};

var lang = store.get('numen.lang', null);
if (!lang || !I18N[lang]) lang = 'en';
if (!I18N[lang]) lang = 'en';
var phoneOverride = store.get('numen.phone', 'auto');
var UA = navigator.userAgent || '';
var isIOS = /iPhone|iPad|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function platform() { return phoneOverride === 'auto' ? (isIOS ? 'ios' : 'android') : phoneOverride; }

function t(k, v) {
  var s = (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k;
  if (v) for (var x in v) s = s.replace('{' + x + '}', v[x]);
  return s;
}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

/* ---------- icons ---------- */
function ic(inner, size, sw, color) {
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + (color || '#54565c') + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
}
var ICON = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  books: '<path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h12"/>',
  about: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="7.5" r="0.6" fill="#54565c" stroke="none"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.36.38.68.7.92"/>',
  ads: '<path d="M3 11v2a1 1 0 0 0 1 1h3l8 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M19 9a4 4 0 0 1 0 6"/><path d="M7 14l1.5 5.5"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  dl: '<path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>',
  share: '<path d="M12 15V4"/><path d="M8 8l4-4 4 4"/><path d="M6 12H5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-1"/>',
  addh: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8"/><path d="M8 12h8"/>'
};
function rings(size) {
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="5" fill="#e2a23b"/><circle cx="20" cy="20" r="11" stroke="#e2a23b" stroke-opacity="0.6" stroke-width="3"/><circle cx="20" cy="20" r="17" stroke="#e2a23b" stroke-opacity="0.3" stroke-width="3"/></svg>';
}
var TOUCH_SVG = '<img src="assets/touch.jpg" alt="" style="position: relative; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block">';

var SEG = { '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg' };
function ssd(ch, cls) {
  var on = SEG[ch] || '';
  var seg = 'abcdefg'.split('').map(function (s) { return '<i class="ssd-' + s + (on.indexOf(s) >= 0 ? ' on' : '') + '"></i>'; }).join('');
  return '<span class="key-display ' + (cls || '') + '" aria-hidden="true"><span class="ssd">' + seg + '</span></span>';
}

/* ---------- data ---------- */
function nbs() { return store.get('numen.nbs', []); }
function remember(code, nb) {
  var list = nbs().filter(function (x) { return x.code !== code; });
  list.unshift({ code: code, title: nb.title, preset: nb.preset });
  store.set('numen.nbs', list);
}
function localNb(code) { return nbs().filter(function (x) { return x.code === code; })[0] || null; }
var SERVER = false;
function cfgKey(code) { return 'numen.cfg.' + code; }
function api(code) {
  if (!SERVER) return Promise.resolve(store.get(cfgKey(code), null));
  return fetch('/api/nb/' + encodeURIComponent(code), { cache: 'no-store' }).then(function (r) {
    if (r.status === 404) return null;
    if (!r.ok) throw new Error('api');
    return r.json();
  });
}
function put(code, obj) {
  if (!SERVER) { var nb = { title: String(obj.title || '').slice(0, 80), preset: String(obj.preset || 'calendar'), cfg: obj.cfg || {}, updated: Date.now() }; store.set(cfgKey(code), nb); return Promise.resolve(nb); }
  return fetch('/api/nb/' + encodeURIComponent(code), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) })
    .then(function (r) { if (!r.ok) throw new Error('put'); return r.json(); });
}
function delNb(code) {
  if (!SERVER) { try { localStorage.removeItem(cfgKey(code)); } catch (e) {} return Promise.resolve(); }
  return fetch('/api/nb/' + encodeURIComponent(code), { method: 'DELETE' }).catch(function () {});
}
function chipBase() { return SERVER ? origin() + '/r/' : location.origin + location.pathname.replace(/index\.html$/, '') + '#/tap/'; }
function normUrl(u) {
  u = String(u || '').trim();
  if (!u) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u;
  return /^https?:\/\//i.test(u) ? u : '';
}
function randCode() {
  var a = 'abcdefghjkmnpqrstuvwxyz23456789', s = '';
  for (var i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

/* ---------- shell ---------- */
var timer = null;
var eyeT = null, scanAbort = null;
function eyesTv() { return '<div class="tv-frame"><div class="tv-screen" style="height: 146px"><img id="eyeImg" src="assets/eyes1.jpg" alt="" style="position: relative; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block"><div class="avatar-glass"></div></div><div class="tv-foot"></div></div>'; }
function clearTimers() { if (timer) { clearInterval(timer); timer = null; } if (eyeT) { clearTimeout(eyeT); eyeT = null; } if (scanAbort) { try { scanAbort.abort(); } catch (e) {} scanAbort = null; } }
function startEyes() {
  var img = document.getElementById('eyeImg'); if (!img) return;
  var pre = []; for (var i = 1; i <= 8; i++) { var p = new Image(); p.src = 'assets/eyes' + i + '.jpg'; pre.push(p); }
  var OPEN = [1, 3, 8];
  function show(n) { var el = document.getElementById('eyeImg'); if (el) el.src = 'assets/eyes' + n + '.jpg'; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function play(seq, done) {
    var k = 0;
    (function next() {
      if (!document.getElementById('eyeImg')) return;
      if (k >= seq.length) { done(); return; }
      show(seq[k][0]); var d = seq[k][1]; k++; eyeT = setTimeout(next, d);
    })();
  }
  function pick() {
    var r = Math.random(), base = OPEN[Math.floor(Math.random() * 3)], b2 = OPEN[Math.floor(Math.random() * 3)], seq;
    if (r < 0.45) seq = [[4, 70], [6, 95], [7, 75], [base, 0]];
    else if (r < 0.62) seq = [[4, 65], [6, 80], [7, 65], [b2, 140], [4, 65], [6, 80], [7, 65], [base, 0]];
    else if (r < 0.80) seq = [[2, rnd(700, 1500)], [base, 0]];
    else if (r < 0.92) seq = [[4, 110], [5, 110], [6, rnd(200, 400)], [5, 110], [7, 110], [base, 0]];
    else seq = [[2, rnd(500, 900)], [4, 70], [6, 90], [7, 75], [base, 0]];
    play(seq, function () { eyeT = setTimeout(pick, rnd(1100, 4200)); });
  }
  eyeT = setTimeout(pick, 1200);
}
var app = document.getElementById('app');
function shell(isHome, content) {
  function b(href, icon, label) { return '<a class="icon-btn" href="' + href + '" aria-label="' + esc(label) + '">' + ic(ICON[icon], 16, 1.8) + '</a>'; }
  app.innerHTML = '<div class="phone"><div class="screw tl"></div><div class="screw tr"></div><div class="screw bl"></div><div class="screw br"></div>' +
    '<div class="header"><div class="brand">Numen <span>The Phygital Notebook</span></div><div class="header-btns">' +
    (isHome ? '' : b('#/home', 'home', t('home'))) + b('#/notebooks', 'books', t('nb_h1')) + b('#/about', 'about', t('about')) + b('#/settings', 'gear', t('set_lang')) + b('#/ads', 'ads', t('ads')) +
    '</div></div><div class="content" id="content" ' + (isHome ? 'style="justify-content: center; gap: 20px"' : '') + '>' + content + '</div></div>';
  document.documentElement.lang = lang;
}
function origin() {
  var h = location.hostname;
  if ((h === 'localhost' || h === '127.0.0.1') && window.__lan) return 'http://' + window.__lan + ':' + (location.port || 80);
  return location.origin;
}
function setHash(h) { if (location.hash === h) route(); else location.hash = h; }

/* ---------- views ---------- */
var VIDEO_STYLE = 'display: block; width: calc(100% + 40px); margin: 0 -20px; height: auto; aspect-ratio: 784 / 1168; object-fit: cover; ' +
  '-webkit-mask-image: linear-gradient(to right, transparent 0, #000 9%, #000 91%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 9%, #000 91%, transparent 100%); -webkit-mask-composite: source-in; ' +
  'mask-image: linear-gradient(to right, transparent 0, #000 9%, #000 91%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 9%, #000 91%, transparent 100%); mask-composite: intersect';
function vHome() {
  shell(true, '<video id="homeSignVideo" playsinline muted autoplay preload="auto" src="assets/numen-home.webm" style="' + VIDEO_STYLE + '"></video><a class="cta" href="#/get">' + esc(t('start')) + '</a>');
  var v = document.getElementById('homeSignVideo');
  if (v) { var p = v.play && v.play(); if (p && p.catch) p.catch(function () {}); }
}
function afterGet() { var c = sess.get('numen.claim'); return c ? '#/presets/' + c : '#/touch'; }
function urlReadout() { return '<div class="readout"><span style="display:flex">' + ic(ICON.lock, 14, 2, '#9a9ca1') + '</span><span class="val">' + esc(chipBase().replace(/^https?:\/\//, '')) + 'xyz123</span></div>'; }
function vGet() {
  if (platform() === 'ios') {
    function sc(n, txt, icon) { return '<div class="card step-card">' + ssd(n) + '<span class="txt">' + txt + '</span>' + icon + '</div>'; }
    shell(false, '<span class="step">' + esc(t('step', { n: 2 })) + ' · ' + t('iphone') + '</span>' + urlReadout() +
      '<h1 class="h1">' + esc(t('i_h1')) + '</h1><p class="lead">' + esc(t('i_lead')) + '</p>' +
      sc('1', t('i_s1'), ic(ICON.share, 26, 2)) + sc('2', t('i_s2'), ic(ICON.addh, 26, 2)) + sc('3', t('i_s3'), rings(26)) +
      '<a class="cta" href="' + afterGet() + '">' + esc(t('continue')) + '</a>');
  } else {
    var li = function (s) { return '<div class="li"><span class="led"></span><span>' + s + '</span></div>'; };
    var play = PLAY_URL ? '<a class="cta" href="' + esc(PLAY_URL) + '">' + ic(ICON.dl, 18, 2.2, '#2a2118') + esc(t('a_play')) + '</a>'
                        : '<a class="cta" href="' + afterGet() + '">' + esc(t('continue')) + '</a>';
    shell(false, '<span class="step">' + esc(t('step', { n: 2 })) + ' · ' + t('android') + '</span>' + urlReadout() +
      '' + eyesTv() + '' +
      '<h1 class="h1 fun">' + esc(t('a_h1')) + '</h1><p class="lead center">' + esc(t('a_lead')) + '</p>' + play +
      '<div class="card">' + li(t('a_b1')) + li(t('a_b2')) + '</div>');
    startEyes();
  }
}
function vTouch() {
  var code = sess.get('numen.newcode');
  if (!code) { code = randCode(); sess.set('numen.newcode', code); }
  var canWrite = ('NDEFReader' in window) && window.isSecureContext;
  shell(false, '<span class="step">' + esc(t('step', { n: 3 })) + '</span>' +
    '<div class="tv-frame"><div class="tv-screen" style="height: 236px">' + TOUCH_SVG + '<div class="avatar-glass"></div></div><div class="tv-foot"></div></div>' +
    '<h1 class="h1">' + esc(t('t_h1')) + '</h1><p class="lead">' + esc(t('scan_d')) + ' ' + esc(t('t_lead')) + '</p>' +
    '<div class="readout code-row"><span style="display:flex;margin-right:8px">' + ic(ICON.lock, 14, 2, '#9a9ca1') + '</span><span class="val">' + esc(chipBase().replace(/^https?:\/\//, '')) + '</span><input class="code-in" id="code" value="' + esc(code) + '" maxlength="32" autocapitalize="off" autocomplete="off" spellcheck="false" aria-label="chip code"></div>' +
    '<div class="card"><div class="li"><span class="led"></span><span>' + t('t_b1') + '</span></div><div class="li"><span class="led"></span><span>' + t('t_b2') + '</span></div></div>' +
    (canWrite ? '<a class="cta" id="writeBtn" href="#" style="min-width:230px">' + esc(t('t_write')) + '</a><div class="step" id="nfcmsg" style="text-align:center"></div>' : '') +
    '<a class="cta" id="goBtn" href="#">' + esc(t('continue')) + '</a>');
  var inp = document.getElementById('code');
  function cur() { var c = inp.value.trim(); return CODE_RE.test(c) ? c : null; }
  inp.addEventListener('input', function () { var c = cur(); if (c) sess.set('numen.newcode', c); });
  document.getElementById('goBtn').addEventListener('click', function (e) { e.preventDefault(); var c = cur(); if (c) { sess.set('numen.claim', c); setHash('#/presets/' + c); } else inp.focus(); });
  var w = document.getElementById('writeBtn');
  if (w) w.addEventListener('click', function (e) {
    e.preventDefault(); var c = cur(); if (!c) { inp.focus(); return; }
    var msg = document.getElementById('nfcmsg');
    try {
      new NDEFReader().write({ records: [{ recordType: 'url', data: chipBase() + c }] })
        .then(function () { msg.textContent = t('t_written'); }, function () { msg.textContent = t('t_fail'); });
    } catch (err) { msg.textContent = t('t_fail'); }
  });
}

var ed = null;
function presetList() { return ['calendar', 'workspace', 'card', 'link'].concat(platform() === 'android' ? ['focus'] : []); }
var PRESET_FIELDS = {
  calendar: [['url', 'f_cal', 'https://calendar.google.com/…', 'url']],
  workspace: [['url', 'f_ws', 'https://…', 'url']],
  card: [['name', 'f_name', '', 'text'], ['phone', 'f_phone', '', 'tel'], ['email', 'f_email', '', 'email'], ['web', 'f_web', 'https://…', 'url']],
  link: [['url', 'f_link', 'https://…', 'url']],
  focus: [['w', 'f_wmin', '25', 'number', null, '25'], ['b', 'f_bmin', '5', 'number', null, '5'],
          ['e', 'f_end', '', 'select', [['next', 'f_next'], ['stop', 'f_stop']], 'next'], ['s', 'f_snd', '', 'select', [['1', 'f_on'], ['0', 'f_off']], '1']]
};
function pageFields() {
  var cfg = ed.cfgs[ed.preset] || (ed.cfgs[ed.preset] = {});
  return PRESET_FIELDS[ed.preset].map(function (f) {
    var v = cfg[f[0]] != null ? cfg[f[0]] : (f[5] || '');
    if (f[3] === 'select') {
      return '<label class="pg-field"><span class="pg-label">' + esc(t(f[1])) + '</span><select class="pg-input" data-f="' + f[0] + '">' + f[4].map(function (o) { return '<option value="' + o[0] + '"' + (String(v) === o[0] ? ' selected' : '') + '>' + esc(t(o[1])) + '</option>'; }).join('') + '</select></label>';
    }
    var ex = f[3] === 'number' ? ' inputmode="numeric" min="1" max="90"' : '';
    return '<label class="pg-field"><span class="pg-label">' + esc(t(f[1])) + '</span><input class="pg-input" data-f="' + f[0] + '" type="' + f[3] + '"' + ex + ' value="' + esc(v) + '" placeholder="' + esc(f[2]) + '" autocapitalize="off" autocomplete="off" spellcheck="false"></label>';
  }).join('');
}
function drawPresets(anim) {
  var list = presetList(), i = Math.max(0, list.indexOf(ed.preset)), n = list.length;
  shell(false, '<span class="step">' + esc(t('step', { n: 4 })) + '</span>' +
    '<label class="field-wrap"><span class="step">' + esc(t('p_title')) + '</span><input class="field" data-t="1" type="text" value="' + esc(ed.title) + '" placeholder="' + esc(t('p_ph')) + '" maxlength="80" aria-label="' + esc(t('p_title')) + '"></label>' +
    '<div class="nbk">' + '<div class="nbk-page ' + (anim || '') + '" id="page"><div class="pg-title">' + esc(t(ed.preset)) + '</div><div class="pg-desc">' + esc(t(ed.preset + '_d')) + '</div>' + pageFields() + '</div>' + '</div>' +
    '<div class="nbk-nav"><button type="button" class="icon-btn" data-flip="-1" aria-label="‹">' + ic('<path d="M15 6l-6 6 6 6"/>', 16, 2.2) + '</button><span class="pg-count">' + (i + 1) + ' / ' + n + '</span><button type="button" class="icon-btn" data-flip="1" aria-label="›">' + ic('<path d="M9 6l6 6-6 6"/>', 16, 2.2) + '</button></div>' +
    '<div class="readout fixed"><span class="cap" id="nextCap"><b>' + esc(t('p_next')) + '</b> ' + esc(t(ed.preset + '_n')) + '</span></div>' +
    '<a class="cta" id="saveBtn" href="#">' + esc(t('save')) + '</a>');
  function flip(step) { ed.preset = list[(i + step + n) % n]; drawPresets(step > 0 ? 'n0' : 'p0'); }
  var c = document.getElementById('content');
  c.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-flip]');
    if (b) { flip(+b.getAttribute('data-flip')); return; }
    var pg = e.target.closest && e.target.closest('#page');
    if (pg && !e.target.closest('input, label')) {
      var r = pg.getBoundingClientRect();
      flip(e.clientX - r.left > r.width / 2 ? 1 : -1);
    }
  });
  c.addEventListener('input', function (e) {
    var el = e.target;
    if (el.getAttribute('data-t')) ed.title = el.value;
    else if (el.getAttribute('data-f')) (ed.cfgs[ed.preset] || (ed.cfgs[ed.preset] = {}))[el.getAttribute('data-f')] = el.value;
  });
  document.getElementById('saveBtn').addEventListener('click', function (e) { e.preventDefault(); savePreset(); });
}
function savePreset() {
  var cap = document.getElementById('nextCap');
  var src = ed.cfgs[ed.preset] || {}, cfg = {};
  if (ed.preset === 'calendar') cfg.url = normUrl(src.url) || 'https://calendar.google.com/calendar/u/0/r/day';
  else if (ed.preset === 'workspace' || ed.preset === 'link') {
    cfg.url = normUrl(src.url);
    if (!cfg.url) { cap.innerHTML = '<b>' + esc(t('need_link')) + '</b>'; var f = document.querySelector('[data-f="url"]'); if (f) f.focus(); return; }
  } else if (ed.preset === 'card') {
    cfg.name = (src.name || '').trim(); cfg.phone = (src.phone || '').trim(); cfg.email = (src.email || '').trim(); cfg.web = normUrl(src.web);
  } else if (ed.preset === 'focus') {
    var clamp = function (v, d, lo, hi) { v = parseInt(v, 10); return String(isNaN(v) ? d : Math.max(lo, Math.min(hi, v))); };
    cfg.w = clamp(src.w, 25, 5, 90); cfg.b = clamp(src.b, 5, 1, 30);
    cfg.e = src.e === 'stop' ? 'stop' : 'next'; cfg.s = src.s === '0' ? '0' : '1';
    try { localStorage.removeItem('numen.dur.' + ed.code); } catch (e) {}
  }
  var title = (ed.title || '').trim() || t('p_ph');
  put(ed.code, { title: title, preset: ed.preset, cfg: cfg }).then(function () {
    remember(ed.code, { title: title, preset: ed.preset });
    sess.set('numen.claim', null); sess.set('numen.newcode', null);
    setHash('#/notebooks');
  }, function () { cap.innerHTML = '<b>' + esc(t('save_fail')) + '</b>'; });
}
function vPresets(code) {
  if (!CODE_RE.test(code || '')) return setHash('#/notebooks');
  api(code).catch(function () { return null; }).then(function (nb) {
    var l = localNb(code);
    ed = { code: code, title: nb ? nb.title : (l ? l.title : ''), preset: nb ? nb.preset : 'calendar', cfgs: {} };
    if (nb && nb.cfg) ed.cfgs[nb.preset] = JSON.parse(JSON.stringify(nb.cfg));
    if (presetList().indexOf(ed.preset) < 0 && nb && nb.preset !== 'focus') ed.preset = 'calendar';
    if (presetList().indexOf(ed.preset) < 0) { ed.preset = 'calendar'; }
    drawPresets();
  });
}

function vNotebooks() {
  var list = nbs();
  var cards = list.map(function (n) {
    return '<div class="card nb-card"><a class="nb-link" href="#/presets/' + esc(n.code) + '"><div class="nb-top"><span class="led"></span><span class="nb-title">' + esc(n.title) + '</span>' + ic(ICON.chev, 18, 2) + '</div>' +
      '<div class="nb-bottom"><span class="cap-chip">' + esc(t(n.preset)) + '</span><span class="nb-code">' + esc(n.code) + '</span></div></a>' +
      '<div class="nb-actions"><a class="mini-key prog" href="#/presets/' + esc(n.code) + '">' + esc(t('nb_prog')) + '</a></div><div class="nb-actions nb-actions2"><a class="mini-key" href="#/tap/' + esc(n.code) + '">' + esc(t('nb_try')) + '</a><button type="button" class="mini-key" data-del="' + esc(n.code) + '">' + esc(t('nb_del')) + '</button></div></div>';
  }).join('') || '<div class="empty">' + esc(t('nb_empty')) + '</div>';
  var single = platform() === 'ios' && list.length >= 1;
  shell(false, '<span class="step">' + esc(t('nb_label')) + '</span><h1 class="h1">' + esc(t('nb_h1')) + '</h1>' + cards + (single ? '' :
    '<a class="mini-key" id="scanBtn" href="#/scan" style="align-self:center;flex:none;min-width:230px">' + esc(t('scan_btn')) + '</a>' +
    '<a class="cta" id="addBtn" href="#/touch">' + ic(ICON.plus, 18, 2.4, '#2a2118') + esc(t('nb_add')) + '</a>'));
  if (document.getElementById('addBtn')) document.getElementById('addBtn').addEventListener('click', function () { sess.set('numen.claim', null); sess.set('numen.newcode', null); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-del]'), function (b) {
    b.addEventListener('click', function () {
      var code = b.getAttribute('data-del');
      if (!window.confirm(t('nb_del_q'))) return;
      store.set('numen.nbs', nbs().filter(function (x) { return x.code !== code; }));
      try { localStorage.removeItem('numen.tasks.' + code); } catch (e) {}
      delNb(code).then(function () { vNotebooks(); });
    });
  });
}

function runNb(code, nb) {
  var c = nb.cfg || {};
  if ((nb.preset === 'calendar' || nb.preset === 'workspace' || nb.preset === 'link') && c.url) { location.href = c.url; return; }
  if (nb.preset === 'card') { setHash('#/card/' + code); return; }
  if (nb.preset === 'focus') { setHash('#/focus/' + code); return; }
  setHash('#/presets/' + code);
}
function vScan() {
  shell(false, '<span class="step">' + esc(t('scan_btn')).toUpperCase() + '</span>' + eyesTv() + '<h1 class="h1">' + esc(t('scan_h')) + '</h1><p class="lead">' + esc(t('scan_d')) + '</p>');
  startEyes();
  if (!('NDEFReader' in window) || !window.isSecureContext) return;
  try {
    scanAbort = new AbortController();
    var rd = new NDEFReader();
    rd.scan({ signal: scanAbort.signal }).then(function () {
      rd.onreading = function (ev) {
        var recs = ev.message ? ev.message.records : [];
        for (var i = 0; i < recs.length; i++) {
          try {
            var txt = new TextDecoder().decode(recs[i].data), m = /(?:\/r\/|#\/tap\/)([A-Za-z0-9_-]{3,32})/.exec(txt);
            if (m) { setHash('#/tap/' + m[1]); return; }
          } catch (e) {}
        }
      };
    }).catch(function () {});
  } catch (e) {}
}
function vTap(code) {
  if (!CODE_RE.test(code || '')) return setHash('#/home');
  shell(false, '<span class="step">' + esc(t('tap_label')) + '</span>' + eyesTv() + '<h1 class="h1">' + esc(t('tap_search')) + '</h1>');
  startEyes();
  var wait = new Promise(function (r) { setTimeout(r, 1800); });
  Promise.all([api(code).catch(function () { return undefined; }), wait]).then(function (res) {
    var nb = res[0];
    if (!document.getElementById('eyeImg')) return;
    clearTimers();
    if (nb === undefined) { shell(false, '<div class="empty">…</div>'); return; }
    if (nb === null) { sess.set('numen.claim', code); location.replace('#/home'); return; }
    remember(code, nb);
    var n = 3;
    function draw() {
      shell(false, '<span class="step">' + esc(t('tap_label')) + '</span>' +
        '<div class="tv-frame"><div class="tv-screen" style="height: 330px; flex-direction: column; gap: 18px"><span class="val mono" style="position: relative; z-index: 1; font-size: 15px; color: #e2a23b; letter-spacing: 0.04em; text-shadow: 0 0 5px rgba(226,162,59,.5)">' + esc(nb.title) + '</span>' +
        '<div style="position: relative; z-index: 1">' + ssd(String(n), 'big') + '</div><span style="position: relative; z-index: 1; font-size: 14px; color: #c9cbd0">' + esc(t('tap_opening', { x: t(nb.preset) })) + '</span><div class="avatar-glass"></div></div><div class="tv-foot"></div></div>' +
        '<a class="cta" href="#/presets/' + esc(code) + '">' + esc(t('tap_change')) + '</a>');
    }
    draw();
    timer = setInterval(function () { n--; if (n <= 0) { clearTimers(); runNb(code, nb); } else draw(); }, 1000);
  });
}

function withNb(code, fn) {
  if (!CODE_RE.test(code || '')) return setHash('#/notebooks');
  api(code).catch(function () { return null; }).then(function (nb) { if (!nb) return setHash('#/notebooks'); fn(nb); });
}
function vCard(code) {
  withNb(code, function (nb) {
    var c = nb.cfg || {};
    var rows = [['f_phone', c.phone], ['f_email', c.email], ['f_web', c.web]].filter(function (r) { return r[1]; })
      .map(function (r) { return '<div class="vrow"><b>' + esc(t(r[0])) + '</b><span>' + esc(r[1]) + '</span></div>'; }).join('');
    shell(false, '<span class="step">' + esc(t('card')).toUpperCase() + '</span>' +
      '<div class="tv-frame"><div class="tv-screen" style="min-height: 280px; flex-direction: column; align-items: flex-start; justify-content: center; gap: 14px; padding: 24px"><span class="val mono" style="position:relative;z-index:1;font-size:20px;color:#e2a23b;text-shadow:0 0 5px rgba(226,162,59,.5)">' + esc(c.name || nb.title) + '</span><div style="position:relative;z-index:1;display:flex;flex-direction:column;gap:10px">' + rows + '</div><div class="avatar-glass"></div></div><div class="tv-foot"></div></div>' +
      '<a class="cta" id="vcf" href="#">' + esc(t('card_save')) + '</a>');
    document.getElementById('vcf').addEventListener('click', function (e) {
      e.preventDefault();
      function v(s) { return String(s || '').replace(/[\r\n]+/g, ' ').replace(/([,;\\])/g, '\\$1'); }
      var s = 'BEGIN:VCARD\r\nVERSION:3.0\r\nFN:' + v(c.name || nb.title) + '\r\n' + (c.phone ? 'TEL:' + v(c.phone) + '\r\n' : '') + (c.email ? 'EMAIL:' + v(c.email) + '\r\n' : '') + (c.web ? 'URL:' + String(c.web).replace(/[\r\n]/g, '') + '\r\n' : '') + 'END:VCARD\r\n';
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([s], { type: 'text/vcard' })); a.download = (c.name || nb.title || 'contact') + '.vcf';
      document.body.appendChild(a); a.click(); a.remove();
    });
  });
}
function vFocus(code) {
  withNb(code, function (nb) {
    var dkey = 'numen.dur.' + code, c0 = nb.cfg || {}, cd = {};
    if (c0.w) cd.w = parseInt(c0.w, 10) || 25; if (c0.b) cd.b = parseInt(c0.b, 10) || 5; if (c0.e) cd.e = c0.e; if (c0.s != null) cd.s = c0.s === '0' ? 0 : 1;
    var dur = Object.assign({ w: 25, b: 5, e: 'next', s: 1 }, cd, store.get(dkey, {}));
    var WORK = dur.w * 60, BREAK = dur.b * 60, mode = 'work', left = WORK, running = false;
    var key = 'numen.tasks.' + code, tasks = store.get(key, []);
    function durRow(k, label, v) {
      return '<div class="dur-row"><span class="dur-l">' + esc(label) + '</span><button type="button" class="mini-key sq" data-dur="' + k + '-" aria-label="-">−</button><span class="dur-v">' + v + ' ' + esc(t('f_min')) + '</span><button type="button" class="mini-key sq" data-dur="' + k + '+" aria-label="+">+</button></div>';
    }
    function keyBtn(on, attr, label) { return '<button type="button" class="cassette-key ' + (on ? 'on' : '') + '" ' + attr + ' aria-pressed="' + on + '"><span class="key-led"></span><span class="lang-name" style="font-size:13px">' + esc(label) + '</span></button>'; }
    function endBox() {
      return '<div class="dur-l" style="margin-top:4px">' + esc(t('f_end')) + '</div><div class="lang-grid">' + keyBtn(dur.e === 'next', 'data-end="next"', t('f_next')) + keyBtn(dur.e === 'stop', 'data-end="stop"', t('f_stop')) + '</div>' +
        keyBtn(!!dur.s, 'data-snd="1"', t('f_snd'));
    }
    function beep() {
      try { navigator.vibrate && navigator.vibrate([200, 100, 200, 100, 200]); } catch (e) {}
      try {
        var C = window.AudioContext || window.webkitAudioContext; if (!C) return;
        var ac = new C(), t0 = ac.currentTime;
        [0, 0.35, 0.7].forEach(function (o) { var os = ac.createOscillator(), g = ac.createGain(); os.frequency.value = 880; g.gain.setValueAtTime(0.0001, t0 + o); g.gain.exponentialRampToValueAtTime(0.4, t0 + o + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + o + 0.25); os.connect(g); g.connect(ac.destination); os.start(t0 + o); os.stop(t0 + o + 0.3); });
        setTimeout(function () { try { ac.close(); } catch (e) {} }, 1500);
      } catch (e) {}
    }
    function digits(n) { var s = (n < 10 ? '0' : '') + n; return ssd(s[0], 'big2') + ssd(s[1], 'big2'); }
    function draw() {
      var tl = tasks.map(function (k, i) { return '<div class="task ' + (k.d ? 'done' : '') + '"><button class="mini" data-tg="' + i + '" aria-label="toggle">' + (k.d ? '☑' : '☐') + '</button><span class="tt">' + esc(k.t) + '</span><button class="mini" data-rm="' + i + '" aria-label="remove">×</button></div>'; }).join('');
      shell(false, '<span class="step">' + esc(t(mode === 'work' ? 'f_focus' : 'f_break')) + ' · ' + esc(nb.title) + '</span>' +
        '<div class="tv-frame"><div class="tv-screen" style="height: 150px"><div style="position:relative;z-index:1;display:flex;align-items:center;font-size:56px">' + digits(Math.floor(left / 60)) + '<span class="colon"><i></i><i></i></span>' + digits(left % 60) + '</div><div class="avatar-glass"></div></div><div class="tv-foot"></div></div>' +
        '<a class="cta" id="fgo" href="#">' + esc(t(running ? 'f_pause' : 'f_start')) + '</a>' +
        '<button type="button" class="mini-key" id="frs" style="align-self:center;flex:none;min-width:230px">' + esc(t('f_reset')) + '</button>' +
        '<div class="card dur-card">' + durRow('w', t('f_focus'), dur.w) + durRow('b', t('f_break'), dur.b) + endBox() + '</div>' +
        '<div class="card"><div id="tl">' + tl + '</div><input class="field" id="tin" placeholder="' + esc(t('f_add')) + '" style="margin-top:8px" maxlength="120"></div>');
      Array.prototype.forEach.call(document.querySelectorAll('[data-dur]'), function (b) {
        b.addEventListener('click', function () {
          var a = b.getAttribute('data-dur'), k = a[0], d = a[1] === '+' ? 1 : -1;
          var lim = k === 'w' ? [5, 90, 5] : [1, 30, 1];
          dur[k] = Math.max(lim[0], Math.min(lim[1], dur[k] + d * lim[2]));
          store.set(dkey, dur); WORK = dur.w * 60; BREAK = dur.b * 60;
          if (!running) left = mode === 'work' ? WORK : BREAK;
          draw();
        });
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-end],[data-snd]'), function (b) {
        b.addEventListener('click', function () {
          if (b.getAttribute('data-end')) dur.e = b.getAttribute('data-end'); else dur.s = dur.s ? 0 : 1;
          store.set(dkey, dur); draw();
        });
      });
      document.getElementById('fgo').addEventListener('click', function (e) { e.preventDefault(); running = !running; draw(); });
      document.getElementById('frs').addEventListener('click', function (e) { e.preventDefault(); running = false; mode = 'work'; left = WORK; draw(); });
      document.getElementById('tin').addEventListener('keydown', function (e) { if (e.key === 'Enter' && this.value.trim()) { tasks.push({ t: this.value.trim(), d: 0 }); store.set(key, tasks); draw(); document.getElementById('tin').focus(); } });
      document.getElementById('tl').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.getAttribute('data-tg') != null) { var i = +b.getAttribute('data-tg'); tasks[i].d = tasks[i].d ? 0 : 1; } else if (b.getAttribute('data-rm') != null) tasks.splice(+b.getAttribute('data-rm'), 1); else return;
        store.set(key, tasks); draw();
      });
    }
    draw();
    clearTimers();
    timer = setInterval(function () {
      if (!running) return;
      left--;
      if (left <= 0) { if (dur.s) beep(); mode = mode === 'work' ? 'break' : 'work'; left = mode === 'work' ? WORK : BREAK; if (dur.e === 'stop') running = false; draw(); return; }
      var tv = document.querySelector('.tv-screen div'); if (tv) tv.innerHTML = digits(Math.floor(left / 60)) + '<span class="colon"><i></i><i></i></span>' + digits(left % 60);
    }, 1000);
  });
}

function vSettings() {
  var langs = LANGS.map(function (l) { var on = l[0] === lang; return '<button type="button" class="cassette-key ' + (on ? 'on' : '') + '" data-lang="' + l[0] + '" aria-pressed="' + on + '"><span class="key-led"></span><span class="lang-name">' + esc(l[1]) + '</span></button>'; }).join('');
  var phones = [['auto', t('auto')], ['ios', 'iPhone'], ['android', 'Android']].map(function (p) { var on = p[0] === phoneOverride; return '<button type="button" class="cassette-key ' + (on ? 'on' : '') + '" data-phone="' + p[0] + '" aria-pressed="' + on + '"><span class="key-led"></span><span class="lang-name">' + esc(p[1]) + '</span></button>'; }).join('');
  shell(false, '<span class="step">' + esc(t('set_label')) + '</span><h1 class="h1">' + esc(t('set_lang')) + '</h1><div class="lang-grid">' + langs + '</div>' +
    '<h1 class="h1" style="font-size:18px;margin-top:6px">' + esc(t('set_phone')) + '</h1><div class="lang-grid" style="grid-template-columns:1fr 1fr 1fr">' + phones + '</div>');
  document.getElementById('content').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.getAttribute('data-lang')) { lang = b.getAttribute('data-lang'); store.set('numen.lang', lang); vSettings(); }
    else if (b.getAttribute('data-phone')) { phoneOverride = b.getAttribute('data-phone'); store.set('numen.phone', phoneOverride); vSettings(); }
  });
}
function vAbout() {
  shell(false, '<span class="step">' + esc(t('about')).toUpperCase() + '</span><h1 class="h1">Numen</h1><p class="lead" style="font-size:16px">The Phygital Notebook</p>' +
    '<div class="card"><div class="li"><span class="led"></span><span>' + esc(t('about_t')) + '</span></div><div class="li"><span class="led"></span><span>by CultEQ Tinkerlab</span></div></div>');
}
function vAds() {
  var cards = ADS.map(function (a) { return '<div class="card ad"><span class="nb-title">' + esc(a[0]) + '</span><span class="lead" style="font-size:13px">' + esc(a[1]) + '</span></div>'; }).join('');
  shell(false, '<span class="step">CULTEQ</span><h1 class="h1">' + esc(t('ads')) + '</h1>' + cards);
}

/* ---------- router ---------- */
function route() {
  clearTimers();
  var h = location.hash.replace(/^#\/?/, '');
  var parts = h.split('/'), name = parts[0] || 'home', arg = parts[1];
  var views = { home: vHome, get: vGet, touch: vTouch, presets: vPresets, notebooks: vNotebooks, tap: vTap, card: vCard, focus: vFocus, settings: vSettings, about: vAbout, ads: vAds, scan: vScan };
  (views[name] || vHome)(arg);
  var c = document.getElementById('content'); if (c) c.scrollTop = 0;
}
window.addEventListener('hashchange', route);

var m = location.pathname.match(/^\/r\/([A-Za-z0-9_-]{3,32})\/?$/);
if (m) { history.replaceState(null, '', '/#/tap/' + m[1]); }
fetch('api/info').then(function (r) { return r.json(); }).then(function (i) { SERVER = true; window.__lan = (i.lan && i.lan[0]) || null; }).catch(function () {}).then(route);
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
