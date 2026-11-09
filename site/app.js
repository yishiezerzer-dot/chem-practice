// Chem Practice v1 — plain JS, progress saved in localStorage.
const KEY = 'chemPractice.v1', INTERVALS = [1, 3, 7], DAY = 864e5;
let TOPICS = [], QS = [], READINGS = {}, S, view = 'home', viewArg = null;
const $ = s => document.querySelector(s), app = $('#app');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// Language: Hebrew by default, English on request. Saved apart from progress, which both languages share.
const LANG_KEY = 'chemPractice.lang';
let LANG = (() => { try { return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'he'; } catch { return 'he'; } })();
let HE = {}; // topic id -> Hebrew overlay (data/he/topics/<id>.json)
const isHe = () => LANG === 'he';
const HEB = /[֐-׿]/;
/** UI string from site/i18n/<lang>.js; a missing key falls back to English. */
const T = (k, ...a) => { const L = window.I18N[LANG] || {}; const s = k in L ? L[k] : window.I18N.en[k]; return typeof s === 'function' ? s(...a) : s; };
/** Allow trusted reading markup: <sub>, <sup>, <span class="nw">…</span>, <bdi>…</bdi> (rendered left-to-right). Everything else is escaped. */
const fmtRich = s => {
  const slots = [];
  const put = html => { slots.push(html); return `\0${slots.length - 1}\0`; };
  let str = String(s);
  let prev;
  do {
    prev = str;
    str = str.replace(/<(sub|sup)>([^<]*)<\/\1>/g, (_, t, c) => put('<' + t + '>' + esc(c) + '</' + t + '>'));
  } while (str !== prev);
  str = str.replace(/<span class="nw">([^<]*)<\/span>/g, (_, c) => put('<span class="nw">' + esc(c) + '</span>'));
  str = str.replace(/<bdi>([^<]*)<\/bdi>/g, (_, c) => put('<bdi dir="ltr">' + esc(c) + '</bdi>'));
  str = esc(str);
  do {
    prev = str;
    str = str.replace(/\0(\d+)\0/g, (_, i) => slots[i]);
  } while (str !== prev);
  return str;
};
const today = () => new Date(new Date().toDateString()).getTime();
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const fresh = s => Object.assign({ cards: {}, session: null, hideTips: false, lastExport: null, firstRating: null, nudgeHide: 0 }, s);
const qOf = id => QS.find(q => q.id === id);
const topicOf = id => TOPICS.find(t => t.id === id);
const qsFor = tid => QS.filter(q => q.topic === tid);
const isDue = id => S.cards[id] && S.cards[id].due <= today();
const ref = t => { const u = t.textbook_units.map(x => x.unit === 'F' ? 'Fundamentals' : x.unit === 'MT' ? 'Major Techniques' : 'Focus ' + x.unit).join(' + '), ts = t.textbook_topics.map(x => x.topic); return u + ' · Topic' + (ts.length > 1 ? 's ' : ' ') + ts.join(', '); };
const readingOf = tid => READINGS[tid] || null;

// Hebrew content overlay: English stays the source; Hebrew fields replace matching English ones by id.
// Anything missing in Hebrew falls back to English and is marked `_en` (shown left-to-right with an "English only" tag).
const KEEP_EN = new Set(['id', 'topic', 'type', 'ref', 'reviewed', 'topic_id', 'src']);
function overlay(en, he) {
  if (he == null) return en;
  if (Array.isArray(en)) return Array.isArray(he) ? en.map((x, i) => i < he.length ? overlay(x, he[i]) : x) : en;
  if (en && typeof en === 'object') {
    const o = { ...en };
    for (const k in en) if (!KEEP_EN.has(k) && he && typeof he === 'object' && k in he) o[k] = overlay(en[k], he[k]);
    return o;
  }
  return typeof he === typeof en ? he : en;
}
const qL = q => { if (!isHe()) return q; const h = HE[q.topic]?.questions?.[q.id]; return h ? overlay(q, h) : { ...q, _en: true }; };
function readingL(tid) {
  const r = readingOf(tid); if (!r || !isHe()) return r;
  const hr = HE[tid]?.reading;
  // Whole reading untranslated: every section is English too (`_all` = the one tag under the title is enough).
  if (!hr) return { ...r, _en: true, sections: (r.sections || []).map(s => ({ ...s, _en: true, _all: true })) };
  const byId = Object.fromEntries((hr.sections || []).map(s => [s.id, s]));
  return { ...r, sections: (r.sections || []).map(s => byId[s.id] ? overlay(s, byId[s.id]) : { ...s, _en: true }) };
}
const tName = t => isHe() ? (HE[t.id]?.name || t.topic_he || t.topic_en) : t.topic_en;
// Book references stay English (Atkins 8e); keep them left-to-right inside Hebrew pages.
const ltr = html => isHe() ? `<bdi dir="ltr">${html}</bdi>` : html;
const bookRef = t => ltr(esc(ref(t)));
const fbAttr = x => x && x._en ? ' dir="ltr" lang="en"' : '';
// Hebrew mode, translated content only: explicit RTL so a leading LTR isolate cannot flip the paragraph direction. English output is unchanged.
const dirAttr = x => x && x._en ? fbAttr(x) : isHe() ? ' dir="rtl"' : '';
const rtlList = x => isHe() && !(x && x._en) ? ' dir="rtl"' : '';
const enOnly = x => x && x._en ? `<span class="tag en-only">${esc(T('englishOnly'))}</span> ` : '';
/** Card text: English renders as before; in Hebrew mode, lines without Hebrew letters (formulas, numbers) are isolated left-to-right. */
/** Heading/label text: Hebrew may carry <bdi>(English term)</bdi>; English stays escaped as before. */
const hd = s => isHe() ? fmtRich(s) : esc(s);
const tx = s => !isHe() ? esc(s) : HEB.test(s) ? fmtRich(s) : ltr(fmtRich(s));

