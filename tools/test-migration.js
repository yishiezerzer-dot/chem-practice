#!/usr/bin/env node
// Repeatable test for site/store.js (v1 -> v2 progress migration, per-course slots, export/import).
// Run:  node tools/test-migration.js      (no browser, no dependencies; exit code 1 if any check fails)
//
// What each case proves:
//  (a) migrate() on a v1-only storage copies the General Chemistry progress byte for byte, every card/session/flag
//      reads back identically from the gen slot, weak-topic counts (as app.js weak() computes them) do not change,
//      and genKey() switches to chemPractice.v2.gen.
//  (b) The v1 slot is never touched by the copy (kept as a backup).
//  (c) Running migrate() again is a no-op ('already'): the whole storage snapshot is unchanged.
//  (d) If the copy cannot be made correctly (truncated write, one-character corruption, write throws), migrate()
//      returns 'fallback', removes the partial copy, and the app keeps using v1 with all data intact. Also covers an
//      unparseable v1 ('bad-original') and an empty storage ('none').
//  (e) Course slots are isolated: saving organic1 never changes gen or v1; saving gen never changes organic1 or v1.
//  (f) An old v1-format export file imports into General Chemistry only (organic1 untouched); a v2 export round-trips
//      both courses; parseImport rejects things that are not backups.

const fs = require('fs');
const path = require('path');
const store = require(path.join(__dirname, '..', 'site', 'store.js'));
const { fresh, same, migrate, genKey, loadState, saveState, buildExport, parseImport, writeImport, K } = store;
const assert = require('assert');

// ---------- tiny harness ----------
let total = 0, passed = 0;
function check(name, fn) {
  total++;
  try {
    const r = fn();
    if (r === false) throw new Error('returned false');
    passed++; console.log('PASS  ' + name);
  } catch (e) {
    console.log('FAIL  ' + name + '\n        ' + String(e.message).split('\n').join('\n        '));
  }
}
const eq = (a, b, msg) => assert.deepStrictEqual(a, b, msg);

// ---------- fake storage ----------
class FakeStorage {
  constructor(init) { this.m = new Map(Object.entries(init || {})); }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
  snapshot() { return Object.fromEntries(this.m); }
}
const GEN_KEY = 'chemPractice.v2.gen';
class TruncatingStorage extends FakeStorage {
  setItem(k, v) { super.setItem(k, k === GEN_KEY ? String(v).slice(0, Math.floor(String(v).length / 2)) : v); }
}
class CorruptingStorage extends FakeStorage {
  setItem(k, v) {
    v = String(v);
    if (k === GEN_KEY) { // change the last digit of the first "due" value: still valid JSON, different data
      const re = /("due":\d*)(\d)/;
      const m = re.exec(v); if (!m) throw new Error('fixture has no due date to corrupt');
      v = v.replace(re, (_, a, d) => a + ((+d + 1) % 10));
    }
    super.setItem(k, v);
  }
}
class ThrowingStorage extends FakeStorage {
  setItem(k, v) {
    if (k === GEN_KEY) { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; }
    super.setItem(k, v);
  }
}

// ---------- fixture: realistic v1 General Chemistry state ----------
const DAY = 86400000;
const NOW = Date.UTC(2026, 10, 15, 12, 0, 0); // fixed "now" used for weak-topic windows
const questions = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'questions.json'), 'utf8')).questions;
const byTopic = {};
for (const q of questions) (byTopic[q.topic] = byTopic[q.topic] || []).push(q.id);
const topics = Object.keys(byTopic);
if (topics.length < 3) throw new Error('need at least 3 topics in questions.json');
const [tA, tB, tC] = topics;
const id = (t, i) => byTopic[t][i];
const ago = (days, extraMs = 0) => NOW - days * DAY - extraMs;
const midnight = days => Date.UTC(2026, 10, 15) + days * DAY; // due dates like today()+INTERVALS*DAY

