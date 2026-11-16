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

// ---------- (g) old tab writes v1 after migration (syncV1) ----------
{
  const { syncV1 } = store;
  const ORG = 'chemPractice.v2.organic1', ORG_RAW = JSON.stringify({ cards: { 'o-1-q1': { step: 1, hist: [[NOW, 'knew']], due: midnight(3), fresh: false } } });
  class RecordingStorage extends FakeStorage {
    constructor(init) { super(init); this.log = []; this.failKey = null; }
    setItem(k, v) { this.log.push(['set', k]); if (k === this.failKey) { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; } super.setItem(k, v); }
    removeItem(k) { this.log.push(['remove', k]); super.removeItem(k); }
  }
  const audit = []; // one record per syncV1 call in this section
  function runSync(ls) {
    const org = ls.getItem(ORG), v1 = ls.getItem(V1);
    ls.log.length = 0;
    const res = syncV1(ls);
    const rec = { res, ops: ls.log.slice(), orgSame: ls.getItem(ORG) === org, v1Same: ls.getItem(V1) === v1 };
    audit.push(rec); return rec;
  }
  const hasV1Op = rec => rec.ops.some(([, k]) => k === V1);
  const unionSorted = (...hs) => {
    const seen = new Set(), out = [];
    for (const e of [].concat(...hs)) { const k = JSON.stringify(e); if (!seen.has(k)) { seen.add(k); out.push(e); } }
    return out.sort((a, b) => a[0] - b[0]);
  };
  const noDup = h => new Set(h.map(e => JSON.stringify(e))).size === h.length;
  const isSorted = h => h.every((e, i) => !i || h[i - 1][0] <= e[0]);
  const newStore = () => { const ls = new RecordingStorage({ [V1]: V1_RAW }); migrate(ls); ls.setItem(ORG, ORG_RAW); return ls; };

  // (a) old tab rates cards of one topic (incl. a card not yet in gen) and writes v1
  const ls = newStore();
  const oldTab = JSON.parse(ls.getItem(V1));
  const a0 = id(tA, 0), a1 = id(tA, 1), a2 = id(tA, 2);
  oldTab.cards[a0].hist.push([NOW + 1000, 'didnt']); Object.assign(oldTab.cards[a0], { step: 0, due: midnight(1), fresh: true });
  oldTab.cards[a1].hist.push([NOW + 2000, 'knew']); Object.assign(oldTab.cards[a1], { step: 1, due: midnight(3), fresh: true });
  oldTab.cards[a2] = { step: 2, hist: [[NOW + 3000, 'knew']], due: midnight(14), fresh: false };
  const wPre = weakCounts(loadState(ls, 'gen'), questions, NOW);
  ls.setItem(V1, JSON.stringify(oldTab));
  let rA;
  check('(g)(a) old-tab write after migration: syncV1 returns "merged"', () => { rA = runSync(ls); eq(rA.res, 'merged'); });
  check('(g)(a) gen has the old tab\'s step/due/fresh/hist for the three rated cards (incl. the card new to gen)', () => {
    const st = loadState(ls, 'gen');
    for (const cid of [a0, a1, a2]) eq(st.cards[cid], Object.assign({}, oldTab.cards[cid], { hist: unionSorted(oldTab.cards[cid].hist) }), cid); // fixture hists are not all in time order; merge sorts them
  });
  check('(g)(a) untouched cards and non-card fields of gen are unchanged', () => {
    const st = loadState(ls, 'gen');
    for (const cid of [id(tA, 0), id(tA, 1), id(tA, 2)]) assert(cid in st.cards);
    for (const cid of [id(tB, 1), id(tC, 0), id(tC, 1), id(tC, 2)]) eq(st.cards[cid], Object.assign({}, S.cards[cid], { hist: unionSorted(S.cards[cid].hist) }), cid);
    eq(st.session, S.session); eq(st.hideTips, true); eq(st.lastExport, S.lastExport); eq(st.firstRating, S.firstRating); eq(st.nudgeHide, 2);
  });
  check('(g)(a) weak-topic counts mirror the new ratings (and differ from before the sync)', () => {
    const wNow = weakCounts(loadState(ls, 'gen'), questions, NOW);
    eq(wNow, weakCounts(oldTab, questions, NOW));
    assert(JSON.stringify(wNow) !== JSON.stringify(wPre));
    const cnt = t => { const x = wNow[t], p = wPre[t] || { k: 0, u: 0, d: 0 }; return [x.k - p.k, x.u - p.u, x.d - p.d]; };
    eq(cnt(tA), [2, 0, 1]); // two new 'knew' (a1, a2) and one new 'didnt' (a0) in topic A
  });
  check('(g)(a) gen hists are sorted with no duplicates', () => {
    for (const c of Object.values(loadState(ls, 'gen').cards)) { assert(isSorted(c.hist)); assert(noDup(c.hist)); }
  });

  // (c) part 1: second run is a no-op
  const snapMerged = ls.snapshot();
  check('(g)(c) second syncV1 right after a merge returns "unchanged"', () => { eq(runSync(ls).res, 'unchanged'); });
  check('(g)(c) whole storage snapshot identical after the no-op run (every key and value)', () => eq(ls.snapshot(), snapMerged));
  check('(g)(c) the no-op run made no writes at all', () => eq(audit[audit.length - 1].ops, []));

  // (c) part 2: v1 rewritten byte-different but card-identical (only session changed)
  const v1Obj = JSON.parse(ls.getItem(V1));
  v1Obj.session = { topic: tA, queue: [], total: 1, worst: {}, seen: {} };
  ls.setItem(V1, JSON.stringify(v1Obj));
  const genBefore = ls.getItem(GEN_KEY);
  check('(g)(c) v1 changed only in session: syncV1 returns "same"', () => eq(runSync(ls).res, 'same'));
  check('(g)(c) "same": gen slot byte-identical, session of gen not taken from v1', () => {
    eq(ls.getItem(GEN_KEY), genBefore); eq(loadState(ls, 'gen').session, S.session);
  });
  check('(g)(c) "same": no write to gen slot', () => assert(!audit[audit.length - 1].ops.some(([, k]) => k === GEN_KEY)));
  check('(g)(c) call after "same" returns "unchanged" (fingerprint recorded)', () => eq(runSync(ls).res, 'unchanged'));

  // (b) newer review wins either way round, in the same run
  const lb = newStore();
  const X = id(tC, 0), Y = id(tC, 2), Z = id(tB, 1);
  const v1b = JSON.parse(lb.getItem(V1));
  const xNew = [NOW + 5000, 'knew'], yNew = [NOW + 6000, 'didnt'], yExtra = [ago(70), 'unsure'], zExtra = [ago(50), 'didnt'];
  Object.assign(v1b.cards[X], { step: 2, due: midnight(9), fresh: false }); v1b.cards[X].hist.push(xNew);       // X newer in v1
  v1b.cards[Y].hist.unshift(yExtra);                                                                            // Y older in v1 but has an extra old entry
  v1b.cards[Z].hist.unshift(zExtra); Object.assign(v1b.cards[Z], { step: 0, due: midnight(30), fresh: false }); // Z: same last review (tie)
  const g = loadState(lb, 'gen');                                                                               // Y newer in v2.gen
  Object.assign(g.cards[Y], { step: 0, due: midnight(1), fresh: true }); g.cards[Y].hist.push(yNew);
  saveState(lb, 'gen', g);
  const genY = JSON.parse(lb.getItem(GEN_KEY)).cards[Y], genZ = JSON.parse(lb.getItem(GEN_KEY)).cards[Z];
  lb.setItem(V1, JSON.stringify(v1b));
  let rB;
  check('(g)(b) mixed run: syncV1 returns "merged"', () => { rB = runSync(lb); eq(rB.res, 'merged'); });
  const stB = () => loadState(lb, 'gen');
  check('(g)(b) card X newer in v1: v1 step/due/fresh win, hist is the sorted union', () => {
    const c = stB().cards[X];
    eq([c.step, c.due, c.fresh], [2, midnight(9), false]);
    eq(c.hist, unionSorted(S.cards[X].hist, [xNew]));
  });
  check('(g)(b) card Y newer in gen: gen step/due/fresh win, hist is the sorted union incl. v1\'s extra entry', () => {
    const c = stB().cards[Y];
    eq([c.step, c.due, c.fresh], [0, midnight(1), true]);
    eq(c.hist, unionSorted(genY.hist, [yExtra]));
    assert(c.hist.some(e => JSON.stringify(e) === JSON.stringify(yExtra)) && c.hist.some(e => JSON.stringify(e) === JSON.stringify(yNew)));
  });
  check('(g)(b) tie on last review: gen\'s step/due/fresh kept, hist still the union', () => {
    const c = stB().cards[Z];
    eq([c.step, c.due, c.fresh], [genZ.step, genZ.due, genZ.fresh]);
    eq(c.hist, unionSorted(genZ.hist, [zExtra]));
  });
  check('(g)(b) every merged hist is sorted by time with identical entries kept once', () => {
    for (const cid of [X, Y, Z]) { const h = stB().cards[cid].hist; assert(isSorted(h), cid + ' sorted'); assert(noDup(h), cid + ' no dup'); }
  });
  check('(g)(b) gen-only cards unchanged; other fields keep gen values', () => {
    const st = stB();
    eq(st.cards[id(tA, 0)], S.cards[id(tA, 0)]); eq(st.session, S.session); eq(st.nudgeHide, 2); eq(st.lastExport, S.lastExport);
  });

  // other fields keep gen's values even when v1 differs in them
  {
    const lo = newStore(); const o = JSON.parse(lo.getItem(V1));
    Object.assign(o, { hideTips: false, lastExport: 1, firstRating: 2, nudgeHide: 9, session: null });
    o.cards[id(tA, 1)].hist.push([NOW + 9000, 'knew']);
    lo.setItem(V1, JSON.stringify(o));
    check('(g) v1 with different session/hideTips/lastExport/firstRating/nudgeHide: merged, those fields keep gen\'s values', () => {
      eq(runSync(lo).res, 'merged');
      const st = loadState(lo, 'gen');
      eq(st.session, S.session); eq(st.hideTips, true); eq(st.lastExport, S.lastExport); eq(st.firstRating, S.firstRating); eq(st.nudgeHide, 2);
    });
  }

  // (g) edge cases
  {
    const e = new RecordingStorage();
    check('(g) no v1 at all: "no-v1" and no writes', () => { const r = runSync(e); eq(r.res, 'no-v1'); eq(r.ops, []); eq(e.snapshot(), {}); });
    const e2 = new RecordingStorage({ [GEN_KEY]: V1_RAW });
    check('(g) gen present but no v1: "no-v1" and no writes', () => { const r = runSync(e2); eq(r.res, 'no-v1'); eq(r.ops, []); });
  }
  {
    const nu = new RecordingStorage({ [V1]: V1_RAW }); nu.failKey = GEN_KEY;
    check('(g) setup: copy fails so GC stays on v1 (migrate "fallback")', () => { eq(migrate(nu), 'fallback'); eq(nu.getItem(GEN_KEY), null); });
    nu.failKey = null;
    const snap = nu.snapshot();
    check('(g) GC slot not in use (no gen slot, v1 exists): "not-in-use" and no writes', () => {
      const r = runSync(nu); eq(r.res, 'not-in-use'); eq(r.ops, []); eq(nu.snapshot(), snap);
    });
  }
  {
    const wf = newStore();
    const v = JSON.parse(wf.getItem(V1)); v.cards[id(tA, 1)].hist.push([NOW + 7000, 'knew']); wf.setItem(V1, JSON.stringify(v));
    const genRaw = wf.getItem(GEN_KEY); wf.failKey = GEN_KEY;
    let r;
    check('(g) setItem throws for gen during sync: "write-failed"', () => { r = runSync(wf); eq(r.res, 'write-failed'); });
    check('(g) write-failed: gen byte-identical, v1seen not written, v1 untouched', () => {
      eq(wf.getItem(GEN_KEY), genRaw); eq(wf.getItem(K.v1seen), null); assert(!r.ops.some(([, k]) => k === K.v1seen)); assert(r.v1Same);
    });
    wf.failKey = null;
    check('(g) write-failed: next call retries and returns "merged"; v1seen then recorded', () => {
      eq(runSync(wf).res, 'merged'); assert(wf.getItem(K.v1seen) !== null);
      eq(loadState(wf, 'gen').cards[id(tA, 1)].hist.slice(-1)[0], [NOW + 7000, 'knew']);
    });
  }

  // (d) + (e) over every syncV1 call in this section
  check('(g)(d) organic1 slot byte-identical after every syncV1 call in this section', () => {
    assert(audit.length >= 10, 'expected many calls, got ' + audit.length);
    audit.forEach((r, i) => assert(r.orgSame, 'call #' + i + ' (' + r.res + ') changed organic1'));
    eq(ls.getItem(ORG), ORG_RAW); eq(lb.getItem(ORG), ORG_RAW);
  });
  check('(g)(d) no syncV1 call ever wrote or removed the organic1 key', () => {
    audit.forEach((r, i) => assert(!r.ops.some(([, k]) => k === ORG), 'call #' + i));
  });
  check('(g)(e) no setItem/removeItem on chemPractice.v1 during any syncV1 call', () => {
    audit.forEach((r, i) => assert(!hasV1Op(r), 'call #' + i + ' (' + r.res + ') touched v1'));
  });
  check('(g)(e) v1 string identical before/after every syncV1 call', () => {
    audit.forEach((r, i) => assert(r.v1Same, 'call #' + i));
  });
  check('(g)(e) the only keys syncV1 ever wrote are gen and v1seen', () => {
    const keys = new Set(audit.flatMap(r => r.ops.map(([op, k]) => op + ':' + k)));
    eq([...keys].sort(), ['set:' + GEN_KEY, 'set:' + K.v1seen].sort());
  });
  check('(g) all result codes seen: merged, unchanged, same, no-v1, not-in-use, write-failed', () => {
    const seen = new Set(audit.map(r => r.res));
    for (const c of ['merged', 'unchanged', 'same', 'no-v1', 'not-in-use', 'write-failed']) assert(seen.has(c), c);
  });
}

console.log(`\n${passed}/${total} checks passed`);
process.exit(passed === total ? 0 : 1);