const plain = x => String(x == null ? '' : x).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const clip = (x, n = 300) => { x = plain(x); return x.length > n ? x.slice(0, n - 1).trimEnd() + '…' : x; };
// Prefilled GitHub issue link (no backend, no token); the reader finishes and submits it on GitHub.
// `fb` = the student saw the English fallback inside the Hebrew site.
function reportBtn(t, kind, id, text, fb) {
  const tn = plain(t.topic_en), isCard = kind === 'card';
  const q = [['title', `Review (${LANG}): ${tn} – ${id}`],
    ['body', `Topic: ${tn} (${t.id})
Language: ${LANG}${fb ? ' (content shown in English)' : ''}
${isCard ? 'Card' : 'Reading section'}: ${id}
${isCard ? 'Question' : 'Section'}: ${clip(text)}

What's wrong:
`],
    ['labels', 'review']].map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
  return `<a class="report-btn" href="https://github.com/yishiezerzer-dot/chem-practice/issues/new?${q}" target="_blank" rel="noopener noreferrer" aria-label="${esc(T('reportLabel', isCard, id))}">${esc(T('report'))}</a>`;
}

function applyLang() {
  const html = document.documentElement;
  html.lang = LANG; html.dir = isHe() ? 'rtl' : 'ltr';
  document.title = T('docTitle');
  $('#back').setAttribute('aria-label', T('back')); $('#back').textContent = T('backArrow');
  $('#secBtn').textContent = T('sections');
  $('#weakBtn').textContent = T('weakTopics');
  const lb = $('#langBtn'); lb.textContent = T('langToggle'); lb.setAttribute('aria-label', T('langToggleLabel'));
  lb.lang = isHe() ? 'en' : 'he';
}
function setLang(l) {
  LANG = l === 'en' ? 'en' : 'he';
  try { localStorage.setItem(LANG_KEY, LANG); } catch (_) {}
  applyLang(); closeLightbox();
  if (view === 'end') return go('home'); // the finished session is already cleared, so the end screen can't redraw
  render(); window.scrollTo(0, 0);
}
async function loadHe() {
  try {
    const idx = await fetch('data/he/index.json').then(x => x.json());
    const files = await Promise.all((idx.topics || []).map(id => fetch(`data/he/topics/${id}.json`).then(x => x.ok ? x.json() : null).catch(() => null)));
    files.forEach(f => { if (f && f.topic_id) HE[f.topic_id] = f; });
  } catch (_) { HE = {}; }
}