const S = {
  cards: {
    [id(tA, 0)]: { step: 2, hist: [[ago(30), 'didnt'], [ago(20), 'unsure'], [ago(3), 'knew'], [ago(1), 'knew']], due: midnight(7), fresh: false },
    [id(tA, 1)]: { step: 0, hist: [[ago(2), 'didnt'], [ago(2, 60000), 'unsure']], due: midnight(1), fresh: true },
    [id(tB, 0)]: { step: 1, hist: [[ago(10), 'unsure'], [ago(5), 'knew'], [ago(40), 'didnt']], due: midnight(3), fresh: true },
    [id(tB, 1)]: { step: 2, hist: [[ago(13.5), 'knew'], [ago(0.2), 'unsure']], due: midnight(14), fresh: true },
    [id(tC, 0)]: { step: 0, hist: [[ago(1), 'didnt'], [ago(1, 5000), 'didnt'], [ago(0.1), 'unsure']], due: midnight(1), fresh: true },
    [id(tC, 1)]: { step: 1, hist: [[ago(60), 'knew'], [ago(9), 'knew']], due: midnight(-2), fresh: true },
    [id(tC, 2)]: { step: 2, hist: [[ago(4), 'unsure'], [ago(0.5), 'knew']], due: midnight(5), fresh: true }
  },
  session: { topic: tB, queue: [id(tB, 2), id(tB, 3)], total: 4, worst: { [id(tB, 0)]: 'unsure' }, seen: { [id(tB, 0)]: 1 } },
  hideTips: true,
  lastExport: ago(6),
  firstRating: ago(60),
  nudgeHide: 2
};
const V1_RAW = JSON.stringify(S); // exactly like app.js save()
const V1 = K.v1;

// mirrors app.js weak(): per topic, count ratings with ts >= now - 14 days
function weakCounts(state, qs, now) {
  const since = now - 14 * DAY, out = {};
  for (const t of [...new Set(qs.map(q => q.topic))]) {
    let k = 0, u = 0, d = 0;
    qs.filter(q => q.topic === t).forEach(q => ((state.cards[q.id] || {}).hist || []).forEach(([ts, r]) => {
      if (ts >= since) r === 'knew' ? k++ : r === 'unsure' ? u++ : d++;
    }));
    if (k + u + d) out[t] = { k, u, d };
  }
  return out;
}
const v1Storage = () => new FakeStorage({ [V1]: V1_RAW });

// fixture sanity: the checks below are only meaningful if these hold
check('fixture: >=6 cards, >=3 topics, steps 0/1/2, a fresh:false card, weak counts non-trivial', () => {
  const ids = Object.keys(S.cards);
  assert(ids.length >= 6);
  const topicOf = Object.fromEntries(questions.map(q => [q.id, q.topic]));
  assert(ids.every(i => topicOf[i]), 'card ids must be real question ids');
  assert(new Set(ids.map(i => topicOf[i])).size >= 3);
  assert(new Set(ids.map(i => S.cards[i].step)).size === 3);
  assert(ids.some(i => S.cards[i].fresh === false));
  const w = weakCounts(S, questions, NOW);
  assert(Object.keys(w).length >= 3);
  assert(Object.values(w).some(x => x.k && x.u && x.d) || Object.values(w).reduce((a, x) => a + x.k + x.u + x.d, 0) > 8);
});

// ---------- (a) + (b) + (c) good migration ----------
const good = v1Storage();
const before = good.snapshot();
const wBefore = weakCounts(loadState(good, 'gen'), questions, NOW);
check('(a) v1-only storage: genKey is v1 before migration', () => eq(genKey(good), V1));
let res;
check('(a) migrate returns "copied"', () => { res = migrate(good); eq(res, 'copied'); });
check('(a) gen slot string === v1 string byte for byte', () => eq(good.getItem(GEN_KEY), V1_RAW));
check('(a) loadState gen: every card due/step/hist/fresh deep-equals the original', () => {
  const st = loadState(good, 'gen');
  eq(Object.keys(st.cards).sort(), Object.keys(S.cards).sort());
  for (const cid of Object.keys(S.cards)) {
    eq(st.cards[cid].due, S.cards[cid].due, cid + ' due');
    eq(st.cards[cid].step, S.cards[cid].step, cid + ' step');
    eq(st.cards[cid].hist, S.cards[cid].hist, cid + ' hist');
    eq(st.cards[cid], S.cards[cid], cid + ' whole card');
  }
});
check('(a) loadState gen: session, hideTips, firstRating, lastExport, nudgeHide equal the original', () => {
  const st = loadState(good, 'gen');
  eq(st.session, S.session); eq(st.hideTips, S.hideTips); eq(st.firstRating, S.firstRating);
  eq(st.lastExport, S.lastExport); eq(st.nudgeHide, S.nudgeHide);
});
check('(a) weakCounts identical before and after migration', () => eq(weakCounts(loadState(good, 'gen'), questions, NOW), wBefore));
check('(a) genKey returns chemPractice.v2.gen', () => eq(genKey(good), GEN_KEY));
check('(b) v1 slot still present and byte-identical after migration', () => eq(good.getItem(V1), before[V1]));
check('(b) migration only added the gen slot and the informational migrated marker', () => {
  const after = good.snapshot();
  eq(Object.keys(after).sort(), [V1, GEN_KEY, K.migrated].sort());
});
const snapGood = good.snapshot();
check('(c) second migrate returns "already"', () => eq(migrate(good), 'already'));
check('(c) full storage snapshot identical after second migrate (every key and value)', () => eq(good.snapshot(), snapGood));

