#!/usr/bin/env node
// Card data validator. Usage: node tools/check-cards.js
//        node tools/check-cards.js --self-test   (plants one fault per rule group in an in-memory copy and expects it caught)
// Checks card shape for every course in data/courses.json, plus the Organic Hebrew card overlay.
// Exit code 1 if any group fails (or, in self-test, if a rule misses its planted fault). No dependencies.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const rd = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const { heWrap } = require(path.join(root, 'site/bidi.js'));          // same wrapper the site uses in Hebrew mode

const HEB = /[֐-׿]/;
const SUPSUB = /[⁰¹²³⁴-⁹⁺⁻₀-₉₊₋]/g;   // same as check-he
const isStr = s => typeof s === 'string';
const nonEmpty = s => isStr(s) && s.trim() !== '';
const isObj = o => o && typeof o === 'object' && !Array.isArray(o);
const strArr = a => Array.isArray(a) && a.length > 0 && a.every(isStr);

// ---- file access (injected so validators work on in-memory data) ----
const fsCtx = {
  // 'ok' | 'missing' | 'site-missing' | 'site-differs'
  imgState(dir, file) {
    const a = path.join(root, dir, 'img', file), b = path.join(root, 'site', dir, 'img', file);
    if (!fs.existsSync(a)) return 'missing';
    if (!fs.existsSync(b)) return 'site-missing';
    return fs.readFileSync(a).equals(fs.readFileSync(b)) ? 'ok' : 'site-differs';
  },
  // {width, height} from the SVG root (width/height attrs, else viewBox), or null if unreadable
  svgSize(dir, file) {
    const f = path.join(root, dir, 'img', file);
    if (!fs.existsSync(f)) return null;
    const m = fs.readFileSync(f, 'utf8').match(/<svg\b[^>]*>/i);
    if (!m) return null;
    const attr = n => { const a = m[0].match(new RegExp(`\\s${n}\\s*=\\s*["']([^"']*)["']`, 'i')); return a ? a[1] : null; };
    const w = attr('width'), h = attr('height');
    if (w && h && !isNaN(parseFloat(w)) && !isNaN(parseFloat(h))) return { width: parseFloat(w), height: parseFloat(h) };
    const vb = (attr('viewBox') || '').trim().split(/[\s,]+/).map(Number);
    return vb.length === 4 && vb.every(n => !isNaN(n)) ? { width: vb[2], height: vb[3] } : null;
  },
  siteSame(rel) {
    const a = path.join(root, rel), b = path.join(root, 'site', rel);
    return fs.existsSync(a) && fs.existsSync(b) && fs.readFileSync(a).equals(fs.readFileSync(b));
  },
};