async function init() {
  const [t, q, r] = await Promise.all([
    fetch('data/topics.json').then(x => x.json()),
    fetch('data/questions.json').then(x => x.json()),
    fetch('data/readings.json').then(x => x.json()),
    loadHe()
  ]);
  TOPICS = t.topics.slice().sort((a, b) => a.order - b.order);
  QS = q.questions;
  READINGS = r.readings || {};
  S = fresh(load());
  $('#back').onclick = () => {
    if (view === 'card') {
      if (S.session?.topic === 'due') go('home');
      else go('topic', S.session?.topic);
    } else if (view === 'topic') go('reading', viewArg);
    else if (view === 'reading') go('home');
    else go('home');
  };
  $('#weakBtn').onclick = () => go('weak');
  $('#langBtn').onclick = () => setLang(isHe() ? 'en' : 'he');
  applyLang();
  $('#importFile').onchange = doImport;
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('#lightbox')) { e.preventDefault(); closeLightbox(); return; }
    if (view !== 'card') return;
    const b = { '1': '.r-didnt', '2': '.r-unsure', '3': '.r-knew' }[e.key];
    if (b && $(b)) $(b).click();
    if ((e.key === ' ' || e.key === 'Enter') && $('#show') && document.activeElement === document.body) { e.preventDefault(); $('#show').click(); }
  });
  go('home');
}
function go(v, arg) { if (view === 'reading' && v !== 'reading') stopReadProgress(); view = v; viewArg = arg; render(); window.scrollTo(0, 0); }
function setTop(title, back) {
  $('#title').textContent = title;
  $('#back').hidden = !back;
  $("#weakBtn").hidden = view !== "home";
  const sec = $('#secBtn');
  if (sec) sec.hidden = view !== 'reading';
  $('#bar').hidden = !(view === 'card' || view === 'reading');
}
function render() { ({ home, reading, topic, card, end, weak })[view](viewArg); }

function home() {
  setTop(T('appTitle'), false);
  const due = QS.filter(q => isDue(q.id)), dueTopics = new Set(due.map(q => q.topic)).size;
  const rated = Object.keys(S.cards).length;
  const since = S.lastExport || S.firstRating;
  const nudge = rated >= 20 && since && Date.now() - since >= 7 * DAY && Date.now() > S.nudgeHide;
  let h = `<div class="meta">${esc(T('course'))}</div><h2>${esc(T('pickTopic'))}</h2>`;
  const ss = S.session;
  if (ss && ss.queue.length) h += `<div class="card"><div class="cap">${esc(T('inProgress'))}</div><div>${esc(ss.topic === 'due' ? T('reviewDue') : tName(topicOf(ss.topic)))}</div><div class="meta">${esc(T('cardsLeft', ss.queue.length))}</div><button class="btn" id="resume" style="margin-top:12px">${esc(T('resume'))}</button></div>`;
  if (due.length) h += `<div class="card"><div>${esc(T('dueAcross', due.length, dueTopics))}</div><button class="btn sec" id="reviewDue" style="margin-top:12px">${esc(T('reviewDue'))}</button></div>`;
  let lastSect = '';
  for (const t of TOPICS) {
    const unit = t.textbook_units[0].unit;
    if (unit !== lastSect) { const sect = unit === 'F' ? T('sectFundamentals') : T('sectFocus', unit); h += `<div class="sect">${isHe() ? esc(sect) : ltr(esc(sect))}</div>`; lastSect = unit; }
    const qs = qsFor(t.id), n = qs.length, knew = qs.filter(q => { const h = S.cards[q.id]?.hist; return h && h[h.length - 1][1] === 'knew'; }).length, d = qs.filter(q => isDue(q.id)).length;
    h += n ? `<button class="row" data-t="${t.id}"><span class="num">${t.order}</span><span class="grow"><div>${esc(tName(t))}</div><div class="cap">${bookRef(t)} · <span class="nw">${esc(T('learned', knew, n))}</span></div></span>${d ? `<span class="badge" aria-label="${esc(T('dueBadge', d))}">${d}</span>` : ''}</button>`
           : `<div class="row" aria-disabled="true"><span class="num">${t.order}</span><span class="grow"><div class="meta">${esc(tName(t))}</div><div class="cap">${bookRef(t)} · ${esc(T('comingSoon'))}</div></span></div>`;
  }
  if (nudge) h += `<div class="nudge" style="margin-top:16px"><span>${esc(T('backupNudge'))}</span><button class="link" id="nudgeX" aria-label="${esc(T('dismiss'))}">✕</button></div>`;
  h += `<p class="cap" style="margin-top:24px">${esc(T('savedHere'))}</p><button class="link" id="exp">${esc(T('exportProgress'))}</button><button class="link" id="imp">${esc(T('importProgress'))}</button>`;
  app.innerHTML = `<div class="fade">${h}</div>`;
  app.querySelectorAll('[data-t]').forEach(b => b.onclick = () => go('reading', b.dataset.t));
  $('#resume') && ($('#resume').onclick = () => go('card'));
  $('#reviewDue') && ($('#reviewDue').onclick = () => start('due', due.map(q => q.id)));
  $('#nudgeX') && ($('#nudgeX').onclick = () => { S.nudgeHide = Date.now() + 7 * DAY; save(); render(); });
  $('#exp').onclick = doExport; $('#imp').onclick = () => $('#importFile').click();
}

