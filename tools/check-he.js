#!/usr/bin/env node
// Hebrew overlay checker. Usage: node tools/check-he.js [topicId ...]  (no args = every id in data/he/index.json)
// Exit code 1 if any topic fails. No dependencies.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const rd = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const readings = rd('data/readings.json').readings;           // object keyed by topic id
const cards = rd('data/questions.json').questions;            // array, each with .topic and .id
const topicsEn = rd('data/topics.json').topics;
const index = rd('data/he/index.json').topics;
const ids = process.argv.length > 2 ? process.argv.slice(2) : index;

const HEB = /[֐-׿]/;
const SUPSUB = /[⁰¹²³⁴-⁹⁺⁻₀-₉₊₋]/g;
const UNITS = new Set(['mol', 'kmol', 'mmol', 'kg', 'mg', 'min', 'atm', 'kPa', 'mmHg', 'torr', 'bar', 'kJ', 'cal', 'kcal', 'nm', 'cm', 'mm', 'dm', 'mL', 'psi', 'ppm', 'Hz', 'eV']);
// Heuristic: an English string is "prose" (must be translated) if it has a word of 3+ Latin letters that is neither
// a unit nor formula-shaped (Na, NaCl, CaCO ...). Pure formulas, numbers and units are exempt when Hebrew has no Hebrew letters.
const isProse = s => (String(s).match(/[A-Za-z]{3,}/g) || []).some(w => !UNITS.has(w) && !/^([A-Z][a-z]?)+$/.test(w));

/** Collect [label, english, hebrew] for a string or array of strings; record array length mismatches. */
function pairs(en, he, label, out, issues) {
  if (en == null) return;
  if (Array.isArray(en)) {
    if (!en.length) return; // empty English array: nothing to translate
    if (!Array.isArray(he) || he.length !== en.length) issues.push(`${label}: length en=${en.length} he=${Array.isArray(he) ? he.length : 'missing'}`);
    en.forEach((e, i) => pairs(e, Array.isArray(he) ? he[i] : undefined, `${label}[${i}]`, out, issues));
  } else if (typeof en === 'string') out.push([label, en, he]);
}
function sectionPairs(es, hs, label, out, issues) {
  for (const k of ['heading', 'paragraphs', 'why']) pairs(es[k], hs && hs[k], `${label}.${k}`, out, issues);
  if (es.worked) for (const j of ['title', 'steps']) pairs(es.worked[j], hs && hs.worked && hs.worked[j], `${label}.worked.${j}`, out, issues);
  const hw = hs && hs.workedExamples;
  if (es.workedExamples && (!hw || hw.length !== es.workedExamples.length)) issues.push(`${label}.workedExamples: length en=${es.workedExamples.length} he=${hw ? hw.length : 'missing'}`);
  (es.workedExamples || []).forEach((w, i) => { for (const j of ['title', 'steps']) pairs(w[j], hw && hw[i] && hw[i][j], `${label}.workedExamples[${i}].${j}`, out, issues); });
  if (es.mistake) for (const j of ['wrong', 'whyWrong', 'correct']) pairs(es.mistake[j], hs && hs.mistake && hs.mistake[j], `${label}.mistake.${j}`, out, issues);
  if (es.check) {
    const h = hs && hs.check, hi = h && h.items;
    for (const j of ['title', 'intro']) pairs(es.check[j], h && h[j], `${label}.check.${j}`, out, issues);
    if (!hi || hi.length !== es.check.items.length) issues.push(`${label}.check.items: length en=${es.check.items.length} he=${hi ? hi.length : 'missing'}`);
    es.check.items.forEach((it, i) => { for (const j of ['q', 'a']) pairs(it[j], hi && hi[i] && hi[i][j], `${label}.check.items[${i}].${j}`, out, issues); });
  }
}
const allStrings = (o, acc = []) => { if (typeof o === 'string') acc.push(o); else if (o && typeof o === 'object') Object.values(o).forEach(v => allStrings(v, acc)); return acc; };

