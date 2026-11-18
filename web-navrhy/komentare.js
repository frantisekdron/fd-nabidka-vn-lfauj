// Na Vinici · návrhy webu: karty návrhů, 3D prohlídky v okně, připomínky a výběr návrhu (bez účtu).
// Připomínky a výběr jdou přes ntfy (stejné téma jako předání) → náš inbox → Telegram Franty a zpět do odpovedi.json.
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const TOPIC = 'fd-nabidky-48c2f0103d78';
const TIT = 'Valtice · návrhy webu · ';
const ODKAZ = location.origin + location.pathname;
const NAZEV = { a: 'A · Z ulice', b: 'B · Ze zahrady', c: 'C · Z nadhledu', vse: 'všechny návrhy' };
const KEY = 'fdkom:' + location.pathname;
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const posli = (title, message, tags) => fetch('https://ntfy.sh/', { method: 'POST',
  body: JSON.stringify({ topic: TOPIC, title, message, tags: tags || [], click: ODKAZ }) })
  .then((r) => { if (!r.ok) throw new Error(r.status); return r; });

// ------------------------------------------------ karty návrhů → záložka + delší náhled
const viewer = $('.viewer');
function oznac() {
  const akt = ($('[role=tab][aria-selected=true]') || {}).dataset?.id || 'a';
  $$('.pick').forEach((p) => p.setAttribute('aria-current', String(p.dataset.pick === akt)));
  const v = $('.kom-nahled .kvar');
  if (v && !v.dataset.rucne) v.value = akt;
}
$$('.pick').forEach((p) => p.addEventListener('click', () => {
  $('#tab-' + p.dataset.pick).click();
  viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}));
$$('[role=tab]').forEach((t) => new MutationObserver(oznac).observe(t, { attributes: true, attributeFilter: ['aria-selected'] }));
oznac();

// ------------------------------------------------ 3D model a prohlídky v okně přes celou stránku
const ov = $('#tour-overlay'), fr = $('#tour-frame');
const ZDROJ = { model: ['../predani/model/', 'Domy na pozemku ve 3D'],
  1: ['../predani/prohlidka-1/?start=vstup', 'Dům 1 · 3D prohlídka'],
  2: ['../predani/prohlidka-2/?start=vstup', 'Dům 2 · 3D prohlídka'],
  3: ['../predani/prohlidka-3/?start=vstup', 'Dům 3 · 3D prohlídka'] };