function secAnchorId(sec, i) {
  if (sec.id) return String(sec.id).replace(/[^a-zA-Z0-9_-]/g, '-');
  const base = String(sec.heading || 'section').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return (base || 'section') + '-' + i;
}
function renderWorked(w, fb) {
  if (!w) return '';
  const steps = (w.steps || []).map(s => `<li>${fmtRich(s)}</li>`).join('');
  return `<div class="worked" data-worked="1"><div class="cap">${esc(T('workedExample'))}</div><div class="worked-title">${fmtRich(w.title || '')}</div><ol class="steps"${rtlList({ _en: fb })}>${steps}</ol></div>`;
}
function renderSection(sec, i, t) {
  let h = '';
  const aid = secAnchorId(sec, i);
  if (sec.heading) h += `<h3 class="rh" id="${esc(aid)}">${hd(sec.heading)}</h3>`;
  if (sec._en && !sec._all) h += `<p class="cap" style="margin:0 0 8px">${enOnly(sec)}</p>`;
  (sec.paragraphs || []).forEach(p => { h += `<p class="rp">${fmtRich(p)}</p>`; });
  if (sec.why) {
    h += `<div class="callout callout-why" data-why="1"><div class="cap">${esc(T('whyMatters'))}</div><p class="rp" style="margin:0">${fmtRich(sec.why)}</p></div>`;
  }
  const works = [];
  if (sec.worked) works.push(sec.worked);
  (sec.workedExamples || []).forEach(w => works.push(w));
  works.forEach(w => { h += renderWorked(w, sec._en); });
  if (sec.mistake) {
    const m = sec.mistake;
    h += `<div class="callout callout-mistake" data-mistake="1"><div class="cap">${esc(T('commonMistake'))}</div>`;
    if (m.wrong) h += `<p class="rp"><strong>${esc(T('wrongApproach'))}</strong> ${fmtRich(m.wrong)}</p>`;
    if (m.whyWrong) h += `<p class="rp"><strong>${esc(T('whyWrong'))}</strong> ${fmtRich(m.whyWrong)}</p>`;
    if (m.correct) h += `<p class="rp"><strong>${esc(T('doInstead'))}</strong> ${fmtRich(m.correct)}</p>`;
    h += `</div>`;
  }
  if (sec.check && (sec.check.items || []).length) {
    const chk = sec.check;
    const headingIsCheck = /check yourself/i.test(sec.heading || '') || /check yourself/i.test(chk.title || '') || (!!chk.title && chk.title === sec.heading);
    h += `<div class="callout callout-check" data-check="1">`;
    // Avoid a second "Check yourself" when the section H3 already says it
    if (chk.title && !headingIsCheck) h += `<div class="cap">${hd(chk.title)}</div>`;
    if (chk.intro) h += `<p class="rp" style="margin:0 0 8px">${fmtRich(chk.intro)}</p>`;
    h += `<ol class="check-list">`;
    chk.items.forEach((it, qi) => {
      const aid = `check-a-${i}-${qi}`;
      h += `<li><div class="check-q">${fmtRich(it.q || '')}</div>`;
      h += `<button type="button" class="btn-show-ans" data-show-ans="1" aria-expanded="false" aria-controls="${aid}">${esc(T('showAnswer'))}</button>`;
      h += `<div class="check-a" id="${aid}" hidden>${fmtRich(it.a || '')}</div></li>`;
    });
    h += `</ol></div>`;
  }
  if (sec.svg) {
    // Trusted inline SVG from our own readings.json (not user input)
    h += `<div class="rfig" role="figure">${sec.svg}</div>`;
  }
  if (sec.figure) {
    if (sec.figure.src) {
      const alt = esc(sec.figure.alt || T('figure'));
      const src = sec.figure.src;
      const full = src.replace(/\.svg$/i, '.png');
      h += `<div class="rfig" role="figure"><button type="button" class="rsketch-btn" data-sketch-btn="1"><img class="rsketch" src="${esc(src)}" data-full="${esc(full)}" alt="${alt}" loading="lazy" decoding="async"/></button><div class="rsketch-hint">${esc(T('tapToEnlarge'))}</div></div>`;
    } else if (sec.figure.status === 'pending-sketch') {
      h += figPlaceholder(sec.figure.note, 'data-pending-sketch="1"');
    }
  }
  h += reportBtn(t, 'section', sec.id || 's' + (i + 1), sec.heading || '', sec._en);
  return h;
}

