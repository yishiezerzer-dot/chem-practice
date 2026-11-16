// Progress storage, one slot per course (v2). Runs in the browser (window.ChemStore) and in node (require), so
// tools/test-migration.js can test it without a browser. `ls` is localStorage or anything with getItem/setItem/removeItem.
(function (root) {
  const GEN = 'gen';
  const K = {
    v1: 'chemPractice.v1',                 // v1 slot (General Chemistry only). After a good copy it is a backup and is never written again.
    course: 'chemPractice.course',         // last course picked
    migrated: 'chemPractice.v2.migrated',  // information only: when the copy happened; nothing reads it
    slot: id => 'chemPractice.v2.' + id    // per-course progress: chemPractice.v2.gen, chemPractice.v2.organic1
  };
  const fresh = s => Object.assign({ cards: {}, session: null, hideTips: false, lastExport: null, firstRating: null, nudgeHide: 0 }, s);
  const parseObj = raw => { try { const o = JSON.parse(raw); return o && typeof o === 'object' && !Array.isArray(o) ? o : null; } catch { return null; } };
  const get = (ls, k) => { try { return ls.getItem(k); } catch { return null; } };
  function same(a, b) {
    if (a === b) return true;
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
    const ka = Object.keys(a), kb = Object.keys(b);
    return ka.length === kb.length && ka.every(k => Object.prototype.hasOwnProperty.call(b, k) && same(a[k], b[k]));
  }

  /** One-time copy of the v1 slot into the General Chemistry slot. Returns what it did:
   *  'already' (GC slot exists: no writes), 'none' (no v1 data), 'bad-original' (v1 is not a JSON object: not copied),
   *  'copied' (exact copy, checked), 'fallback' (write failed or the copy did not match: partial copy removed, v1 stays in use). */
  function migrate(ls) {
    const dst = K.slot(GEN);
    if (get(ls, dst) !== null) return 'already';
    const raw = get(ls, K.v1);
    if (raw === null) return 'none';
    const old = parseObj(raw);
    if (!old) return 'bad-original';
    try {
      ls.setItem(dst, raw); // the same string, byte for byte
      const back = ls.getItem(dst);
      const copy = back === raw ? parseObj(back) : null;
      if (!copy || !same(copy, old)) throw new Error('copy does not match');
    } catch (_) {
      try { ls.removeItem(dst); } catch (_) {}
      return 'fallback';
    }
    try { ls.setItem(K.migrated, JSON.stringify({ from: K.v1, at: Date.now(), bytes: raw.length })); } catch (_) {}
    return 'copied';
  }

  /** Slot General Chemistry reads and writes: the v2 slot when it holds a valid object; otherwise the v1 slot if it exists
   *  (copy not done or failed: same behaviour as before v2); otherwise the v2 slot (new student). */
  function genKey(ls) {
    const g = K.slot(GEN), raw = get(ls, g);
    if (raw !== null && parseObj(raw)) return g;
    if (get(ls, K.v1) !== null) return K.v1;
    return g;
  }
  const keyFor = (ls, course) => course === GEN ? genKey(ls) : K.slot(course);
  const loadState = (ls, course) => fresh(parseObj(get(ls, keyFor(ls, course))) || {});
  const saveState = (ls, course, state) => ls.setItem(keyFor(ls, course), JSON.stringify(state));

  /** Export file with every course. Stamps lastExport in each course (the backup reminder is per course). */
  function buildExport(ls, courseIds, now) {
    const courses = {};
    for (const id of courseIds) {
      const s = loadState(ls, id); s.lastExport = now; saveState(ls, id, s); courses[id] = s;
    }
    return { format: 'chem-practice', version: 2, courses };
  }
  /** Reads an import file. Returns { courseId: state } to write, or null if it is not a backup.
   *  v2 file: each listed known course (each must have cards). Old v1 file (top-level cards): General Chemistry only. */
  function parseImport(data, courseIds) {
    if (!data || typeof data !== 'object') return null;
    if (data.courses && typeof data.courses === 'object') {
      const ids = Object.keys(data.courses).filter(id => courseIds.includes(id));
      if (!ids.length || ids.some(id => !(data.courses[id] && typeof data.courses[id] === 'object' && data.courses[id].cards))) return null;
      return Object.fromEntries(ids.map(id => [id, fresh(data.courses[id])]));
    }
    if (data.cards) return { [GEN]: fresh(data) };
    return null;
  }
  const writeImport = (ls, plan) => { for (const id in plan) saveState(ls, id, plan[id]); return Object.keys(plan); };

  const API = { GEN, K, fresh, same, migrate, genKey, keyFor, loadState, saveState, buildExport, parseImport, writeImport };
  if (typeof module === 'object' && module.exports) module.exports = API;
  if (root) root.ChemStore = API;
})(typeof window !== 'undefined' ? window : null);