// ---------- (d) faulty storages ----------
for (const [label, Cls] of [['truncated write', TruncatingStorage], ['one-character corruption', CorruptingStorage], ['setItem throws', ThrowingStorage]]) {
  const ls = new Cls({ [V1]: V1_RAW });
  let r;
  check(`(d) ${label}: migrate returns "fallback"`, () => { r = migrate(ls); eq(r, 'fallback'); });
  check(`(d) ${label}: gen slot is absent`, () => eq(ls.getItem(GEN_KEY), null));
  check(`(d) ${label}: genKey returns chemPractice.v1`, () => eq(genKey(ls), V1));
  check(`(d) ${label}: loadState gen deep-equals fresh(original)`, () => eq(loadState(ls, 'gen'), fresh(S)));
  check(`(d) ${label}: v1 byte-identical`, () => eq(ls.getItem(V1), V1_RAW));
  check(`(d) ${label}: no stray keys (only v1 remains)`, () => eq(Object.keys(ls.snapshot()), [V1]));
}
{
  const ls = new FakeStorage({ [V1]: '{"cards":' });
  const snap = ls.snapshot();
  check('(d) unparseable v1: migrate returns "bad-original"', () => eq(migrate(ls), 'bad-original'));
  check('(d) unparseable v1: nothing written (snapshot unchanged)', () => eq(ls.snapshot(), snap));
  check('(d) unparseable v1: genKey returns v1', () => eq(genKey(ls), V1));
}
{
  const ls = new FakeStorage();
  check('(d) empty storage: migrate returns "none"', () => eq(migrate(ls), 'none'));
  check('(d) empty storage: snapshot stays empty', () => eq(ls.snapshot(), {}));
}

// ---------- (e) slot isolation ----------
{
  const ls = v1Storage(); migrate(ls);
  const v1Raw = ls.getItem(V1), genRaw0 = ls.getItem(GEN_KEY);
  const o = loadState(ls, 'organic1'); o.cards['o-1-q1'] = { step: 0, hist: [[NOW, 'knew']], due: midnight(1), fresh: false };
  saveState(ls, 'organic1', o);
  check('(e) saving organic1 leaves gen slot byte-identical', () => eq(ls.getItem(GEN_KEY), genRaw0));
  check('(e) saving organic1 leaves v1 byte-identical', () => eq(ls.getItem(V1), v1Raw));
  check('(e) organic1 slot holds the new card', () => assert('o-1-q1' in loadState(ls, 'organic1').cards));
  const orgRaw = ls.getItem('chemPractice.v2.organic1');
  const g = loadState(ls, 'gen'); const rated = id(tA, 2);
  g.cards[rated] = { step: 0, hist: [[NOW, 'didnt']], due: midnight(1), fresh: true };
  saveState(ls, 'gen', g);
  check('(e) saving gen leaves organic1 slot byte-identical', () => eq(ls.getItem('chemPractice.v2.organic1'), orgRaw));
  check('(e) saving gen leaves v1 byte-identical', () => eq(ls.getItem(V1), v1Raw));
  check('(e) saving gen wrote to the v2 gen slot (new card present, differs from v1)', () => {
    assert(rated in JSON.parse(ls.getItem(GEN_KEY)).cards); assert(!(rated in JSON.parse(v1Raw).cards));
  });
  check('(e) organic1 has no gen card ids, gen has no organic1 ids', () => {
    const oc = Object.keys(loadState(ls, 'organic1').cards), gc = Object.keys(loadState(ls, 'gen').cards);
    assert(!oc.some(i => gc.includes(i))); assert(!gc.includes('o-1-q1'));
  });
}

