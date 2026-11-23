#!/usr/bin/env node
// Hebrew overlay checker. Usage: node tools/check-he.js [topicId ...]
//   no args = every id in data/he/index.json (General Chemistry) and in data/organic1/he/index.json (Organic 1, shown as "(organic1)");
//   ids on the command line are looked up in whichever course has them.
//        node tools/check-he.js --self-test   (runs the rules on tools/fixtures/he-broken.json and he-broken-organic.json and expects each to fail)
// Exit code 1 if any topic fails (or, in self-test, if a rule misses its planted fault). No dependencies.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const rd = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
// Courses. readings: object keyed by topic id; cards: array, each with .topic and .id; he/site: where the Hebrew topic files live.
// Organic differences: no Hebrew "name" (topic_he is in topics.json), a topic may have cards but no English reading, and cards
// also carry choices[].why and picture alts.
const rdOpt = (f, k, d) => fs.existsSync(path.join(root, f)) ? rd(f)[k] || d : d;
const courses = [
  { id: 'gen', organic: false, readings: rd('data/readings.json').readings, cards: rd('data/questions.json').questions, topics: rd('data/topics.json').topics,
    index: rd('data/he/index.json').topics, he: 'data/he/topics', site: 'site/data/he/topics', indexRel: 'data/he/index.json' },
  { id: 'organic1', organic: true, readings: rdOpt('data/organic1/readings.json', 'readings', {}), cards: rdOpt('data/organic1/questions.json', 'questions', []), topics: rdOpt('data/organic1/topics.json', 'topics', []),
    index: rdOpt('data/organic1/he/index.json', 'topics', []), he: 'data/organic1/he/topics', site: 'site/data/organic1/he/topics', indexRel: 'data/organic1/he/index.json' },
];
const courseOf = id => courses.find(c => c.topics.some(t => t.id === id)) || courses.find(c => c.index.includes(id)) || courses[0];
const selfTest = process.argv[2] === '--self-test';
const jobs = selfTest ? [] : process.argv.length > 2 ? process.argv.slice(2).map(id => [id, courseOf(id)]) : courses.flatMap(c => c.index.map(id => [id, c]));
const { heWrap } = require(path.join(root, 'site/bidi.js'));          // same wrapper the site uses in Hebrew mode

const HEB = /[֐-׿]/;
const SUPSUB = /[⁰¹²³⁴-⁹⁺⁻₀-₉₊₋]/g;
const UNITS = new Set(['mol', 'kmol', 'mmol', 'kg', 'mg', 'min', 'atm', 'kPa', 'mmHg', 'torr', 'bar', 'kJ', 'cal', 'kcal', 'nm', 'cm', 'mm', 'dm', 'mL', 'psi', 'ppm', 'Hz', 'eV']);
// Heuristic: an English string is "prose" (must be translated) if it has a word of 3+ Latin letters that is neither
// a unit nor formula-shaped (Na, NaCl, CaCO ...). Pure formulas, numbers and units are exempt when Hebrew has no Hebrew letters.
// A whole string that is one <bdi> formula (only <sub>/<sup> inside, optional final full stop) counts as translated.
const FORMULA_ONLY = /^<bdi>(?:[^<]|<\/?su[bp]>)*<\/bdi>\.?$/;
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
  // picture alts (Organic readings): sections[i].picture, .pictures[j], .worked.picture, .workedExamples[k].picture
  const alt = p => p && p.alt, hasAlt = o => o && o.picture && o.picture.alt !== undefined;
  if (hasAlt(es)) pairs(es.picture.alt, alt(hs && hs.picture), `${label}.picture.alt`, out, issues);
  if (Array.isArray(es.pictures)) pairs(es.pictures.map(alt), hs && Array.isArray(hs.pictures) ? hs.pictures.map(alt) : undefined, `${label}.pictures.alt`, out, issues);
  if (hasAlt(es.worked)) pairs(es.worked.picture.alt, alt(hs && hs.worked && hs.worked.picture), `${label}.worked.picture.alt`, out, issues);
  const hw = hs && hs.workedExamples;
  if (es.workedExamples && (!hw || hw.length !== es.workedExamples.length)) issues.push(`${label}.workedExamples: length en=${es.workedExamples.length} he=${hw ? hw.length : 'missing'}`);
  (es.workedExamples || []).forEach((w, i) => {
    for (const j of ['title', 'steps']) pairs(w[j], hw && hw[i] && hw[i][j], `${label}.workedExamples[${i}].${j}`, out, issues);
    if (hasAlt(w)) pairs(w.picture.alt, alt(hw && hw[i] && hw[i].picture), `${label}.workedExamples[${i}].picture.alt`, out, issues);
  });
  if (es.mistake) for (const j of ['wrong', 'whyWrong', 'correct']) pairs(es.mistake[j], hs && hs.mistake && hs.mistake[j], `${label}.mistake.${j}`, out, issues);
  if (es.check) {
    const h = hs && hs.check, hi = h && h.items;
    for (const j of ['title', 'intro']) pairs(es.check[j], h && h[j], `${label}.check.${j}`, out, issues);
    if (!hi || hi.length !== es.check.items.length) issues.push(`${label}.check.items: length en=${es.check.items.length} he=${hi ? hi.length : 'missing'}`);
    es.check.items.forEach((it, i) => { for (const j of ['q', 'a']) pairs(it[j], hi && hi[i] && hi[i][j], `${label}.check.items[${i}].${j}`, out, issues); });
  }
}
const allStrings = (o, acc = []) => { if (typeof o === 'string') acc.push(o); else if (o && typeof o === 'object') Object.values(o).forEach(v => allStrings(v, acc)); return acc; };