function figPlaceholder(note, attr = '') {
  return `<div class="placeholder" ${attr}><div class="cap">${esc(T('figureSoon'))}</div><p class="rp" style="margin:4px 0 0">${esc(note || T('sketcherNote'))}</p></div>`;
}
// Missing or failed sketch images: swap the broken <img> for the dashed placeholder (DESIGN §3b).
// Capture phase, because image error events do not bubble.
document.addEventListener('error', e => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement)) return;
  if (img.hasAttribute('data-lightbox-img')) {
    const fb = img.getAttribute('data-fallback');
    if (fb && img.getAttribute('src') !== fb) img.setAttribute('src', fb);
    else closeLightbox();
    return;
  }
  const box = img.closest('.rfig, .qimg');
  if (!box || !img.matches('img.rsketch, .qimg img')) return;
  box.outerHTML = figPlaceholder(img.getAttribute('alt'), 'data-missing-sketch="1"');
}, true);

function updateReadProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const pct = max > 0 ? Math.min(100, Math.max(0, 100 * scrollY / max)) : 0;
  const fill = $('#bar div'); if (fill) fill.style.width = pct + '%';
}
function stopReadProgress() {
  removeEventListener('scroll', updateReadProgress);
  const fill = $('#bar div'); if (fill && view !== 'card') fill.style.width = '0%';
}

let lightboxReturnFocus = null;
function closeLightbox() {
  const lb = $('#lightbox');
  if (!lb) return;
  lb.remove();
  document.body.style.overflow = '';
  if (lightboxReturnFocus && typeof lightboxReturnFocus.focus === 'function') {
    try { lightboxReturnFocus.focus(); } catch (_) {}
  }
  lightboxReturnFocus = null;
}
function openLightbox(fromBtn) {
  const img = fromBtn.querySelector('img.rsketch') || fromBtn;
  const alt = img.getAttribute('alt') || T('figure');
  const full = img.getAttribute('data-full') || img.getAttribute('src') || '';
  const inlineW = Math.max(1, img.getBoundingClientRect().width || img.clientWidth || 320);
  const targetW = Math.max(inlineW * 2, 361); // 2× page CSS width, larger than 360 viewport
  closeLightbox();
  lightboxReturnFocus = fromBtn;
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.className = 'lightbox';
  lb.dir = 'ltr'; // drawings and their scroll position stay left-to-right in both languages
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', alt);
  lb.dataset.inlineWidth = String(inlineW);
  lb.innerHTML = `<button type="button" class="lightbox-close" aria-label="${esc(T('close'))}">✕</button>`
    + `<div class="lightbox-scroll" data-lightbox-scroll="1">`
    + `<img src="${esc(full)}" alt="${esc(alt)}" style="width:${targetW}px;max-width:none;height:auto" data-lightbox-img="1" data-fallback="${esc(img.getAttribute('src') || '')}"/>`
    + `</div>`;
  document.body.appendChild(lb);
  document.body.style.overflow = 'hidden';
  const closer = lb.querySelector('.lightbox-close');
  const sc = lb.querySelector('.lightbox-scroll');
  const big = sc.querySelector('img');
  closer.onclick = e => { e.stopPropagation(); closeLightbox(); };
  // Backdrop / empty scroll area closes; image click does not
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  sc.addEventListener('click', e => { if (e.target === sc) closeLightbox(); });
  big.addEventListener('click', e => e.stopPropagation());
  const scrollToCenterLeft = () => {
    const maxX = Math.max(0, sc.scrollWidth - sc.clientWidth);
    const maxY = Math.max(0, sc.scrollHeight - sc.clientHeight);
    // center-left: ~25% across horizontally, vertically centered
    sc.scrollLeft = maxX * 0.25;
    sc.scrollTop = maxY * 0.5;
  };
  if (big.complete) scrollToCenterLeft();
  else big.addEventListener('load', scrollToCenterLeft, { once: true });
  // Layout may settle a frame later
  requestAnimationFrame(() => requestAnimationFrame(scrollToCenterLeft));
  closer.focus();
}
function wireSketchLightbox() {
  document.querySelectorAll('[data-sketch-btn]').forEach(btn => {
    btn.onclick = () => openLightbox(btn);
  });
}