// ---- course cards ----
function checkPicture(p, where, dir, ctx, bad) {
  if (!isObj(p)) return bad('picture', `${where}: not an object`);
  if (!isStr(p.file) || !/\.(svg|png|webp)$/i.test(p.file)) bad('picture', `${where}.file: must be a string ending .svg/.png/.webp`);
  else {
    const st = ctx.imgState(dir, p.file);
    if (st !== 'ok') bad('picture', `${where}.file ${p.file}: ${st === 'missing' ? 'not in ' + dir + 'img/' : st === 'site-missing' ? 'no copy in site/' + dir + 'img/' : 'site copy differs'}`);
  }
  if (!nonEmpty(p.smiles)) bad('picture', `${where}.smiles: empty`);
  if (!nonEmpty(p.alt)) bad('picture', `${where}.alt: empty`);
  // picture-size: source, pixel size, must match the SVG's own size, and fit a 360px screen (<= 296 wide)
  if (p.source !== 'auto' && p.source !== 'sketch') bad('picture-size', `${where}.source: must be "auto" or "sketch"`);
  const posInt = n => Number.isInteger(n) && n > 0;
  if (!posInt(p.width) || !posInt(p.height)) bad('picture-size', `${where}: width and height must be positive integers`);
  else {
    if (p.width > 296) bad('picture-size', `${where}.width ${p.width}: wider than 296 (scaled down at a 360px screen)`);
    const s = isStr(p.file) && /\.svg$/i.test(p.file) && ctx.svgSize ? ctx.svgSize(dir, p.file) : null;
    if (s && (s.width !== p.width || s.height !== p.height)) bad('picture-size', `${where}: size ${p.width}x${p.height} differs from ${p.file} (${s.width}x${s.height})`);
  }
}
/** Pictures from a list (picture set / readings). Returns [{id, rule, msg}]. */
function checkPictureSet(set, dir, ctx) {
  const out = [], seen = new Set();
  const list = Array.isArray(set && set.pictures) ? set.pictures : null;
  if (!list) return [{ id: 'pictures.json', rule: 'picture-set', msg: '.pictures must be an array' }];
  list.forEach((p, i) => {
    const id = isObj(p) && isStr(p.id) ? p.id : `#${i}`;
    const bad = (rule, msg) => out.push({ id, rule, msg });
    if (!isObj(p)) return bad('picture-set', 'not an object');
    if (!nonEmpty(p.id)) bad('picture-set', 'id: empty');
    else {
      if (seen.has(p.id)) bad('picture-set', 'duplicate id'); seen.add(p.id);
      if (!p.id.startsWith('o-pic-')) bad('picture-set', 'id must start with "o-pic-"');
      if (p.file !== p.id + '.svg') bad('picture-set', `file must be "${p.id}.svg"`);
    }
    checkPicture(p, 'picture', dir, ctx, bad);
  });
  return out;
}
function checkReadingPictures(readings, dir, ctx) {
  const out = [];
  for (const [topic, r] of Object.entries((readings && readings.readings) || {})) {
    (isObj(r) && Array.isArray(r.sections) ? r.sections : []).forEach((s, i) => {
      if (s && s.picture !== undefined) checkPicture(s.picture, `sections[${i}].picture`, dir, ctx, (rule, msg) => out.push({ id: topic, rule, msg }));
    });
  }
  return out;
}
const validPicture = (p, dir, ctx) => { let ok = true; checkPicture(p, '', dir, ctx, () => { ok = false; }); return ok; };