function checkTopic(id, course, fixture) {
  const { readings, cards, topics: topicsEn, index } = course;
  const lines = [], fails = [];
  const rec = (ok, text) => { lines.push(`  ${ok ? 'ok  ' : 'FAIL'} ${text}`); if (!ok) fails.push(text); };
  const hePath = path.join(root, course.he, id + '.json');
  if (!fixture && !fs.existsSync(hePath)) { rec(false, 'Hebrew file missing'); return { lines, fails }; }
  const he = fixture || JSON.parse(fs.readFileSync(hePath, 'utf8'));
  const topic = topicsEn.find(t => t.id === id), reading = (fixture && fixture._en_reading) || readings[id];   // a fixture may carry its own English reading
  if (!topic || (!reading && !course.organic)) { rec(false, course.organic ? 'topic not found' : 'topic or English reading not found'); return { lines, fails }; }
  const enCards = cards.filter(q => q.topic === id);

  const issues = [], out = [];
  if (!course.organic) pairs(topic.topic_en, he.name, 'name', out, issues);
  const hs = (he.reading && he.reading.sections) || [];
  if (reading) reading.sections.forEach(es => sectionPairs(es, hs.find(s => s.id === es.id), `section ${es.id}`, out, issues));   // Organic topic with cards only: no reading to compare
  const hq = he.questions || {};
  enCards.forEach(q => {
    const h = hq[q.id], pic = o => o && o.alt !== undefined ? o.alt : undefined;
    for (const k of course.organic ? ['q', 'given', 'steps', 'explanation'] : ['q', 'given', 'answer', 'steps', 'explanation']) pairs(q[k], h && h[k], `card ${q.id}.${k}`, out, issues);
    if (!course.organic) return;
    if (Array.isArray(q.choices)) pairs(q.choices.map(c => c && c.why), h && Array.isArray(h.choices) ? h.choices.map(c => c && c.why) : undefined, `card ${q.id}.choices.why`, out, issues);
    for (const k of ['q_image', 'answer_image']) if (q[k]) pairs(pic(q[k]), pic(h && h[k]), `card ${q.id}.${k}.alt`, out, issues);
    (q.choices || []).forEach((c, j) => { if (c && c.image) pairs(pic(c.image), pic(h && h.choices && h.choices[j] && h.choices[j].image), `card ${q.id}.choices[${j}].image.alt`, out, issues); });
  });

  const untranslated = out.filter(([, en, h]) => {
    if (!en.trim()) return false;
    if (typeof h !== 'string' || !h.trim()) return true;
    if (FORMULA_ONLY.test(h.trim())) return false; // a step that is only a formula in <bdi> is allowed (e.g. <bdi>P = nRT / V</bdi>)
    return isProse(en) && !HEB.test(h) && isProse(h.replace(/<[^>]*>/g, '')); // Hebrew without Hebrew letters is fine if it is only a formula (e.g. m(H2O) = 50.0 g)
  });
  rec(untranslated.length === 0, `untranslated fields: ${untranslated.length} of ${out.length}` + untranslated.slice(0, 5).map(u => `\n         ${u[0]}`).join(''));

  if (reading) {
    const enIds = reading.sections.map(s => s.id), heIds = hs.map(s => s.id);
    const sameIds = enIds.length === heIds.length && enIds.every((x, i) => x === heIds[i]);
    rec(sameIds, `sections: en=${enIds.length} he=${heIds.length}, ids ${sameIds ? 'match' : 'DIFFER'}`);
  }
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
    const s = s0.replace(/&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, m => ' '.repeat(m.length)) // HTML entities are not semicolons
      .replace(/<bdi>((?:[^<]|<(?!\/?bdi>))*)<\/bdi>/g, (m, c) => '<bdi>' + c.replace(/;/g, ' ') + '</bdi>'); // nor is ; inside a formula
    for (let i = s.indexOf(';'); i >= 0; i = s.indexOf(';', i + 1)) {
      if (!(/<\/bdi>\s*$/.test(s.slice(0, i)) && /^\s*<bdi/.test(s.slice(i + 1)))) semi++;
    }
  }
  rec(semi === 0, `semicolons in Hebrew prose: ${semi}`);
  // Latin, Greek, math or formula runs outside a <bdi> in Hebrew prose (rule and exceptions: see site/bidi.js).
  const loose = strs.filter(s => heWrap(s) !== s);
  rec(loose.length === 0, `formula/Latin runs outside <bdi>: ${loose.length} strings` + loose.slice(0, 3).map(x => `\n         ${x.slice(0, 90)}`).join(''));
  // A coefficient or sign just outside a formula <bdi> lands on the wrong side in RTL ('4 H2O' reads 'H2O 4', '+7' reads '7+'): pull it into the bdi.
  const lonely = strs.filter(s => HEB.test(s) && /(?<![\d.,\-−+A-Za-z>\/])(?<!מחזור )\d+ <bdi>(?=[A-Z(])/.test(s) ||
    HEB.test(s) && /(?<![\w.>])[+−]\d/.test(s.replace(/<bdi>(?:[^<]|<(?!\/?bdi>))*<\/bdi>/g, m => ' '.repeat(m.length))));
  rec(lonely.length === 0, `coefficient or sign outside <bdi>: ${lonely.length} strings` + lonely.slice(0, 3).map(x => `\n         ${x.slice(0, 90)}`).join(''));
  if (fixture) return { lines, fails };

  rec(index.includes(id), `listed in ${course.indexRel}`);
  const sitePath = path.join(root, course.site, id + '.json');
  rec(fs.existsSync(sitePath) && fs.readFileSync(sitePath).equals(fs.readFileSync(hePath)), `${course.site} copy is byte-identical`);
  return { lines, fails };
}