function reading(tid) {
  const t = topicOf(tid), r = readingL(tid), qs = qsFor(tid);
  setTop(T('reading'), true);
  let h = `<div class="meta">${bookRef(t)}</div><h2>${esc(tName(t))}</h2>`;
  // Order under H1: Draft badge → Skip to cards → In this reading TOC
  if (r && !r.reviewed) h += `<div class="cap" data-draft-badge="1">${esc(T('draft'))}</div>`;
  if (r && r._en) h += `<div class="cap">${enOnly(r)}</div>`;
  h += `<div class="read-actions"><button class="link" id="skipCards" style="padding-inline:0">${esc(T('skipToCards'))}</button></div>`;
  if (!r) {
    h += `<div class="card"><p class="rp">${esc(T('noReading'))}</p></div>`;
  } else {
    const secs = r.sections || [];
    if (secs.length) {
      h += `<nav class="rtoc" id="readingToc" aria-label="${esc(T('inThisReading'))}"><div class="cap">${esc(T('inThisReading'))}</div><ol class="rtoc-list"${isHe() ? (r._en ? ' dir="ltr"' : ' dir="rtl"') : ''}>`;
      secs.forEach((sec, i) => {
        const aid = secAnchorId(sec, i);
        const label = sec.heading || T('sectionN', i + 1);
        h += `<li${fbAttr(sec)}><a class="rtoc-link" href="#${esc(aid)}">${hd(label)}</a></li>`;
      });
      h += `</ol></nav>`;
    }
    h += `<div class="reading">`;
    secs.forEach((sec, i) => {
      const aid = secAnchorId(sec, i);
      h += `<section class="rsec" id="sec-${esc(aid)}"${fbAttr(sec)}>${renderSection(sec, i, t)}</section>`;
    });
    h += `</div>`;
  }
  h += `<div class="sticky" id="readEnd"><button class="btn" id="startPractice">${esc(T('startPractice', qs.length))}</button></div>`;
  app.innerHTML = `<div class="fade">${h}</div>`;
  $('#skipCards').onclick = () => { stopReadProgress(); go('topic', tid); };
  $('#startPractice').onclick = () => { stopReadProgress(); start(tid, qs.map(q => q.id)); };
  // Clear last reading content above sticky Start practice (bar height + 16 + safe-area)
  const readEl = document.querySelector('.reading');
  const endEl = $('#readEnd');
  if (readEl && endEl) readEl.style.paddingBottom = (endEl.offsetHeight + 16) + 'px';
  wireSketchLightbox();
  document.querySelectorAll('[data-show-ans]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('aria-controls');
      const ans = id ? document.getElementById(id) : null;
      if (!ans) return;
      const open = btn.getAttribute('aria-expanded') === 'true';
      const next = !open;
      btn.setAttribute('aria-expanded', next ? 'true' : 'false');
      ans.hidden = !next;
      btn.textContent = next ? T('hideAnswer') : T('showAnswer');
    };
  });
  const secBtn = $('#secBtn');
  if (secBtn) {
    secBtn.onclick = () => {
      const toc = document.getElementById('readingToc') || document.querySelector('.rtoc');
      if (!toc) return;
      // Offset for sticky top bar (56) + breathing room; auto scroll so it always lands
      const top = toc.getBoundingClientRect().top + window.pageYOffset - 68;
      window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    };
  }
  $('#bar div').style.width = '0%';
  removeEventListener('scroll', updateReadProgress);
  addEventListener('scroll', updateReadProgress, { passive: true });
  updateReadProgress();
}

function topic(tid) {
  const t = topicOf(tid), qs = qsFor(tid); setTop(tName(t), true);
  let h = `<div class="meta">${bookRef(t)}</div><h2>${esc(tName(t))}</h2>`;
  h += `<button class="link" id="reopenReading" style="padding-inline:0;margin-bottom:8px">${esc(T('readAgain'))}</button>`;
  qs.forEach((q, i) => { const c = S.cards[q.id], lq = qL(q); h += `<div class="row" style="cursor:default"><span class="num">${i + 1}</span><span class="grow"${dirAttr(lq)}>${tx(lq.q)}</span><span class="cap">${esc(c ? (isDue(q.id) ? T('due') : T('done')) : T('new'))}</span></div>`; });
  h += `<div class="sticky"><button class="btn" id="go">${esc(T('startPractice', qs.length))}</button></div>`;
  app.innerHTML = `<div class="fade">${h}</div>`;
  $('#reopenReading').onclick = () => go('reading', tid);
  $('#go').onclick = () => start(tid, qs.map(q => q.id));
}

function start(tid, ids) { S.session = { topic: tid, queue: [...ids], total: ids.length, worst: {}, seen: {} }; save(); go('card'); }