/** Returns [{id, rule, msg}]. seen = Map id -> course id, shared across courses for uniqueness. */
function checkCourse(course, cards, topics, ctx, seen) {
  const out = [];
  const topicIds = new Set((topics || []).map(t => t.id));
  const org = course.id === 'organic1';
  (cards || []).forEach((c, i) => {
    const id = isStr(c && c.id) ? c.id : `#${i}`;
    const bad = (rule, msg) => out.push({ id, rule, msg });
    if (!nonEmpty(c.id)) bad('id', 'id: not a non-empty string');
    else {
      if (seen.has(c.id)) bad('id-unique', `duplicate id (also in ${seen.get(c.id)})`); else seen.set(c.id, course.id);
      if (org && !c.id.startsWith('o-')) bad('id-prefix', 'Organic id must start with "o-"');
      if (!org && c.id.startsWith('o-')) bad('id-prefix', 'non-Organic id must not start with "o-"');
      if (c.id.startsWith('o-sample-') && c.reviewed !== false) bad('sample-reviewed', 'o-sample-* card must have reviewed === false');
    }
    if (!topicIds.has(c.topic)) bad('topic', `topic "${c.topic}" not in ${course.dir}topics.json`);
    const types = org ? ['mc', 'typed', 'notebook', 'calc', 'concept'] : ['calc', 'concept'];
    if (!types.includes(c.type)) bad('type', `type "${c.type}" not allowed (${types.join('/')})`);
    if (!nonEmpty(c.q)) bad('q', 'q: empty');
    if (!nonEmpty(c.ref)) bad('ref', 'ref: empty');
    if (typeof c.reviewed !== 'boolean') bad('reviewed', 'reviewed: not a boolean');
    if (c.type === 'calc') {
      if (!strArr(c.steps)) bad('calc', 'steps: must be a non-empty array of strings');
      if (!isStr(c.answer)) bad('calc', 'answer: not a string');
    } else if (c.type === 'concept') {
      if (!isStr(c.explanation)) bad('concept', 'explanation: not a string');
      if (!isStr(c.answer)) bad('concept', 'answer: not a string');
    } else if (c.type === 'mc') {
      if (!Array.isArray(c.choices) || c.choices.length < 2 || c.choices.length > 6) bad('mc', 'choices: need an array of 2..6');
      else c.choices.forEach((ch, j) => {
        if (!isObj(ch)) return bad('mc', `choices[${j}]: not an object`);
        if (!nonEmpty(ch.text) && !(ch.image && validPicture(ch.image, course.dir, ctx))) bad('mc', `choices[${j}]: needs non-empty text and/or a valid image`);
        if (!isStr(ch.why)) bad('mc', `choices[${j}].why: not a string`);
      });
      if (!Number.isInteger(c.right) || !Array.isArray(c.choices) || c.right < 0 || c.right >= c.choices.length) bad('mc', `right: ${JSON.stringify(c.right)} is not an index into choices`);
      if (!isStr(c.answer)) bad('mc', 'answer: not a string');
      if (!strArr(c.steps)) bad('mc', 'steps: must be a non-empty array of strings');
    } else if (c.type === 'typed') {
      if (!nonEmpty(c.answer) || HEB.test(c.answer)) bad('typed', 'answer: must be non-empty with no Hebrew letters');
      if (!strArr(c.steps) && !(Array.isArray(c.steps) && c.steps.length)) bad('typed', 'steps: must be a non-empty array');
    } else if (c.type === 'notebook') {
      if (!c.answer_image) bad('notebook', 'answer_image: missing');
      if (!isStr(c.answer)) bad('notebook', 'answer: not a string');
      if (!strArr(c.steps)) bad('notebook', 'steps: must be a non-empty array of strings');
    }
    if (c.q_image !== undefined) checkPicture(c.q_image, 'q_image', course.dir, ctx, bad);
    if (c.answer_image !== undefined) checkPicture(c.answer_image, 'answer_image', course.dir, ctx, bad);
    if (Array.isArray(c.choices)) c.choices.forEach((ch, j) => { if (ch && ch.image !== undefined) checkPicture(ch.image, `choices[${j}].image`, course.dir, ctx, bad); });
    if (['mc', 'typed', 'notebook'].includes(c.type)) {
      const pc = c.picture_check;
      if (!isObj(pc) || !['none', 'placeholder', 'checked'].includes(pc.status)) bad('picture_check', 'picture_check.status must be none/placeholder/checked');
      else if (pc.status === 'checked' && (!nonEmpty(pc.checked_by) || !nonEmpty(pc.date))) bad('picture_check', 'status "checked" needs checked_by and date');
    }
  });
  return out;
}

// ---- Organic Hebrew overlay ----
const HE_FORBIDDEN = ['id', 'topic', 'type', 'ref', 'reviewed', 'right', 'answer', 'picture_check'];
/** Walk a Hebrew card entry: calls fn(string, path) for every string. */
function walk(o, p, fn) {
  if (isStr(o)) fn(o, p);
  else if (Array.isArray(o)) o.forEach((v, i) => walk(v, `${p}[${i}]`, fn));
  else if (o && typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], p ? `${p}.${k}` : k, fn);
}
function semicolons(s0) {
  const s = s0.replace(/&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, m => ' '.repeat(m.length))
    .replace(/<bdi>((?:[^<]|<(?!\/?bdi>))*)<\/bdi>/g, (m, c) => '<bdi>' + c.replace(/;/g, ' ') + '</bdi>');
  let n = 0;
  for (let i = s.indexOf(';'); i >= 0; i = s.indexOf(';', i + 1)) if (!(/<\/bdi>\s*$/.test(s.slice(0, i)) && /^\s*<bdi/.test(s.slice(i + 1)))) n++;
  return n;
}
const needsHebrew = p => /^(q|steps\[\d+\]|choices\[\d+\]\.why|(.*\.)?alt)$/.test(p);

