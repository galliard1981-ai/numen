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
  list.unshift({ code: code, title: nb.title, preset: nb.preset, fn: nb.fn || (nb.cfg && nb.cfg.on) || '' });
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
  shell(true, '<video id="homeSignVideo" playsinline muted autoplay preload="auto" src="assets/numen-home.webm" style="' + VIDEO_STYLE + '"></video>' +
    '<a class="cta" href="#/get">' + esc(t('start')) + '</a>' +
    '<a class="cta" id="homeScan" href="#/scan">' + rings(20) + esc(t('h_scan')) + '</a>');
  var v = document.getElementById('homeSignVideo');
  if (v) { var p = v.play && v.play(); if (p && p.catch) p.catch(function () {}); }
}
var deferredInstall = null;
window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredInstall = e; if (location.hash === '#/get') vGet(); });
function standalone() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; }
function vGet() {
  if (platform() === 'ios') {
    function sc(n, txt, icon) { return '<div class="card step-card">' + ssd(n) + '<span class="txt">' + txt + '</span>' + icon + '</div>'; }
    shell(false, '<span class="step">' + esc(t('step', { n: 2 })) + ' · ' + t('iphone') + '</span>' +
      '<h1 class="h1">' + esc(t('i_h1')) + '</h1><p class="lead">' + esc(t('i_lead')) + '</p>' +
      sc('1', t('i_s1'), ic(ICON.share, 26, 2)) + sc('2', t('i_s2'), ic(ICON.addh, 26, 2)) + sc('3', t('i_s3'), rings(26)) +
      '<a class="cta" href="#/touch">' + esc(t('continue')) + '</a>');
  } else {
    var li = function (s) { return '<div class="li"><span class="led"></span><span>' + s + '</span></div>'; };
    var inst = '', main;
    if (PLAY_URL) main = '<a class="cta" href="' + esc(PLAY_URL) + '">' + ic(ICON.dl, 18, 2.2, '#2a2118') + esc(t('a_play')) + '</a>';
    else if (!standalone() && deferredInstall) {
      main = '<a class="cta" id="instBtn" href="#">' + ic(ICON.dl, 18, 2.2, '#2a2118') + esc(t('g_inst')) + '</a>';
    } else main = '';
    var cont = main ? '<a class="cta" href="#/touch">' + esc(t('continue')) + '</a>' : '<a class="cta" href="#/touch">' + esc(t('continue')) + '</a>';
    var how = (!PLAY_URL && !standalone() && !deferredInstall) ? '<div class="card">' + li(t('g_inst_d')) + '</div>' : '';
    shell(false, '<span class="step">' + esc(t('step', { n: 2 })) + ' · ' + t('android') + '</span>' + eyesTv() +
      '<h1 class="h1 fun">' + esc(t('a_h1')) + '</h1><p class="lead center">' + esc(t('a_lead')) + '</p>' + main + how + cont +
      '<div class="card">' + li(t('a_b1')) + li(t('a_b2')) + '</div>');
    startEyes();
    var ib = document.getElementById('instBtn');
    if (ib) ib.addEventListener('click', function (e) { e.preventDefault(); var d = deferredInstall; deferredInstall = null; try { d.prompt(); } catch (x) {} setHash('#/touch'); });
  }
}
function nfcOK() { return ('NDEFReader' in window) && window.isSecureContext; }
function vTouch() {
  var nfc = nfcOK();
  shell(false, '<span class="step">' + esc(t('step', { n: 3 })) + '</span>' +
    '<div class="tv-frame"><div class="tv-screen" style="height: 236px">' + TOUCH_SVG + '<div class="avatar-glass"></div></div><div class="tv-foot"></div></div>' +
    '<h1 class="h1">' + esc(t('t_h1')) + '</h1><p class="lead">' + esc(t('t_lead')) + '</p>' +
    '<div class="card"><div class="li"><span class="led"></span><span>' + t('t_b1') + '</span></div><div class="li"><span class="led"></span><span>' + t('t_b2') + '</span></div></div>' +
    (nfc ? '<a class="cta" id="goScan" href="#/scan/new">' + esc(t('h_scan')) + '</a><a class="cta" id="goSkip" href="#">' + esc(t('t_nochip')) + '</a>'
         : '<a class="cta" id="goSkip" href="#">' + esc(t('continue')) + '</a>'));
  document.getElementById('goSkip').addEventListener('click', function (e) { e.preventDefault(); setHash('#/presets/' + randCode()); });
}