const rank = { knew: 0, unsure: 1, didnt: 2 };
function nextStep(id, worst) { const c = S.cards[id]; const cur = c ? c.step : -1; return worst === 'didnt' ? 0 : worst === 'unsure' ? Math.max(cur, 0) : Math.min(cur + 1, 2); }
function card() {
  const ss = S.session; if (!ss || !ss.queue.length) return go('home');
  const q = qL(qOf(ss.queue[0])), t = topicOf(q.topic), calc = q.type === 'calc';
  const done = ss.total - new Set(ss.queue).size;
  setTop(T('cardNofM', done + 1, ss.total), true); $('#bar div').style.width = (100 * done / ss.total) + '%';
  const tip = esc(calc ? T('tipCalc') : T('tipConcept'));
  let h = `<div class="cap">${esc(tName(t))} · <span class="tag">${esc(calc ? T('calculation') : T('concept'))}</span> ${enOnly(q)}</div>
  <div class="card" style="margin-top:8px"><div${dirAttr(q)}><p style="margin:0">${tx(q.q)}</p>${calc && q.given ? `<div class="given"><div class="cap">${esc(T('given'))}</div>${q.given.map(g => `<div>${tx(g)}</div>`).join('')}</div>` : ''}</div>${reportBtn(t, 'card', q.id, q.q, q._en)}</div>
  ${S.hideTips ? `<div class="cap tipline">${tip}</div>` : `<div class="tipbox"><span aria-hidden="true">💡</span><span class="grow">${tip}</span><button class="link" id="hideTips" style="padding:0 4px;min-height:24px">${esc(T('hideTips'))}</button></div>`}
  <div id="rev"></div><div class="sticky" id="act"><button class="btn" id="show">${esc(T('showAnswer'))}</button></div>`;
  app.innerHTML = `<div class="fade">${h}</div>`;
  $('#hideTips') && ($('#hideTips').onclick = () => { S.hideTips = true; save(); card(); });
  $('#show').onclick = () => reveal(q, t);
}
// keep equations readable: break only before '=', keep numbers with their units
function fmtStep(s) {
  return s.split(' = ').map((seg, i) => {
    let h = esc(seg).replace(/(\d) (?=[A-Za-z%°µμ])/g, '$1\u00a0');
    h = (i ? '= ' : '') + h;
    return seg.length <= 42 ? `<span class="nw">${h}</span>` : h;
  }).join(' ');
}
function qImage(q) {
  if (!q.image) return '';
  const src = esc(q.image);
  const alt = esc(q.imageAlt || T('answerFigure'));
  return `<div class="qimg"><img src="${src}" alt="${alt}" loading="lazy"></div>`;
}
function reveal(q, t) {
  document.querySelectorAll('.tipbox, .tipline').forEach(e => e.remove());
  const ss = S.session, rest = ss.queue.length - 1, worst = ss.worst[q.id] || 'knew';
  const gap = (n) => esc(rest < n ? T('atEnd') : T('inCards', n));
  const ns = nextStep(q.id, worst), knewLbl = esc(T('nextIn', INTERVALS[ns]));
  // Hebrew steps: Hebrew lines use the reading markup; formula-only lines are isolated left-to-right.
  // A formula-only line is one unbreakable left-to-right unit (CSS lets it scroll sideways); English-fallback cards keep the English layout.
  const step = s => !isHe() || q._en ? fmtStep(s) : HEB.test(s) ? fmtRich(s) : ltr(fmtRich(s));
  $('#rev').innerHTML = `<div class="card fade" id="answer"><div class="cap">${esc(T('answer'))}</div><div${dirAttr(q)}><div class="ans">${q.type === 'calc' ? `<span class="ansbox">${tx(q.answer)}</span>` : tx(q.answer)}</div>
  ${qImage(q)}
  ${q.type === 'calc' ? `<ol class="steps"${rtlList(q)}>${q.steps.map(s => `<li>${step(s)}</li>`).join('')}</ol>` : `<p>${tx(q.explanation)}</p>`}</div>
  <div class="meta">${ltr(`📖 Atkins 8e · ${esc(q.ref)}`)}</div>${q.reviewed ? '' : `<div class="cap">${esc(T('draft'))}</div>`}</div>`;
  $('#act').innerHTML = `<div class="rate"><button class="r-didnt" data-r="didnt"><b>${esc(T('didnt'))}</b><small>${gap(3)}</small></button><button class="r-unsure" data-r="unsure"><b>${esc(T('unsure'))}</b><small>${gap(8)}</small></button><button class="r-knew" data-r="knew"><b>${esc(T('knew'))}</b><small>${knewLbl}</small></button></div>`;
  $('#act').querySelectorAll('button').forEach(b => b.onclick = () => rate(q.id, b.dataset.r));
  const top = $('#answer').getBoundingClientRect().top + scrollY - 56 - 16; scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
function rate(id, r) {
  const ss = S.session; ss.queue.shift();
  const w = ss.worst[id]; if (!w || rank[r] > rank[w]) ss.worst[id] = r;
  const c = S.cards[id] || { step: -1, hist: [] }; c.hist = (c.hist || []).concat([[Date.now(), r]]); S.cards[id] = c;
  S.firstRating = S.firstRating || Date.now();
  if (r === 'didnt') ss.queue.splice(Math.min(3, ss.queue.length), 0, id);
  else if (r === 'unsure') ss.queue.splice(Math.min(8, ss.queue.length), 0, id);
  else { c.step = nextStep(id, ss.worst[id]); c.due = today() + INTERVALS[c.step] * DAY; c.fresh = false; }
  if (c.step < 0) { c.step = 0; c.due = today() + DAY; } // keeps the card listed until it's finished
  save();
  ss.queue.length ? go('card') : go('end');
}

function end() {
  const ss = S.session; setTop('', true); $('#back').hidden = true;
  const ids = Object.keys(ss.worst), first = ids.filter(i => ss.worst[i] === 'knew').length;
  const hard = ids.filter(i => ss.worst[i] !== 'knew').sort((a, b) => rank[ss.worst[b]] - rank[ss.worst[a]]).slice(0, 3);
  app.innerHTML = `<div class="fade"><h2>${esc(T('topicDone'))}</h2><div class="card"><div>${esc(T('firstTry'))}: <b>${first}</b> · ${esc(T('anotherGo'))}: <b>${ids.length - first}</b></div></div>
  ${hard.length ? `<div class="meta">${esc(T('hardest'))}</div>${hard.map(i => { const lq = qL(qOf(i)); return `<div class="row" style="cursor:default"><span class="grow"${dirAttr(lq)}>${tx(lq.q)}</span></div>`; }).join('')}` : ''}
  <div class="sticky"><button class="btn" id="home">${esc(T('backToTopics'))}</button>${hard.length ? `<button class="btn sec" id="again" style="margin-top:8px">${esc(T('reviewHardest'))}</button>` : ''}</div></div>`;
  const t = ss.topic; S.session = null; save();
  $('#home').onclick = () => go('home');
  $('#again') && ($('#again').onclick = () => start(t, hard));
}

function weak() {
  setTop('', true);
  const since = Date.now() - 14 * DAY, rows = [], few = [];
  for (const t of TOPICS) {
    let k = 0, u = 0, d = 0;
    qsFor(t.id).forEach(q => (S.cards[q.id]?.hist || []).forEach(([ts, r]) => { if (ts >= since) r === 'knew' ? k++ : r === 'unsure' ? u++ : d++; }));
    const n = k + u + d; if (!n) continue;
    (n >= 10 ? rows : few).push({ t, k, u, d, n, score: (d * 2 + u) / n });
  }
  rows.sort((a, b) => b.score - a.score || b.d - a.d);
  const row = x => `<div class="card"><div>${esc(tName(x.t))}</div><div class="cap">${bookRef(x.t)}</div><div class="stack" role="img" aria-label="${esc(T('weakCounts', x.d, x.u, x.k))}"><span style="width:${100 * x.d / x.n}%;background:var(--didnt)"></span><span style="width:${100 * x.u / x.n}%;background:var(--unsure)"></span><span style="width:${100 * x.k / x.n}%;background:var(--knew)"></span></div><div class="cap">${esc(T('weakCounts', x.d, x.u, x.k))}</div><button class="btn sec" data-t="${x.t.id}" style="margin-top:8px">${esc(T('practice'))}</button></div>`;
  let h = `<h2>${esc(T('weakTopics'))}</h2>`;
  if (!rows.length && !few.length) h += `<p class="meta">${esc(T('noWeak'))}</p>`;
  h += rows.map(row).join('');
  if (few.length) h += `<div class="sect">${esc(T('notEnough'))}</div>` + few.map(row).join('');
  h += `<p class="cap">${esc(T('untriedHidden'))}</p>`;
  app.innerHTML = `<div class="fade">${h}</div>`;
  app.querySelectorAll('[data-t]').forEach(b => b.onclick = () => go('reading', b.dataset.t));
}

function doExport() {
  S.lastExport = Date.now(); save();
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }));
  a.download = 'chem-practice-progress.json'; a.click(); render();
}
function doImport(e) {
  const f = e.target.files[0]; if (!f) return; e.target.value = '';
  f.text().then(txt => {
    let data; try { data = JSON.parse(txt); if (!data.cards) throw 0; } catch { alert(T('badBackup')); return; }
    const dlg = document.createElement('dialog');
    dlg.innerHTML = `<p>${esc(T('replaceWarn'))}</p><div style="display:flex;gap:8px"><button class="btn sec" value="no">${esc(T('cancel'))}</button><button class="btn" value="yes">${esc(T('replace'))}</button></div>`;
    document.body.append(dlg); dlg.showModal();
    dlg.querySelectorAll('button').forEach(b => b.onclick = () => { if (b.value === 'yes') { S = fresh(data); save(); go('home'); } dlg.close(); dlg.remove(); });
  });
}
init();
