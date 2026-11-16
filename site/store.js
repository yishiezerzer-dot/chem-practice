// Progress storage, one slot per course (v2). Runs in the browser (window.ChemStore) and in node (require), so
// tools/test-migration.js can test it without a browser. `ls` is localStorage or anything with getItem/setItem/removeItem.
(function (root) {
  const GEN = 'gen';
  const K = {
    v1: 'chemPractice.v1',                 // v1 slot (General Chemistry only). After a good copy it is a backup and is never written again.
    course: 'chemPractice.course',         // last course picked
    migrated: 'chemPractice.v2.migrated',  // information only: when the copy happened; nothing reads it
    v1seen: 'chemPractice.v2.v1seen',      // fingerprint of the v1 slot at the last merge (syncV1), to spot old-tab writes
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
  /** Old tab still open after the upgrade: it keeps writing the v1 slot. Merges v1 cards that changed since the last
   *  merge into the General Chemistry slot. Never writes or deletes v1; never touches another course.
   *  Per card, the side with the more recent review (last hist timestamp) gives step, due and fresh; the rating
   *  history is the union of both sides (same [time, rating] entry kept once), so every rating counts for weak topics.
   *  Returns 'no-v1' | 'not-in-use' (GC still runs on v1: copy not done or failed) | 'unchanged' (v1 same as last time,
   *  no writes) | 'same' (v1 changed, nothing new for GC) | 'merged' | 'write-failed' (GC slot left as it was; retried next time). */
  function syncV1(ls) {
    const raw = get(ls, K.v1);
    if (raw === null) return 'no-v1';
    if (genKey(ls) !== K.slot(GEN)) return 'not-in-use';
    const seen = fingerprint(raw);
    if (get(ls, K.v1seen) === seen) return 'unchanged';
    const old = parseObj(raw), gen = parseObj(get(ls, K.slot(GEN)));
    let result = 'same';
    if (old && old.cards && typeof old.cards === 'object') {
      const cards = Object.assign({}, gen.cards);
      for (const id in old.cards) { const m = mergeCard(cards[id], old.cards[id]); if (m) cards[id] = m; }
      if (!same(cards, gen.cards || {})) {
        try { ls.setItem(K.slot(GEN), JSON.stringify(Object.assign({}, gen, { cards }))); } catch (_) { return 'write-failed'; }
        result = 'merged';
      }
    }
    try { ls.setItem(K.v1seen, seen); } catch (_) {}
    return result;
  }
  const lastTs = c => { const h = c && Array.isArray(c.hist) ? c.hist : []; return h.length ? +h[h.length - 1][0] || 0 : 0; };
  /** Merged card, or null when the GC card `g` already has everything in the v1 card `o`. */
  function mergeCard(g, o) {
    if (!o || typeof o !== 'object') return null;
    if (!g) return o;
    const win = lastTs(o) > lastTs(g) ? o : g, seen = new Set(), hist = [];
    for (const e of [].concat(g.hist || [], o.hist || [])) { const k = JSON.stringify(e); if (!seen.has(k)) { seen.add(k); hist.push(e); } }
    hist.sort((a, b) => (+a[0] || 0) - (+b[0] || 0));
    const m = Object.assign({}, win, { hist });
    return same(m, g) ? null : m;
  }
  // Length + FNV-1a hash of the v1 string: changes whenever an old tab saves.
  function fingerprint(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return s.length + ':' + h.toString(16); }

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

  const API = { GEN, K, fresh, same, migrate, syncV1, genKey, keyFor, loadState, saveState, buildExport, parseImport, writeImport };
  if (typeof module === 'object' && module.exports) module.exports = API;
  if (root) root.ChemStore = API;
})(typeof window !== 'undefined' ? window : null);