/** index = {topics:[ids]}, files = {topicId: parsed json | undefined}, enCards = all Organic cards. */
function checkOverlay(index, files, enCards, ctx) {
  const out = [];
  for (const tid of index.topics || []) {
    const bad = (id, rule, msg) => out.push({ id: id || tid, rule, msg });
    const f = files[tid];
    if (!f) { bad(tid, 'file', `data/organic1/he/topics/${tid}.json missing`); continue; }
    if (!ctx.siteSame(`data/organic1/he/topics/${tid}.json`)) bad(tid, 'site-copy', 'site/ copy missing or not byte-identical');
    const hq = f.questions;
    if (!isObj(hq)) { bad(tid, 'file', '.questions map missing'); continue; }
    const en = enCards.filter(c => c.topic === tid), enIds = new Set(en.map(c => c.id));
    for (const c of en) if (!(c.id in hq)) bad(c.id, 'cards', 'no Hebrew entry');
    for (const k of Object.keys(hq)) if (!enIds.has(k)) bad(k, 'cards', 'extra Hebrew entry with no English card');
    for (const c of en) {
      const h = hq[c.id];
      if (!isObj(h)) continue;
      for (const k of HE_FORBIDDEN) if (k in h) bad(c.id, 'forbidden-key', `key "${k}" must not appear`);
      walk(h, '', (s, p) => { void s; if (/(^|\.)(file|smiles)$/.test(p)) bad(c.id, 'forbidden-key', `${p} must not appear`); });
      (function keys(o, p) { if (Array.isArray(o)) o.forEach((v, i) => keys(v, `${p}[${i}]`)); else if (isObj(o)) for (const k of Object.keys(o)) { const q = p ? `${p}.${k}` : k; if (['source', 'width', 'height'].includes(k)) bad(c.id, 'forbidden-key', `${q} must not appear (comes from the English data)`); keys(o[k], q); } })(h, '');
      if (Array.isArray(h.choices)) h.choices.forEach((ch, j) => { if (ch && 'text' in ch) bad(c.id, 'forbidden-key', `choices[${j}].text must not appear`); });
      for (const k of ['steps', 'choices']) {
        if (h[k] !== undefined && (!Array.isArray(h[k]) || h[k].length !== (c[k] || []).length)) bad(c.id, 'array-length', `${k}: length en=${(c[k] || []).length} he=${Array.isArray(h[k]) ? h[k].length : 'not an array'}`);
      }
      walk(h, '', (s, p) => {
        if (SUPSUB.test(s)) bad(c.id, 'supsub', `${p}: raw sub/superscript character`);
        SUPSUB.lastIndex = 0;
        for (const m of s.matchAll(/<bdi>([\s\S]*?)<\/bdi>/g)) if (HEB.test(m[1])) bad(c.id, 'bdi-hebrew', `${p}: Hebrew letters inside <bdi>`);
        if (semicolons(s)) bad(c.id, 'semicolon', `${p}: semicolon outside <bdi>`);
        if (heWrap(s) !== s) bad(c.id, 'wrap', `${p}: Latin/formula run outside <bdi>: ${s.slice(0, 60)}`);
        if (needsHebrew(p) && !HEB.test(s)) bad(c.id, 'needs-hebrew', `${p}: no Hebrew letters`);
      });
    }
  }
  return out;
}

