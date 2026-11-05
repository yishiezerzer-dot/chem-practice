// Chem Practice v1 — plain JS, progress saved in localStorage.
const KEY = 'chemPractice.v1', INTERVALS = [1, 3, 7], DAY = 864e5;
let TOPICS = [], QS = [], READINGS = {}, S, view = 'home', viewArg = null;
const $ = s => document.querySelector(s), app = $('#app');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
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

async function init() {
  const [t, q, r] = await Promise.all([
    fetch('data/topics.json').then(x => x.json()),
    fetch('data/questions.json').then(x => x.json()),
    fetch('data/readings.json').then(x => x.json())
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
  setTop('Chem Practice', false);
  const due = QS.filter(q => isDue(q.id)), dueTopics = new Set(due.map(q => q.topic)).size;
  const rated = Object.keys(S.cards).length;
  const since = S.lastExport || S.firstRating;
  const nudge = rated >= 20 && since && Date.now() - since >= 7 * DAY && Date.now() > S.nudgeHide;
  let h = `<div class="meta">69107 · Introduction to Chemistry</div><h2>Pick a topic</h2>`;
  const ss = S.session;
  if (ss && ss.queue.length) h += `<div class="card"><div class="cap">In progress</div><div>${esc(ss.topic === 'due' ? 'Review due' : topicOf(ss.topic).topic_en)}</div><div class="meta">${ss.queue.length} cards left</div><button class="btn" id="resume" style="margin-top:12px">Resume</button></div>`;
  if (due.length) h += `<div class="card"><div>${due.length} card${due.length > 1 ? 's' : ''} due across ${dueTopics} topic${dueTopics > 1 ? 's' : ''}</div><button class="btn sec" id="reviewDue" style="margin-top:12px">Review due</button></div>`;
  let lastSect = '';
  for (const t of TOPICS) {
    const sect = t.textbook_units[0].unit === 'F' ? 'Fundamentals' : 'Focus ' + t.textbook_units[0].unit;
    if (sect !== lastSect) { h += `<div class="sect">${esc(sect)}</div>`; lastSect = sect; }
    const qs = qsFor(t.id), n = qs.length, knew = qs.filter(q => { const h = S.cards[q.id]?.hist; return h && h[h.length - 1][1] === 'knew'; }).length, d = qs.filter(q => isDue(q.id)).length;
    h += n ? `<button class="row" data-t="${t.id}"><span class="num">${t.order}</span><span class="grow"><div>${esc(t.topic_en)}</div><div class="cap">${esc(ref(t))} · <span class="nw">${knew}/${n} learned</span></div></span>${d ? `<span class="badge" aria-label="${d} due">${d}</span>` : ''}</button>`
           : `<div class="row" aria-disabled="true"><span class="num">${t.order}</span><span class="grow"><div class="meta">${esc(t.topic_en)}</div><div class="cap">${esc(ref(t))} · Coming soon</div></span></div>`;
  }
  if (nudge) h += `<div class="nudge" style="margin-top:16px"><span>Back up your progress</span><button class="link" id="nudgeX" aria-label="Dismiss">✕</button></div>`;
  h += `<p class="cap" style="margin-top:24px">Progress is saved on this device only.</p><button class="link" id="exp">Export progress</button><button class="link" id="imp">Import progress</button>`;
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
function renderWorked(w) {
  if (!w) return '';
  const steps = (w.steps || []).map(s => `<li>${esc(s)}</li>`).join('');
  return `<div class="worked" data-worked="1"><div class="cap">Worked example</div><div class="worked-title">${esc(w.title || '')}</div><ol class="steps">${steps}</ol></div>`;
}
function renderSection(sec, i) {
  let h = '';
  const aid = secAnchorId(sec, i);
  if (sec.heading) h += `<h3 class="rh" id="${esc(aid)}">${esc(sec.heading)}</h3>`;
  (sec.paragraphs || []).forEach(p => { h += `<p class="rp">${esc(p)}</p>`; });
  if (sec.why) {
    h += `<div class="callout callout-why" data-why="1"><div class="cap">Why this matters</div><p class="rp" style="margin:0">${esc(sec.why)}</p></div>`;
  }
  const works = [];
  if (sec.worked) works.push(sec.worked);
  (sec.workedExamples || []).forEach(w => works.push(w));
  works.forEach(w => { h += renderWorked(w); });
  if (sec.mistake) {
    const m = sec.mistake;
    h += `<div class="callout callout-mistake" data-mistake="1"><div class="cap">Common mistake</div>`;
    if (m.wrong) h += `<p class="rp"><strong>Wrong approach.</strong> ${esc(m.wrong)}</p>`;
    if (m.whyWrong) h += `<p class="rp"><strong>Why it is wrong.</strong> ${esc(m.whyWrong)}</p>`;
    if (m.correct) h += `<p class="rp"><strong>Correct way.</strong> ${esc(m.correct)}</p>`;
    h += `</div>`;
  }
  if (sec.check && (sec.check.items || []).length) {
    h += `<div class="callout callout-check" data-check="1"><div class="cap">${esc(sec.check.title || 'Check yourself')}</div><ol class="check-list">`;
    sec.check.items.forEach((it, qi) => {
      const aid = `check-a-${i}-${qi}`;
      h += `<li><div class="check-q">${esc(it.q || '')}</div>`;
      h += `<button type="button" class="btn-show-ans" data-show-ans="1" aria-expanded="false" aria-controls="${aid}">Show answer</button>`;
      h += `<div class="check-a" id="${aid}" hidden>${esc(it.a || '')}</div></li>`;
    });
    h += `</ol></div>`;
  }
  if (sec.svg) {
    // Trusted inline SVG from our own readings.json (not user input)
    h += `<div class="rfig" role="figure">${sec.svg}</div>`;
  }
  if (sec.figure) {
    if (sec.figure.src) {
      const alt = esc(sec.figure.alt || 'Figure');
      const src = sec.figure.src;
      const full = src.replace(/\.svg$/i, '.png');
      h += `<div class="rfig" role="figure"><button type="button" class="rsketch-btn" data-sketch-btn="1"><img class="rsketch" src="${esc(src)}" data-full="${esc(full)}" alt="${alt}" loading="lazy" decoding="async"/></button><div class="rsketch-hint">Tap to enlarge</div></div>`;
    } else if (sec.figure.status === 'pending-sketch') {
      h += `<div class="placeholder" data-pending-sketch="1"><div class="cap">Figure coming soon</div><p class="rp" style="margin:4px 0 0">${esc(sec.figure.note || 'Chem Sketcher will add this drawing.')}</p></div>`;
    }
  }
  return h;
}

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
  const alt = img.getAttribute('alt') || 'Figure';
  const full = img.getAttribute('data-full') || img.getAttribute('src') || '';
  const inlineW = Math.max(1, img.getBoundingClientRect().width || img.clientWidth || 320);
  const targetW = Math.max(inlineW * 2, 361); // 2× page CSS width, larger than 360 viewport
  closeLightbox();
  lightboxReturnFocus = fromBtn;
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', alt);
  lb.dataset.inlineWidth = String(inlineW);
  lb.innerHTML = `<button type="button" class="lightbox-close" aria-label="Close">✕</button>`
    + `<div class="lightbox-scroll" data-lightbox-scroll="1">`
    + `<img src="${esc(full)}" alt="${esc(alt)}" style="width:${targetW}px;max-width:none;height:auto" data-lightbox-img="1"/>`
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
  const t = topicOf(tid), r = readingOf(tid), qs = qsFor(tid);
  setTop('Reading', true);
  let h = `<div class="meta">${esc(ref(t))}</div><h2>${esc(t.topic_en)}</h2>`;
  h += `<div class="read-actions"><button class="link" id="skipCards" style="padding-inline:0">Skip to cards</button></div>`;
  if (r && !r.reviewed) h += `<div class="cap">Draft, not checked yet</div>`;
  if (!r) {
    h += `<div class="card"><p class="rp">No reading for this topic yet.</p></div>`;
  } else {
    const secs = r.sections || [];
    if (secs.length) {
      h += `<nav class="rtoc" id="readingToc" aria-label="In this reading"><div class="cap">In this reading</div><ol class="rtoc-list">`;
      secs.forEach((sec, i) => {
        const aid = secAnchorId(sec, i);
        const label = sec.heading || ('Section ' + (i + 1));
        h += `<li><a class="rtoc-link" href="#${esc(aid)}">${esc(label)}</a></li>`;
      });
      h += `</ol></nav>`;
    }
    h += `<div class="reading">`;
    secs.forEach((sec, i) => {
      const aid = secAnchorId(sec, i);
      h += `<section class="rsec" id="sec-${esc(aid)}">${renderSection(sec, i)}</section>`;
    });
    h += `</div>`;
  }
  h += `<div class="sticky" id="readEnd"><button class="btn" id="startPractice">Start practice (${qs.length} cards)</button></div>`;
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
      btn.textContent = next ? 'Hide answer' : 'Show answer';
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
  const t = topicOf(tid), qs = qsFor(tid); setTop(t.topic_en, true);
  let h = `<div class="meta">${esc(ref(t))}</div><h2>${esc(t.topic_en)}</h2>`;
  h += `<button class="link" id="reopenReading" style="padding-inline:0;margin-bottom:8px">Read the section again</button>`;
  qs.forEach((q, i) => { const c = S.cards[q.id]; h += `<div class="row" style="cursor:default"><span class="num">${i + 1}</span><span class="grow">${esc(q.q)}</span><span class="cap">${c ? (isDue(q.id) ? 'Due' : '✓ Done') : 'New'}</span></div>`; });
  h += `<div class="sticky"><button class="btn" id="go">Start practice (${qs.length} cards)</button></div>`;
  app.innerHTML = `<div class="fade">${h}</div>`;
  $('#reopenReading').onclick = () => go('reading', tid);
  $('#go').onclick = () => start(tid, qs.map(q => q.id));
}

function start(tid, ids) { S.session = { topic: tid, queue: [...ids], total: ids.length, worst: {}, seen: {} }; save(); go('card'); }

const rank = { knew: 0, unsure: 1, didnt: 2 };
function nextStep(id, worst) { const c = S.cards[id]; const cur = c ? c.step : -1; return worst === 'didnt' ? 0 : worst === 'unsure' ? Math.max(cur, 0) : Math.min(cur + 1, 2); }
function card() {
  const ss = S.session; if (!ss || !ss.queue.length) return go('home');
  const q = qOf(ss.queue[0]), t = topicOf(q.topic), calc = q.type === 'calc';
  const done = ss.total - new Set(ss.queue).size;
  setTop(`Card ${done + 1} of ${ss.total}`, true); $('#bar div').style.width = (100 * done / ss.total) + '%';
  const tip = calc ? 'Solve it in your notebook first, then check.' : 'Answer it in your head first, then check.';
  let h = `<div class="cap">${esc(t.topic_en)} · <span class="tag">${calc ? 'Calculation' : 'Concept'}</span></div>
  <div class="card" style="margin-top:8px"><p style="margin:0">${esc(q.q)}</p>${calc && q.given ? `<div class="given"><div class="cap">Given</div>${q.given.map(g => `<div>${esc(g)}</div>`).join('')}</div>` : ''}</div>
  ${S.hideTips ? `<div class="cap tipline">${tip}</div>` : `<div class="tipbox"><span aria-hidden="true">💡</span><span class="grow">${tip}</span><button class="link" id="hideTips" style="padding:0 4px;min-height:24px">Hide tips</button></div>`}
  <div id="rev"></div><div class="sticky" id="act"><button class="btn" id="show">Show answer</button></div>`;
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
  const alt = esc(q.imageAlt || 'Answer figure');
  return `<div class="qimg"><img src="${src}" alt="${alt}" loading="lazy"></div>`;
}
function reveal(q, t) {
  document.querySelectorAll('.tipbox, .tipline').forEach(e => e.remove());
  const ss = S.session, rest = ss.queue.length - 1, worst = ss.worst[q.id] || 'knew';
  const gap = (n) => rest < n ? 'at the end' : `~${n} cards`;
  const ns = nextStep(q.id, worst), knewLbl = `Next: in ${INTERVALS[ns]} day${INTERVALS[ns] > 1 ? 's' : ''}`;
  $('#rev').innerHTML = `<div class="card fade" id="answer"><div class="cap">Answer</div><div class="ans">${q.type === 'calc' ? `<span class="ansbox">${esc(q.answer)}</span>` : esc(q.answer)}</div>
  ${qImage(q)}
  ${q.type === 'calc' ? `<ol class="steps">${q.steps.map(s => `<li>${fmtStep(s)}</li>`).join('')}</ol>` : `<p>${esc(q.explanation)}</p>`}
  <div class="meta">📖 Atkins 8e · ${esc(q.ref)}</div>${q.reviewed ? '' : '<div class="cap">Draft, not checked yet</div>'}
  <a class="link" style="display:inline-block;padding-inline:0" href="mailto:yishi.ezerzer@mail.huji.ac.il?subject=${encodeURIComponent('Chem Practice, issue with: ' + q.id)}&body=${encodeURIComponent('Question ' + q.id + ': ' + q.q + '\n\nWhat is wrong:\n')}">Report a problem</a></div>`;
  $('#act').innerHTML = `<div class="rate"><button class="r-didnt" data-r="didnt"><b>Didn't know</b><small>${gap(3)}</small></button><button class="r-unsure" data-r="unsure"><b>Unsure</b><small>${gap(8)}</small></button><button class="r-knew" data-r="knew"><b>Knew it</b><small>${knewLbl}</small></button></div>`;
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
  app.innerHTML = `<div class="fade"><h2>Topic done</h2><div class="card"><div>Got it first try: <b>${first}</b> · Needed another go: <b>${ids.length - first}</b></div></div>
  ${hard.length ? `<div class="meta">Hardest cards</div>${hard.map(i => `<div class="row" style="cursor:default"><span class="grow">${esc(qOf(i).q)}</span></div>`).join('')}` : ''}
  <div class="sticky"><button class="btn" id="home">Back to topics</button>${hard.length ? '<button class="btn sec" id="again" style="margin-top:8px">Review hardest again</button>' : ''}</div></div>`;
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
  const row = x => `<div class="card"><div>${esc(x.t.topic_en)}</div><div class="cap">${esc(ref(x.t))}</div><div class="stack" role="img" aria-label="${x.d} didn't know, ${x.u} unsure, ${x.k} knew"><span style="width:${100 * x.d / x.n}%;background:var(--didnt)"></span><span style="width:${100 * x.u / x.n}%;background:var(--unsure)"></span><span style="width:${100 * x.k / x.n}%;background:var(--knew)"></span></div><div class="cap">${x.d} didn't know · ${x.u} unsure · ${x.k} knew</div><button class="btn sec" data-t="${x.t.id}" style="margin-top:8px">Practice</button></div>`;
  let h = '<h2>Weak topics</h2>';
  if (!rows.length && !few.length) h += '<p class="meta">No weak spots yet. Do a few cards and check back.</p>';
  h += rows.map(row).join('');
  if (few.length) h += `<div class="sect">Not enough practice yet</div>` + few.map(row).join('');
  h += `<p class="cap">Topics you haven't tried don't show here.</p>`;
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
    let data; try { data = JSON.parse(txt); if (!data.cards) throw 0; } catch { alert("That file doesn't look like a Chem Practice backup."); return; }
    const dlg = document.createElement('dialog');
    dlg.innerHTML = `<p>This will replace your progress on this device.</p><div style="display:flex;gap:8px"><button class="btn sec" value="no">Cancel</button><button class="btn" value="yes">Replace</button></div>`;
    document.body.append(dlg); dlg.showModal();
    dlg.querySelectorAll('button').forEach(b => b.onclick = () => { if (b.value === 'yes') { S = fresh(data); save(); go('home'); } dlg.close(); dlg.remove(); });
  });
}
init();