/* ---------- notebook model ---------- */
var APPS = [
  ['facebook', 'Facebook', 'com.facebook.katana', 'fb://'],
  ['messenger', 'Messenger', 'com.facebook.orca', 'fb-messenger://'],
  ['instagram', 'Instagram', 'com.instagram.android', 'instagram://'],
  ['tiktok', 'TikTok', 'com.zhiliaoapp.musically', 'snssdk1233://'],
  ['spotify', 'Spotify', 'com.spotify.music', 'spotify://'],
  ['whatsapp', 'WhatsApp', 'com.whatsapp', 'whatsapp://'],
  ['youtube', 'YouTube', 'com.google.android.youtube', 'youtube://'],
  ['telegram', 'Telegram', 'org.telegram.messenger', 'tg://'],
  ['x', 'X', 'com.twitter.android', 'twitter://'],
  ['snapchat', 'Snapchat', 'com.snapchat.android', 'snapchat://'],
  ['gmail', 'Gmail', 'com.google.android.gm', 'googlegmail://'],
  ['maps', 'Google Maps', 'com.google.android.apps.maps', 'comgooglemaps://']
];
function appDef(k) { return APPS.filter(function (a) { return a[0] === k; })[0] || null; }
function clean(s) { return String(s || '').replace(/[|~]/g, ' ').trim().slice(0, 60); }
function packT(u) { return String(u || '').trim().slice(0, 160).replace(/~/g, '%7E').replace(/\|/g, '%7C'); }
function unpackT(u) { return String(u || '').replace(/%7E/g, '~').replace(/%7C/g, '|'); }
function parseApps(str) {
  return String(str || '').split('|').map(function (p) {
    var q = p.split('~');
    if (q[0] === 'c') return q[2] ? { k: 'c', n: unpackT(q[1]) || unpackT(q[2]), u: unpackT(q[2]) } : null;
    return appDef(q[0]) ? { k: q[0], u: unpackT(q[1]) } : null;
  }).filter(Boolean).slice(0, 4);
}
function encodeApps(list) {
  return list.map(function (s) {
    if (s.k === 'c') return clean(s.u) ? 'c~' + clean(s.n || s.u) + '~' + packT(s.u) : '';
    return s.k && appDef(s.k) ? s.k + (String(s.u || '').trim() ? '~' + packT(s.u) : '') : '';
  }).filter(Boolean).join('|');
}
var PH = { instagram: '@username / post link', facebook: 'page name / link', messenger: 'username', tiktok: '@username / video link', spotify: 'https://open.spotify.com/…', whatsapp: '+30 69…', youtube: '@channel / video link', telegram: '@username', x: '@username / post link', snapchat: 'username', gmail: 'name@example.com', maps: 'address / place' };
function targetUrl(k, v) {
  v = String(v || '').trim(); if (!v) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return v;
  var u = v.replace(/^@/, ''), enc = encodeURIComponent;
  switch (k) {
    case 'instagram': return 'https://www.instagram.com/' + enc(u) + '/';
    case 'facebook': return 'https://www.facebook.com/' + enc(u);
    case 'messenger': return 'https://m.me/' + enc(u);
    case 'tiktok': return 'https://www.tiktok.com/@' + enc(u);
    case 'spotify': return 'https://open.spotify.com/user/' + enc(u);
    case 'whatsapp': return 'https://wa.me/' + v.replace(/\D/g, '');
    case 'youtube': return 'https://www.youtube.com/@' + enc(u);
    case 'telegram': return 'https://t.me/' + enc(u);
    case 'x': return 'https://x.com/' + enc(u);
    case 'snapchat': return 'https://www.snapchat.com/add/' + enc(u);
    case 'gmail': return 'mailto:' + v;
    case 'maps': return 'https://www.google.com/maps/search/?api=1&query=' + enc(v);
  }
  return '';
}
function appName(e) { return e.k === 'c' ? e.n : appDef(e.k)[1] + (String(e.u || '').trim() ? ' · ' + String(e.u).trim().replace(/^https?:\/\/(www\.)?/, '').slice(0, 22) : ''); }
function intentFor(pkg) {
  return 'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=' + pkg +
    ';S.browser_fallback_url=' + encodeURIComponent('https://play.google.com/store/apps/details?id=' + pkg) + ';end';
}
function appHref(e) {
  var ios = platform() === 'ios';
  if (e.k !== 'c') {
    var d = appDef(e.k), url = targetUrl(e.k, e.u);
    if (!url) return ios ? d[3] : intentFor(d[2]);
    var m = /^(https?):\/\/([^\/?#]+)([^#]*)/i.exec(url);
    if (ios || !m) return url;
    return 'intent://' + m[2] + m[3] + '#Intent;scheme=' + m[1].toLowerCase() + ';package=' + d[2] + ';S.browser_fallback_url=' + encodeURIComponent(url) + ';end';
  }
  var u = String(e.u || '').trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return u;
  if (/^[a-z][a-z0-9_]*(\.[a-z0-9_]+){2,}$/i.test(u) && !/\.(com|org|net|gr|io|eu|app)$/i.test(u)) return ios ? '' : intentFor(u);
  return normUrl(u);
}
function fnOf(nb) {
  var c = nb.cfg || {}, o = { on: '', link: '', apps: '', pm: 'both', pmin: '25' };
  if (nb.preset === 'multi') { o.on = c.on || ''; o.link = c.link || ''; o.apps = c.apps || ''; o.pm = c.pm || 'both'; o.pmin = c.pmin || '25'; }
  else if (c.url && /^(calendar|workspace|link)$/.test(nb.preset)) { o.on = 'l'; o.link = c.url; }
  else if (nb.preset === 'focus') { o.on = 'p'; o.pmin = c.w || '25'; o.pm = c.s === '0' ? 'vib' : 'both'; }
  return o;
}
function fnLabels(on) {
  var m = { l: 'c_l', a: 'c_a', p: 'c_p' };
  return 'lap'.split('').filter(function (k) { return (on || '').indexOf(k) >= 0; }).map(function (k) { return t(m[k]); });
}

/* ---------- program (menu) ---------- */
var ed = null;
function keyBtn(on, attr, title, desc) {
  return '<button type="button" class="cassette-key ' + (on ? 'on' : '') + '" ' + attr + ' aria-pressed="' + on + '"><span class="key-led"></span><span class="key-body"><span class="lang-name">' + esc(title) + '</span>' + (desc ? '<span class="fn-d">' + esc(desc) + '</span>' : '') + '</span></button>';
}
function selOpts(list, cur) { return list.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === cur ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join(''); }
function drawEd() {
  var c0 = document.getElementById('content'), sc = c0 ? c0.scrollTop : 0;
  var body = '';
  body += keyBtn(ed.on.l, 'data-tg="l"', t('fn_link'), t('fn_link_d'));
  if (ed.on.l) body += '<div class="card fn-body"><label class="pg-field"><span class="pg-label">' + esc(t('f_link')) + '</span><input class="field" data-link="1" type="url" value="' + esc(ed.link) + '" placeholder="https://…" autocapitalize="off" autocomplete="off" spellcheck="false"></label></div>';
  body += keyBtn(ed.on.a, 'data-tg="a"', t('fn_apps'), t('fn_apps_d'));
  if (ed.on.a) {
    body += '<div class="card fn-body">';
    for (var i = 0; i < 4; i++) {
      var s = ed.slots[i], opts = [['', t('slot_none')]].concat(APPS.map(function (a) { return [a[0], a[1]]; })).concat([['c', t('slot_other')]]);
      body += '<label class="pg-field"><span class="pg-label">' + esc(t('slot', { n: i + 1 })) + '</span><select class="field" data-slot="' + i + '">' + selOpts(opts, s.k) + '</select></label>';
      if (s.k && s.k !== 'c') body += '<input class="field" data-st="' + i + '" value="' + esc(s.u || '') + '" placeholder="' + esc(PH[s.k] || '') + '" aria-label="' + esc(t('f_target')) + '" autocapitalize="off" autocomplete="off" spellcheck="false"><span class="fn-d">' + esc(t('f_target')) + '</span>';
      if (s.k === 'c') body += '<div class="fn-two"><input class="field" data-sn="' + i + '" value="' + esc(s.n || '') + '" placeholder="' + esc(t('f_appname')) + '" maxlength="40"><input class="field" data-su="' + i + '" value="' + esc(s.u || '') + '" placeholder="' + esc(t('f_appaddr')) + '" autocapitalize="off" autocomplete="off" spellcheck="false"></div>';
    }
    body += '</div>';
  }
  body += keyBtn(ed.on.p, 'data-tg="p"', t('fn_prof'), t('fn_prof_d'));
  if (ed.on.p) body += '<div class="card fn-body"><label class="pg-field"><span class="pg-label">' + esc(t('pm_label')) + '</span><select class="field" data-pm="1">' +
    selOpts([['sound', t('pm_sound')], ['vib', t('pm_vib')], ['both', t('pm_both')], ['silent', t('pm_silent')]], ed.pm) + '</select></label>' +
    '<label class="pg-field"><span class="pg-label">' + esc(t('pm_dur')) + '</span><input class="field" data-pmin="1" type="number" inputmode="numeric" min="1" max="99" value="' + esc(ed.pmin) + '"></label></div>';
  shell(false, '<span class="step">' + esc(t('step', { n: 4 })) + '</span>' +
    '<label class="field-wrap"><span class="step">' + esc(t('p_title')) + '</span><input class="field" data-t="1" type="text" value="' + esc(ed.title) + '" placeholder="' + esc(t('p_ph')) + '" maxlength="80" aria-label="' + esc(t('p_title')) + '"></label>' +
    '<span class="step">' + esc(t('ed_h')) + '</span>' + body +
    '<div class="step" id="edmsg" style="text-align:center;min-height:14px"></div><a class="cta" id="saveBtn" href="#">' + esc(t('save')) + '</a>');
  var c = document.getElementById('content'); c.scrollTop = sc;
  c.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-tg]');
    if (b) { var k = b.getAttribute('data-tg'); ed.on[k] = !ed.on[k]; drawEd(); }
  });
  c.addEventListener('change', function (e) {
    var el = e.target, i = el.getAttribute('data-slot');
    if (i != null) { var old = ed.slots[+i]; ed.slots[+i] = el.value === 'c' ? { k: 'c', n: old.n || '', u: old.u || '' } : { k: el.value, u: old.k === el.value ? old.u : '' }; drawEd(); }
    else if (el.getAttribute('data-pm')) ed.pm = el.value;
  });
  c.addEventListener('input', function (e) {
    var el = e.target;
    if (el.getAttribute('data-t')) ed.title = el.value;
    else if (el.getAttribute('data-link')) ed.link = el.value;
    else if (el.getAttribute('data-pmin')) ed.pmin = el.value;
    else if (el.getAttribute('data-st') != null) ed.slots[+el.getAttribute('data-st')].u = el.value;
    else if (el.getAttribute('data-sn') != null) ed.slots[+el.getAttribute('data-sn')].n = el.value;
    else if (el.getAttribute('data-su') != null) ed.slots[+el.getAttribute('data-su')].u = el.value;
  });
  document.getElementById('saveBtn').addEventListener('click', function (e) { e.preventDefault(); saveEd(); });
}
function saveEd() {
  var msg = document.getElementById('edmsg'), on = { l: ed.on.l, a: ed.on.a, p: ed.on.p };
  var link = '', apps = encodeApps(ed.slots);
  if (on.l) { link = normUrl(ed.link); if (!link) { msg.textContent = t('need_link'); var f = document.querySelector('[data-link]'); if (f) f.focus(); return; } }
  if (on.a && !apps) on.a = false;
  var pmin = parseInt(ed.pmin, 10); pmin = String(isNaN(pmin) ? 25 : Math.max(1, Math.min(99, pmin)));
  var letters = ('l' + 'a' + 'p').split('').filter(function (k) { return on[k]; }).join('');
  if (!letters) { msg.textContent = t('need_fn'); return; }
  var title = (ed.title || '').trim() || t('p_ph');
  var cfg = { on: letters, link: link, apps: on.a ? apps : '', pm: ed.pm, pmin: pmin };
  put(ed.code, { title: title, preset: 'multi', cfg: cfg }).then(function () {
    remember(ed.code, { title: title, preset: 'multi', fn: letters });
    setHash('#/write/' + ed.code);
  }, function () { msg.textContent = t('save_fail'); });
}
function vPresets(code) {
  if (!CODE_RE.test(code || '')) return setHash('#/notebooks');
  api(code).catch(function () { return null; }).then(function (nb) {
    var l = localNb(code), o = nb ? fnOf(nb) : { on: '', link: '', apps: '', pm: 'both', pmin: '25' };
    var slots = parseApps(o.apps); while (slots.length < 4) slots.push({ k: '' });
    ed = { code: code, title: nb ? nb.title : (l ? l.title : ''), on: { l: o.on.indexOf('l') >= 0, a: o.on.indexOf('a') >= 0, p: o.on.indexOf('p') >= 0 },
           link: o.link, slots: slots, pm: o.pm, pmin: o.pmin };
    drawEd();
  });
}