// ---- Hebrew formula layout in Organic cards (style.css + app.js) ----
// In Hebrew a formula is an inline-block isolate (html[lang=he] bdi.fx). Aligned to the line bottom, a formula with a
// <sub> is taller than the line and gets lifted, so "CH" floats above the Hebrew text and the 3 reads as a superscript.
// Organic cards must align formulas to the text baseline: cardO marks its card .ocard, and style.css sets
// html[lang=he] .ocard bdi.fx { vertical-align: baseline }.
function checkFormulaAlign(css, appJs) {
  const out = [], flat = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const rules = [...flat.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ sel: m[1].split(',').map(x => x.trim()), body: m[2] }));
  const ok = rules.some(r => r.sel.includes('html[lang=he] .ocard bdi.fx') && /(^|;)\s*vertical-align\s*:\s*baseline\s*(;|$)/.test(r.body.trim()));
  if (!ok) out.push({ rule: 'formula-baseline', id: 'site/style.css', msg: 'no "html[lang=he] .ocard bdi.fx { vertical-align: baseline }" rule: Hebrew formulas with <sub> are lifted off the line' });
  const m = appJs.match(/function cardO\([\s\S]*?\n\}/);
  if (!m || !/class="fade ocard"/.test(m[0])) out.push({ rule: 'formula-baseline', id: 'site/app.js', msg: 'cardO does not mark its card with class "ocard"' });
  return out;
}

// General Chemistry (and everything outside .ocard): the global rule html[lang=he] bdi.fx must sit on the baseline too.
function checkFormulaAlignGen(css) {
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const rules = [...flat.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ sel: m[1].split(',').map(x => x.trim()), body: m[2] }));
  const mine = rules.filter(r => r.sel.includes('html[lang=he] bdi.fx'));
  const va = r => [...r.body.matchAll(/(?:^|;)\s*vertical-align\s*:\s*([^;]*?)\s*(?=;|$)/g)].map(m => m[1]);
  const out = [];
  if (!mine.some(r => va(r).includes('baseline'))) out.push({ rule: 'formula-baseline-gen', id: 'site/style.css', msg: 'no "html[lang=he] bdi.fx { vertical-align: baseline }" rule: General Chemistry Hebrew formulas are lifted off the line' });
  for (const r of mine) for (const v of va(r)) if (v !== 'baseline') out.push({ rule: 'formula-baseline-gen', id: 'site/style.css', msg: `"html[lang=he] bdi.fx" declares vertical-align: ${v}` });
  return out;
}

// ---- reporting ----
function group(label, problems, okLines) {
  const lines = okLines.map(t => `  ok   ${t}`);
  for (const p of problems) lines.push(`  FAIL [${p.rule}] ${p.id}: ${p.msg}`);
  return { label, lines, failed: problems.length > 0 };
}

function loadAll() {
  const courses = rd('data/courses.json').courses;
  return courses.map(c => ({ course: c, cards: rd(c.dir + 'questions.json').questions, topics: rd(c.dir + 'topics.json').topics }));
}
function loadOverlay() {
  const index = rd('data/organic1/he/index.json');
  const files = {};
  for (const t of index.topics) { const p = `data/organic1/he/topics/${t}.json`; if (fs.existsSync(path.join(root, p))) files[t] = rd(p); }
  return { index, files };
}