let odkud = null;
function otevri(k, zHistorie) {
  const [url, nazev] = ZDROJ[k];
  const abs = new URL(url, location.href).href;
  const f = document.createElement('iframe');
  f.title = nazev; f.src = abs; f.allow = 'fullscreen; xr-spatial-tracking; gyroscope; accelerometer'; f.allowFullscreen = true;
  fr.replaceChildren(f);
  $('#tour-title').textContent = nazev; $('#tour-new').href = abs;
  ov.hidden = false; document.documentElement.classList.add('tour-on');
  if (!zHistorie) history.pushState({ prohlidka: k }, '', '#prohlidka-' + k);
  setTimeout(() => f.focus(), 300);
}
function zavri(zHistorie) {
  if (ov.hidden) return;
  fr.replaceChildren(); ov.hidden = true; document.documentElement.classList.remove('tour-on');
  if (!zHistorie && history.state && history.state.prohlidka) history.back();
  if (odkud) odkud.focus();
}
$$('[data-tour]').forEach((b) => b.addEventListener('click', () => { odkud = b; otevri(b.dataset.tour); }));
$('#tour-back').addEventListener('click', () => zavri(false));
addEventListener('keydown', (e) => { if (e.key === 'Escape') zavri(false); });
addEventListener('popstate', (e) => { if (e.state && e.state.prohlidka) otevri(e.state.prohlidka, true); else zavri(true); });
const hm = location.hash.match(/^#prohlidka-(model|[123])$/);
if (hm) { history.replaceState(null, '', location.pathname + location.search); history.pushState({ prohlidka: hm[1] }, '', '#prohlidka-' + hm[1]); otevri(hm[1], true); }

// ------------------------------------------------ připomínky ke všem částem
let moje = []; try { moje = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) {}
let web = [];
function titul(k) { return TIT + 'komentář: ' + k.dataset.s; }
function kresli() {
  $$('.kom').forEach((k) => {
    const t = titul(k), vid = {}; let h = '';
    web.filter((r) => (r.nabidka || '') === t).forEach((r) => {
      vid[r.zprava] = 1;
      h += '<div><small>Odesláno ' + r.cas.slice(8, 10).replace(/^0/, '') + '. ' + String(+r.cas.slice(5, 7)) + '. ' + r.cas.slice(11) + '</small>' + esc(r.zprava) + '</div>';
    });
    moje.filter((m) => m.t === t && !vid[m.z]).forEach((m) => { h += '<div><small>Odesláno ' + m.c + '</small>' + esc(m.z) + '</div>'; });
    $('.kl', k).innerHTML = h;
  });
}
fetch('https://raw.githubusercontent.com/frantisekdron/fd-nabidka-vn-lfauj/main/web-navrhy/odpovedi.json?t=' + Date.now(), { cache: 'no-store' })
  .then((r) => (r.ok ? r.json() : [])).then((d) => { web = Array.isArray(d) ? d : []; kresli(); }).catch(() => {});
kresli();
$$('.kom').forEach((k) => {
  const kf = $('.kf', k), st = $('.kst', k), ta = $('textarea', k), btn = $('.ks', k);
  $('.kb', k).addEventListener('click', () => { kf.hidden = !kf.hidden; if (!kf.hidden) ta.focus(); });
  const v = $('.kvar', k); if (v) v.addEventListener('change', () => { v.dataset.rucne = '1'; });
  btn.addEventListener('click', () => {
    const t = ta.value.trim();
    if (!t) { st.className = 'kst err'; st.textContent = 'Napište prosím připomínku.'; ta.focus(); return; }
    const radky = [];
    if (v) radky.push('Návrh: ' + NAZEV[v.value]);
    const sek = $('.ksek', k); if (sek) radky.push('Sekce: ' + sek.value);
    radky.push(t);
    const zprava = radky.join('\n');
    btn.disabled = true; st.className = 'kst'; st.textContent = 'Odesílám…';
    posli(titul(k), zprava, ['speech_balloon']).then(() => {
      const d = new Date();
      moje.push({ t: titul(k), z: zprava, c: d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.toTimeString().slice(0, 5) });
      try { localStorage.setItem(KEY, JSON.stringify(moje.slice(-50))); } catch (e) {}
      ta.value = ''; st.className = 'kst ok'; st.textContent = '✓ Odesláno. Děkujeme, připomínka nám přišla.'; kresli();
    }).catch(() => { st.className = 'kst err'; st.textContent = 'Nepodařilo se odeslat. Zkuste to prosím znovu, nebo napište na honza@frantisekdron.cz.'; })
      .finally(() => { btn.disabled = false; });
  });
});

// ------------------------------------------------ odeslání vybraného návrhu
const sel = $('#approval-variant'), pozn = $('#approval-notes'), ast = $('#approval-status'), abtn = $('#approval-send');
abtn.addEventListener('click', () => {
  const n = NAZEV[sel.value], p = pozn.value.trim();
  abtn.disabled = true; ast.className = 'kst'; ast.textContent = 'Odesílám…';
  posli(TIT + 'VÝBĚR návrhu', 'Vybraný návrh: ' + n + (p ? '\nPoznámka: ' + p : ''), ['white_check_mark']).then(() => {
    ast.className = 'kst ok'; ast.textContent = '✓ Výběr návrhu ' + n + ' jsme přijali. Ozveme se s dalším postupem.';
  }).catch(() => { ast.className = 'kst err'; ast.textContent = 'Nepodařilo se odeslat. Zkuste to prosím znovu, nebo použijte e-mail níže.'; })
    .finally(() => { abtn.disabled = false; });
});
})();