/* ---------- write to chip ---------- */
function vWrite(code) {
  if (!CODE_RE.test(code || '')) return setHash('#/notebooks');
  api(code).catch(function () { return null; }).then(function (nb) {
    if (!nb) return setHash('#/notebooks');
    var o = fnOf(nb), url = chipBase() + code, can = nfcOK();
    var why = !window.isSecureContext ? 'Not a secure (HTTPS) page' : (!('NDEFReader' in window) ? 'This browser has no Web NFC — use Chrome on an Android phone' : '');
    var sum = fnLabels(o.on).map(function (s) { return '<div class="li"><span class="led"></span><span>' + esc(s) + '</span></div>'; }).join('');
    shell(false, '<span class="step">' + esc(t('step', { n: 4 })) + '</span>' +
      '<div class="tv-frame"><div class="tv-screen" style="height: 200px">' + TOUCH_SVG + '<div class="avatar-glass"></div></div><div class="tv-foot"></div></div>' +
      '<h1 class="h1">' + esc(t('w_h1')) + '</h1><p class="lead">' + esc(nb.title) + '</p>' +
      '<div class="card"><div class="step" style="margin-bottom:4px">' + esc(t('w_sum')) + '</div>' + sum + '</div>' +
      (can ? '<p class="lead" style="font-size:14px">' + esc(t('w_d')) + '</p><div id="wst" class="wstat"></div><a class="cta" id="wbtn" href="#">' + esc(t('t_write')) + '</a>'
           : '<p class="lead" style="font-size:14px">' + esc(t('w_none')) + '</p><p class="lead" style="font-size:12px">' + esc(why) + '</p><div class="card urlbox" id="urlbox">' + esc(url) + '</div><a class="cta" id="cpy" href="#">' + esc(t('w_copy')) + '</a>') +
      '<a class="cta" href="#/notebooks">' + esc(t(can ? 'w_later' : 'w_done')) + '</a><p class="lead" style="font-size:12.5px">' + esc(t('w_hint')) + '</p>');
    var st = document.getElementById('wst'), btn = document.getElementById('wbtn');
    if (!can) {
      document.getElementById('cpy').addEventListener('click', function (e) {
        e.preventDefault(); var b = this;
        function done() { b.textContent = t('w_copied'); }
        try { navigator.clipboard.writeText(url).then(done, done); } catch (x) { done(); }
      });
      return;
    }
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      clearTimers();
      var ctl = new AbortController(), left = 20, fin = false; scanAbort = ctl;
      function wait() { st.className = 'wstat'; st.innerHTML = '<div class="wd">' + ssd(String(Math.floor(left / 10) % 10)) + ssd(String(left % 10)) + '</div><div>' + esc(t('w_wait', { s: '' })) + '</div>'; }
      wait(); btn.style.display = 'none';
      timer = setInterval(function () { left--; if (left <= 0) { clearInterval(timer); timer = null; try { ctl.abort(); } catch (x) {} } else wait(); }, 1000);
      function end() { if (timer) { clearInterval(timer); timer = null; } btn.style.display = ''; }
      try {
        new NDEFReader().write({ records: [{ recordType: 'url', data: url }] }, { signal: ctl.signal }).then(function () {
          fin = true; end(); st.className = 'wstat ok'; st.textContent = '✓ ' + t('w_ok'); btn.textContent = t('w_again');
          try { navigator.vibrate && navigator.vibrate(120); } catch (x) {}
        }, function (err) {
          if (fin) return; end(); st.className = 'wstat bad';
          var n = err && err.name;
          st.textContent = (n === 'NotAllowedError' ? t('w_off') : t('w_fail', { e: n === 'AbortError' ? 'timeout' : (n || 'error') })) + ' [' + (n || '?') + (err && err.message ? ': ' + String(err.message).slice(0, 70) : '') + ']';
        });
      } catch (err) { end(); st.className = 'wstat bad'; st.textContent = t('w_fail', { e: (err && err.name) || 'error' }); }
    });
  });
}