function checkTopic(id) {
  const lines = [], fails = [];
  const rec = (ok, text) => { lines.push(`  ${ok ? 'ok  ' : 'FAIL'} ${text}`); if (!ok) fails.push(text); };
  const hePath = path.join(root, 'data/he/topics', id + '.json');
  if (!fs.existsSync(hePath)) { rec(false, 'Hebrew file missing'); return { lines, fails }; }
  const he = JSON.parse(fs.readFileSync(hePath, 'utf8'));
  const topic = topicsEn.find(t => t.id === id), reading = readings[id];
  if (!topic || !reading) { rec(false, 'topic or English reading not found'); return { lines, fails }; }
  const enCards = cards.filter(q => q.topic === id);

  const issues = [], out = [];
  pairs(topic.topic_en, he.name, 'name', out, issues);
  const hs = (he.reading && he.reading.sections) || [];
  reading.sections.forEach(es => sectionPairs(es, hs.find(s => s.id === es.id), `section ${es.id}`, out, issues));
  const hq = he.questions || {};
  enCards.forEach(q => { for (const k of ['q', 'given', 'answer', 'steps', 'explanation']) pairs(q[k], hq[q.id] && hq[q.id][k], `card ${q.id}.${k}`, out, issues); });

  const untranslated = out.filter(([, en, h]) => {
    if (!en.trim()) return false;
    if (typeof h !== 'string' || !h.trim()) return true;
    return isProse(en) && !HEB.test(h) && isProse(h.replace(/<[^>]*>/g, '')); // Hebrew without Hebrew letters is fine if it is only a formula (e.g. m(H2O) = 50.0 g)
  });
  rec(untranslated.length === 0, `untranslated fields: ${untranslated.length} of ${out.length}` + untranslated.slice(0, 5).map(u => `\n         ${u[0]}`).join(''));

  const enIds = reading.sections.map(s => s.id), heIds = hs.map(s => s.id);
  const sameIds = enIds.length === heIds.length && enIds.every((x, i) => x === heIds[i]);
  rec(sameIds, `sections: en=${enIds.length} he=${heIds.length}, ids ${sameIds ? 'match' : 'DIFFER'}`);
  const enQ = enCards.map(q => q.id), heQ = Object.keys(hq);
  const sameQ = enQ.length === heQ.length && enQ.every(x => x in hq);
  rec(sameQ, `cards: en=${enQ.length} he=${heQ.length}, ids ${sameQ ? 'match' : 'DIFFER'}`);
  rec(issues.length === 0, `array lengths: ${issues.length} mismatches` + issues.slice(0, 5).map(x => `\n         ${x}`).join(''));

  const strs = allStrings(he);
  const raw = strs.reduce((n, s) => n + (s.match(SUPSUB) || []).length, 0);
  rec(raw === 0, `raw super/subscript characters: ${raw}`);
  const bdiHeb = strs.reduce((n, s) => n + [...s.matchAll(/<bdi>([\s\S]*?)<\/bdi>/g)].filter(m => HEB.test(m[1])).length, 0);
  rec(bdiHeb === 0, `Hebrew letters inside <bdi>: ${bdiHeb}`);
  let semi = 0;
  for (const s0 of strs) {
    const s = s0.replace(/&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, m => ' '.repeat(m.length)); // HTML entities are not semicolons
    for (let i = s.indexOf(';'); i >= 0; i = s.indexOf(';', i + 1)) {
      if (!(/<\/bdi>\s*$/.test(s.slice(0, i)) && /^\s*<bdi/.test(s.slice(i + 1)))) semi++;
    }
  }
  rec(semi === 0, `semicolons in Hebrew prose: ${semi}`);

  rec(index.includes(id), 'listed in data/he/index.json');
  const sitePath = path.join(root, 'site/data/he/topics', id + '.json');
  rec(fs.existsSync(sitePath) && fs.readFileSync(sitePath).equals(fs.readFileSync(hePath)), 'site/data/he/topics copy is byte-identical');
  return { lines, fails };
}

let failed = 0;
for (const id of ids) {
  const { lines, fails } = checkTopic(id);
  console.log(`${fails.length ? 'FAIL' : 'PASS'} ${id}`);
  console.log(lines.join('\n'));
  if (fails.length) failed++;
}
console.log(`\n${ids.length - failed}/${ids.length} topics PASS`);
process.exit(failed ? 1 : 0);