if (process.argv[2] !== '--self-test') {
  const all = loadAll(), seen = new Map(), groups = [];
  for (const { course, cards, topics } of all) {
    const probs = checkCourse(course, cards, topics, fsCtx, seen);
    groups.push(group(course.id, probs, probs.length ? [] : [`${cards.length} cards valid`]));
  }
  const org = all.find(a => a.course.id === 'organic1');
  const { index, files } = loadOverlay();
  const op = checkOverlay(index, files, org ? org.cards : [], fsCtx);
  groups.push(group('organic1 Hebrew overlay', op, op.length ? [] : [`${index.topics.length} topic(s) valid`]));
  const css = fs.readFileSync(path.join(root, 'site/style.css'), 'utf8'), appJs = fs.readFileSync(path.join(root, 'site/app.js'), 'utf8');
  const fp = checkFormulaAlign(css, appJs);
  groups.push(group('organic1 Hebrew formula baseline', fp, fp.length ? [] : ['formulas in Organic cards sit on the text baseline']));
  const gp = checkFormulaAlignGen(css);
  groups.push(group('gen Hebrew formula baseline', gp, gp.length ? [] : ['Hebrew formulas in General Chemistry sit on the text baseline']));
  if (fs.existsSync(path.join(root, 'data/organic1/pictures.json'))) {
    const set = rd('data/organic1/pictures.json'), pp = checkPictureSet(set, 'data/organic1/', fsCtx);
    if (!fsCtx.siteSame('data/organic1/pictures.json')) pp.push({ id: 'pictures.json', rule: 'picture-set', msg: 'site/ copy missing or not byte-identical' });
    groups.push(group('organic1 picture set', pp, pp.length ? [] : [`${set.pictures.length} pictures valid`]));
  } else groups.push(group('organic1 picture set', [], ['data/organic1/pictures.json not present: skipped']));
  if (fs.existsSync(path.join(root, 'data/organic1/readings.json'))) {
    const rdg = rd('data/organic1/readings.json'), rp = checkReadingPictures(rdg, 'data/organic1/', fsCtx);
    const n = Object.values(rdg.readings || {}).reduce((a, r) => a + ((r && r.sections) || []).filter(s => s && s.picture !== undefined).length, 0);
    groups.push(group('organic1 reading pictures', rp, rp.length ? [] : [`${n} reading pictures valid`]));
  } else groups.push(group('organic1 reading pictures', [], ['data/organic1/readings.json not present: skipped']));
  for (const g of groups) { console.log(`${g.failed ? 'FAIL' : 'PASS'} ${g.label}`); console.log(g.lines.join('\n')); }
  const failed = groups.filter(g => g.failed).length;
  console.log(`\n${groups.length - failed}/${groups.length} groups PASS`);
  process.exit(failed ? 1 : 0);
}