/* ---------- notebooks list ---------- */
function vNotebooks() {
  var list = nbs();
  var cards = list.map(function (n) {
    var chips = (n.fn ? fnLabels(n.fn) : [t(n.preset)]).map(function (s) { return '<span class="cap-chip">' + esc(s) + '</span>'; }).join('');
    return '<div class="card nb-card"><a class="nb-link" href="#/presets/' + esc(n.code) + '"><div class="nb-top"><span class="led"></span><span class="nb-title">' + esc(n.title) + '</span>' + ic(ICON.chev, 18, 2) + '</div>' +
      '<div class="nb-bottom"><span class="chips">' + chips + '</span><span class="nb-code">' + esc(n.code) + '</span></div></a>' +
      '<div class="nb-actions"><a class="mini-key prog" href="#/presets/' + esc(n.code) + '">' + esc(t('nb_prog')) + '</a><a class="mini-key" href="#/write/' + esc(n.code) + '">' + esc(t('nb_wr')) + '</a></div>' +
      '<div class="nb-actions nb-actions2"><a class="mini-key" href="#/tap/' + esc(n.code) + '">' + esc(t('nb_try')) + '</a><button type="button" class="mini-key" data-del="' + esc(n.code) + '">' + esc(t('nb_del')) + '</button></div></div>';
  }).join('') || '<div class="empty">' + esc(t('nb_empty')) + '</div>';
  var single = platform() === 'ios' && list.length >= 1;
  shell(false, '<span class="step">' + esc(t('nb_label')) + '</span><h1 class="h1">' + esc(t('nb_h1')) + '</h1>' + cards + (single ? '' :
    '<a class="cta" id="scanBtn" href="#/scan">' + esc(t('h_scan')) + '</a>' +
    '<a class="cta" id="addBtn" href="#/touch">' + ic(ICON.plus, 18, 2.4, '#2a2118') + esc(t('nb_add')) + '</a>'));
  Array.prototype.forEach.call(document.querySelectorAll('[data-del]'), function (b) {
    b.addEventListener('click', function () {
      var code = b.getAttribute('data-del');
      if (!window.confirm(t('nb_del_q'))) return;
      store.set('numen.nbs', nbs().filter(function (x) { return x.code !== code; }));
      delNb(code).then(function () { vNotebooks(); });
    });
  });
}