// ---------- (f) import / export ----------
{
  // old-style export file, built exactly like the old doExport
  const file = JSON.parse(JSON.stringify(S, null, 1));
  const ls = v1Storage(); migrate(ls);
  const o = loadState(ls, 'organic1'); o.cards['o-1-q1'] = { step: 1, hist: [[NOW, 'unsure']], due: midnight(3), fresh: true };
  saveState(ls, 'organic1', o);
  const orgRaw = ls.getItem('chemPractice.v2.organic1'), v1Raw = ls.getItem(V1);
  // pre-change the gen slot so the import has something to overwrite
  const g = loadState(ls, 'gen'); g.cards = {}; saveState(ls, 'gen', g);
  let plan, written;
  check('(f) old export: parseImport targets General Chemistry only', () => { plan = parseImport(file, ['gen', 'organic1']); eq(Object.keys(plan), ['gen']); });
  check('(f) old export: writeImport returns ["gen"]', () => { written = writeImport(ls, plan); eq(written, ['gen']); });
  check('(f) old export: gen cards deep-equal the export cards', () => eq(loadState(ls, 'gen').cards, file.cards));
  check('(f) old export: other gen fields (session, flags) restored too', () => {
    const st = loadState(ls, 'gen');
    eq(st.session, S.session); eq(st.hideTips, true); eq(st.firstRating, S.firstRating); eq(st.nudgeHide, 2);
  });
  check('(f) old export: organic1 slot byte-identical', () => eq(ls.getItem('chemPractice.v2.organic1'), orgRaw));
  check('(f) old export: v1 slot byte-identical', () => eq(ls.getItem(V1), v1Raw));
}
{
  // v2 round trip
  const ls = v1Storage(); migrate(ls);
  const o = loadState(ls, 'organic1');
  o.cards['o-1-q1'] = { step: 1, hist: [[NOW - DAY, 'knew'], [NOW, 'didnt']], due: midnight(3), fresh: false };
  saveState(ls, 'organic1', o);
  const EXPORT_NOW = NOW + 1000;
  const exp = buildExport(ls, ['gen', 'organic1'], EXPORT_NOW);
  const file = JSON.parse(JSON.stringify(exp, null, 1));
  const dst = new FakeStorage();
  const plan = parseImport(file, ['gen', 'organic1']);
  check('(f) v2 round trip: parseImport finds both courses', () => eq(Object.keys(plan).sort(), ['gen', 'organic1']));
  writeImport(dst, plan);
  check('(f) v2 round trip: gen cards reproduced', () => eq(loadState(dst, 'gen').cards, S.cards));
  check('(f) v2 round trip: organic1 cards reproduced', () => eq(loadState(dst, 'organic1').cards, o.cards));
  check('(f) v2 round trip: export stamped lastExport in both courses and in the source storage', () => {
    eq(file.courses.gen.lastExport, EXPORT_NOW); eq(file.courses.organic1.lastExport, EXPORT_NOW);
    eq(loadState(ls, 'gen').lastExport, EXPORT_NOW); eq(loadState(ls, 'organic1').lastExport, EXPORT_NOW);
  });
  check('(f) v2 export format header', () => { eq(file.format, 'chem-practice'); eq(file.version, 2); });
}
check('(f) parseImport returns null for {}', () => eq(parseImport({}, ['gen', 'organic1']), null));
check('(f) parseImport returns null for {courses:{gen:{}}} (no cards)', () => eq(parseImport({ courses: { gen: {} } }, ['gen', 'organic1']), null));
check('(f) parseImport returns null for non-objects (null, string, number, undefined)', () => {
  for (const x of [null, 'abc', 42, undefined]) eq(parseImport(x, ['gen', 'organic1']), null);
});

console.log(`\n${passed}/${total} checks passed`);
process.exit(passed === total ? 0 : 1);