// ---- self-test ----
const clone = o => JSON.parse(JSON.stringify(o));
const all = loadAll();
const gen = all.find(a => a.course.id === 'gen'), org = all.find(a => a.course.id === 'organic1');
const okCtx = { imgState: () => 'ok', siteSame: () => true };
const find = (cards, t) => cards.find(c => c.type === t);
const baseCards = () => ({ gen: clone(gen.cards), org: clone(org.cards) });
// Valid synthetic Hebrew overlay built from the English cards (independent of the real overlay's state).
function baseOverlay(enCards) {
  const idx = { topics: [...new Set(enCards.map(c => c.topic))] }, files = {};
  for (const t of idx.topics) {
    files[t] = { questions: {} };
    for (const c of enCards.filter(x => x.topic === t)) {
      const h = { q: 'שאלה לדוגמה', steps: (c.steps || []).map(() => 'שלב <bdi>CH₃</bdi>'.replace('₃', '<sub>3</sub>')) };
      if (c.choices) h.choices = c.choices.map(ch => { const o = { why: 'הסבר קצר' }; if (ch.image) o.image = { alt: 'תמונה' }; return o; });
      if (c.q_image) h.q_image = { alt: 'תמונה' };
      if (c.answer_image) h.answer_image = { alt: 'תמונה' };
      files[t].questions[c.id] = h;
    }
  }
  return { idx, files };
}
const cases = [
  ['id-unique', 'duplicate id', ({ g, o }) => { o[1].id = g[0].id; }],
  ['id-prefix', 'Organic id without o-', ({ o }) => { o[0].id = 'x-sample-mc'; }],
  ['type', 'unknown type', ({ o }) => { o[0].type = 'essay'; }],
  ['mc', 'mc right out of range', ({ o }) => { find(o, 'mc').right = 9; }],
  ['mc', 'mc choice with neither text nor image', ({ o }) => { const c = find(o, 'mc'); delete c.choices[0].text; delete c.choices[0].image; }],
  ['typed', 'typed answer with Hebrew letters', ({ o }) => { find(o, 'typed').answer = 'בוטאן'; }],
  ['notebook', 'notebook missing answer_image', ({ o }) => { delete find(o, 'notebook').answer_image; }],
  ['picture', 'picture file missing', ({ o }) => { find(o, 'mc').q_image.file = 'does-not-exist.svg'; }, { imgState: (d, f) => f === 'does-not-exist.svg' ? 'missing' : 'ok', siteSame: () => true }],
  ['picture_check', 'picture_check bad status', ({ o }) => { find(o, 'mc').picture_check.status = 'maybe'; }],
  ['sample-reviewed', 'sample card reviewed true', ({ o }) => { o[0].reviewed = true; }],
  ['calc', 'GC calc without steps', ({ g }) => { delete find(g, 'calc').steps; }],
  ['topic', 'unknown topic', ({ g }) => { g[0].topic = 'nope'; }],
];
const hcases = [
  ['forbidden-key', 'Hebrew overlay with an answer key', h => { const t = Object.keys(h.files)[0], id = Object.keys(h.files[t].questions)[0]; h.files[t].questions[id].answer = 'x'; }],
  ['supsub', 'Hebrew string with raw subscript', h => { const t = Object.keys(h.files)[0], id = Object.keys(h.files[t].questions)[0]; h.files[t].questions[id].q = 'מים H₂O'; }],
  ['wrap', 'Hebrew string with Latin outside <bdi>', h => { const t = Object.keys(h.files)[0], id = Object.keys(h.files[t].questions)[0]; h.files[t].questions[id].q = 'מה השם של methylbutane'; }],
  ['cards', 'Hebrew overlay missing a card', h => { const t = Object.keys(h.files)[0]; delete h.files[t].questions[Object.keys(h.files[t].questions)[0]]; }],
  ['array-length', 'Hebrew steps length differs', h => { const t = Object.keys(h.files)[0], id = Object.keys(h.files[t].questions)[0]; h.files[t].questions[id].steps.pop(); }],
];
let caught = 0, total = 0;
const report = (name, rule, probs) => { total++; const hit = probs.some(p => p.rule === rule); if (hit) caught++; console.log(`  ${hit ? 'ok  ' : 'MISSED'} ${name} -> [${rule}]`); };
{ // baseline must be clean, otherwise a "caught" fault could be noise
  const b = baseCards(), seen = new Map(), ov = baseOverlay(b.org);
  const p = [...checkCourse(gen.course, b.gen, gen.topics, okCtx, seen), ...checkCourse(org.course, b.org, org.topics, okCtx, seen), ...checkOverlay(ov.idx, ov.files, b.org, okCtx)];
  if (p.length) { console.log('baseline not clean:\n' + p.slice(0, 10).map(x => `  ${x.id} [${x.rule}] ${x.msg}`).join('\n')); process.exit(1); }
}
for (const [rule, name, mutate, ctx] of cases) {
  const b = baseCards(); mutate({ g: b.gen, o: b.org });
  const seen = new Map();
  report(name, rule, [...checkCourse(gen.course, b.gen, gen.topics, ctx || okCtx, seen), ...checkCourse(org.course, b.org, org.topics, ctx || okCtx, seen)]);
}
for (const [rule, name, mutate] of hcases) {
  const ov = baseOverlay(clone(org.cards)); mutate(ov);
  report(name, rule, checkOverlay(ov.idx, ov.files, org.cards, okCtx));
}
{ // formula baseline: the real files must pass, then each planted copy must fail
  const css = fs.readFileSync(path.join(root, 'site/style.css'), 'utf8'), appJs = fs.readFileSync(path.join(root, 'site/app.js'), 'utf8');
  const base = checkFormulaAlign(css, appJs);
  if (base.length) { console.log('formula baseline: real files not clean, cannot plant'); process.exit(1); }
  const fcases = [
    ['Organic formulas aligned to the line bottom (O2b bug)', css.replace('html[lang=he] .ocard bdi.fx{vertical-align:baseline}', 'html[lang=he] .ocard bdi.fx{vertical-align:bottom}'), appJs],
    ['Organic card not marked .ocard', css, appJs.replace('class="fade ocard"', 'class="fade"')],
  ];
  for (const [name, c, a] of fcases) {
    if (c === css && a === appJs) { console.log(`  NOT PLANTED ${name}`); total++; continue; }
    report(name, 'formula-baseline', checkFormulaAlign(c, a));
  }
}
{ // picture size/source, picture set, Hebrew size keys, General Chemistry formula baseline
  const real = ['data/organic1/pictures.json'].filter(f => fs.existsSync(path.join(root, f))).map(rd)[0];
  const fixture = { pictures: [1, 2].map(n => ({ id: `o-pic-t${n}`, source: 'auto', file: `o-pic-t${n}.svg`, smiles: 'CC', alt: 'a', width: 100, height: 50 })) };
  const setBase = real || fixture;
  const sctx = { ...okCtx, svgSize: () => null };
  const pb = [...checkCourse(org.course, clone(org.cards), org.topics, sctx, new Map()), ...checkPictureSet(setBase, org.course.dir, sctx), ...checkReadingPictures({ readings: {} }, org.course.dir, sctx)];
  if (pb.length) { console.log('picture baseline not clean:\n' + pb.slice(0, 10).map(x => `  ${x.id} [${x.rule}] ${x.msg}`).join('\n')); process.exit(1); }
  const pcases = [
    ['picture without width', p => { delete p.width; }],
    ['picture width differs from its SVG file', p => { p.width = 120; }, true],
    ['picture with unknown source', p => { p.source = 'scan'; }],
    ['picture wider than 296', p => { p.width = 400; }],
  ];
  let p = null;
  for (const [name, mutate, cx] of pcases) {
    const b = clone(org.cards), card = find(b, 'mc'); p = card.q_image; mutate(p);
    const c2 = cx ? { ...okCtx, svgSize: () => ({ width: 1, height: 1 }) } : sctx;
    report(name, 'picture-size', checkCourse(org.course, b, org.topics, c2, new Map()));
  }
  { const s = clone(setBase); s.pictures.push({ ...s.pictures[0] }); report('picture set: duplicate id', 'picture-set', checkPictureSet(s, org.course.dir, sctx)); }
  { const ov = baseOverlay(clone(org.cards)); const t = Object.keys(ov.files)[0], id = Object.keys(ov.files[t].questions)[0]; ov.files[t].questions[id].q_image = { alt: 'תמונה', width: 100 };
    report('Hebrew overlay with a width key', 'forbidden-key', checkOverlay(ov.idx, ov.files, org.cards, okCtx)); }
  { const css = fs.readFileSync(path.join(root, 'site/style.css'), 'utf8');
    if (checkFormulaAlignGen(css).length) { console.log('gen formula baseline: real css not clean, cannot plant'); process.exit(1); }
    const bad = css.replace(/(html\[lang=he\] bdi\.fx\{[^}]*?)vertical-align:baseline/, '$1vertical-align:bottom');
    if (bad === css) { console.log('  NOT PLANTED General Chemistry formulas aligned to the line bottom'); total++; }
    else report('General Chemistry formulas aligned to the line bottom', 'formula-baseline-gen', checkFormulaAlignGen(bad)); }
}
console.log(`\nself-test: ${caught}/${total} rules caught their planted fault`);
process.exit(caught === total ? 0 : 1);