/* ---------- scan / touch ---------- */
function vScan(mode) {
  var edit = mode === 'new', nfc = nfcOK();
  shell(false, '<span class="step">' + esc(t('h_scan')).toUpperCase() + '</span>' + eyesTv() + '<h1 class="h1">' + esc(t('scan_h')) + '</h1><p class="lead">' + esc(t('scan_d')) + '</p>' +
    '<div class="step" id="scanmsg" style="text-align:center;min-height:14px">' + (nfc ? '' : esc(t('s_nonfc'))) + '</div>' +
    '<a class="cta" id="skip" href="#">' + esc(t('t_nochip')) + '</a>');
  startEyes();
  document.getElementById('skip').addEventListener('click', function (e) { e.preventDefault(); setHash('#/presets/' + randCode()); });
  if (!nfc) return;
  var handled = false;
  try {
    scanAbort = new AbortController();
    var rd = new NDEFReader();
    rd.scan({ signal: scanAbort.signal }).then(function () {
      rd.onreading = function (ev) {
        if (handled) return; handled = true;
        var recs = ev.message ? ev.message.records : [], code = null;
        for (var i = 0; i < recs.length && !code; i++) {
          try { var m = /(?:\/r\/|#\/tap\/)([A-Za-z0-9_-]{3,32})/.exec(new TextDecoder().decode(recs[i].data)); if (m) code = m[1]; } catch (e) {}
        }
        try { navigator.vibrate && navigator.vibrate(60); } catch (e) {}
        if (code) setHash(edit ? '#/presets/' + code : '#/tap/' + code);
        else setHash('#/presets/' + randCode());
      };
    }).catch(function () { var m = document.getElementById('scanmsg'); if (m) m.textContent = t('s_err'); });
  } catch (e) { var m2 = document.getElementById('scanmsg'); if (m2) m2.textContent = t('s_err'); }
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
    if (nb === null) { location.replace('#/presets/' + code); return; }
    remember(code, nb);
    var o = fnOf(nb);
    if (!o.on) { location.replace('#/presets/' + code); return; }
    var n = 2, what = fnLabels(o.on).join(' · ');
    function draw() {
      shell(false, '<span class="step">' + esc(t('tap_label')) + '</span>' +
        '<div class="tv-frame"><div class="tv-screen" style="height: 330px; flex-direction: column; gap: 18px"><span class="val mono" style="position: relative; z-index: 1; font-size: 15px; color: #e2a23b; letter-spacing: 0.04em; text-shadow: 0 0 5px rgba(226,162,59,.5)">' + esc(nb.title) + '</span>' +
        '<div style="position: relative; z-index: 1">' + ssd(String(n), 'big') + '</div><span style="position: relative; z-index: 1; font-size: 14px; color: #c9cbd0">' + esc(t('tap_opening', { x: what })) + '</span><div class="avatar-glass"></div></div><div class="tv-foot"></div></div>' +
        '<a class="cta" href="#/presets/' + esc(code) + '">' + esc(t('tap_change')) + '</a>');
    }
    draw();
    timer = setInterval(function () { n--; if (n <= 0) { clearTimers(); location.replace('#/run/' + code); } else draw(); }, 1000);
  });
}