if (selfTest) {
  // Replaces the old "untranslated topic" check: no real topic is untranslated any more, so a small broken fixture
  // (one section and one card of the measurement topic, with a planted fault per rule) proves every rule still bites.
  // The Organic fixture (one card of o-02-nomenclature plus a reading against its own English reading) proves the same for the Organic path.
  const expect = ['untranslated fields', 'sections:', 'cards:', 'raw super/subscript', 'Hebrew letters inside', 'semicolons', 'formula/Latin runs', 'coefficient or sign'];
  let bad = 0;
  for (const [file, label] of [['tools/fixtures/he-broken.json', ''], ['tools/fixtures/he-broken-organic.json', ' (organic)']]) {
    const fx = rd(file);
    const { lines, fails } = checkTopic(fx.topic_id, courseOf(fx.topic_id), fx);
    console.log(lines.join('\n'));
    const missed = expect.filter(e => !fails.some(f => f.startsWith(e)));
    console.log(`\nself-test${label}: ${expect.length - missed.length}/${expect.length} rules caught their planted fault${missed.length ? ' — MISSED: ' + missed.join(', ') : ''}`);
    if (missed.length) bad++;
  }
  process.exit(bad ? 1 : 0);
}

let failed = 0;
for (const [id, course] of jobs) {
  const { lines, fails } = checkTopic(id, course);
  console.log(`${fails.length ? 'FAIL' : 'PASS'} ${id}${course.organic ? ' (organic1)' : ''}`);
  console.log(lines.join('\n'));
  if (fails.length) failed++;
}
console.log(`\n${jobs.length - failed}/${jobs.length} topics PASS`);
process.exit(failed ? 1 : 0);