/* ---------- run ---------- */
function withNb(code, fn) {
  if (!CODE_RE.test(code || '')) return setHash('#/notebooks');
  api(code).catch(function () { return null; }).then(function (nb) { if (!nb) return setHash('#/notebooks'); fn(nb); });
}
function beep(pm) {
  if (pm === 'vib' || pm === 'both') { try { navigator.vibrate && navigator.vibrate([250, 120, 250, 120, 250]); } catch (e) {} }
  if (pm === 'sound' || pm === 'both') {
    try {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      var ac = new C(), t0 = ac.currentTime;
      [0, 0.35, 0.7].forEach(function (o) { var os = ac.createOscillator(), g = ac.createGain(); os.frequency.value = 880; g.gain.setValueAtTime(0.0001, t0 + o); g.gain.exponentialRampToValueAtTime(0.4, t0 + o + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + o + 0.25); os.connect(g); g.connect(ac.destination); os.start(t0 + o); os.stop(t0 + o + 0.3); });
      setTimeout(function () { try { ac.close(); } catch (e) {} }, 1500);
    } catch (e) {}
  }
}
function digits(n) { var s = (n < 10 ? '0' : '') + n; return ssd(s[0], 'big2') + ssd(s[1], 'big2'); }
function vRun(code) {
  withNb(code, function (nb) {
    var o = fnOf(nb), openers = [];
    if (o.on.indexOf('l') >= 0 && o.link) openers.push({ label: t('r_link'), href: o.link });
    if (o.on.indexOf('a') >= 0) parseApps(o.apps).forEach(function (a) { var h = appHref(a); if (h) openers.push({ label: t('r_app', { x: appName(a) }), href: h }); });
    var hasP = o.on.indexOf('p') >= 0, total = Math.max(1, Math.min(99, parseInt(o.pmin, 10) || 25)) * 60, left = total, running = hasP, up = false, wl = null;
    function lock() { try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (l) { wl = l; }, function () {}); } catch (e) {} }
    function draw() {
      var btns = openers.map(function (x, i) { return '<a class="cta" href="' + esc(x.href) + '"' + (i === 0 && !hasP ? ' id="firstOpen"' : '') + '>' + esc(x.label) + '</a>'; }).join('');
      var screen = hasP
        ? '<div style="position:relative;z-index:1;display:flex;align-items:center;font-size:56px" id="dg">' + digits(Math.floor(left / 60)) + '<span class="colon"><i></i><i></i></span>' + digits(left % 60) + '</div>' + (up ? '<span style="position:relative;z-index:1;color:#e2a23b;font-size:14px">' + esc(t('r_up')) + '</span>' : '')
        : '<span class="val mono" style="position:relative;z-index:1;font-size:18px;color:#e2a23b;text-shadow:0 0 5px rgba(226,162,59,.5);text-align:center;padding:0 16px">' + esc(nb.title) + '</span>';
      shell(false, '<span class="step">' + esc(t('run_label')) + ' · ' + esc(nb.title) + '</span>' +
        '<div class="tv-frame"><div class="tv-screen" style="height: 150px;flex-direction:column;gap:8px">' + screen + '<div class="avatar-glass"></div></div><div class="tv-foot"></div></div>' +
        (hasP ? '<a class="cta" id="fgo" href="#">' + esc(t(running ? 'f_pause' : 'f_start')) + '</a><button type="button" class="cta" id="frs">' + esc(t('f_reset')) + '</button>' : '') +
        btns + '<a class="cta" href="#/presets/' + esc(code) + '">' + esc(t('tap_change')) + '</a>');
      if (hasP) {
        document.getElementById('fgo').addEventListener('click', function (e) { e.preventDefault(); if (up) { up = false; left = total; } running = !running; draw(); });
        document.getElementById('frs').addEventListener('click', function () { running = false; up = false; left = total; draw(); });
      }
    }
    draw();
    clearTimers();
    if (hasP) {
      lock();
      timer = setInterval(function () {
        if (!running) return;
        left--;
        if (left <= 0) { left = 0; running = false; up = true; beep(o.pm); draw(); return; }
        var dg = document.getElementById('dg'); if (dg) dg.innerHTML = digits(Math.floor(left / 60)) + '<span class="colon"><i></i><i></i></span>' + digits(left % 60);
      }, 1000);
    } else if (openers.length === 1) {
      timer = setTimeout(function () { location.href = openers[0].href; }, 700);
    }
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
  var views = { home: vHome, get: vGet, touch: vTouch, presets: vPresets, write: vWrite, run: vRun, notebooks: vNotebooks, tap: vTap, settings: vSettings, about: vAbout, ads: vAds, scan: vScan };
  (views[name] || vHome)(arg);
  var c = document.getElementById('content'); if (c) c.scrollTop = 0;
}
window.addEventListener('hashchange', route);

var m = location.pathname.match(/^\/r\/([A-Za-z0-9_-]{3,32})\/?$/);
if (m) { history.replaceState(null, '', '/#/tap/' + m[1]); }
fetch('api/info').then(function (r) { return r.json(); }).then(function (i) { SERVER = true; window.__lan = (i.lan && i.lan[0]) || null; }).catch(function () {}).then(route);
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
