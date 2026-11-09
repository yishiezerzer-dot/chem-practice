/* Hebrew bidi helper (H2b). heWrap(s) wraps every run of Latin, Greek, math or formula characters that sits in Hebrew
   prose in <bdi>…</bdi>, so the browser keeps it left-to-right and (with the CSS rule) on one line.
   Used by fmtRich in Hebrew mode as a safety net, and by tools/check-he.js to find unwrapped runs in the data.
   Left alone on purpose (exceptions):
   - strings with no Hebrew letters (English fallback text, card lines that are only a formula: isolated elsewhere)
   - bracketed English terms, <bdi>(mole)</bdi>: kept as their own isolate, never merged into a formula
   - plain numbers in a sentence (3 ספרות, 25%) and lone operators between Hebrew words (פרוטונים − אלקטרונים)
   - sentence punctuation (. , : ; ! ?), connectors (= ≈ → ←) and unmatched brackets at the edges of a run stay outside
   Two formula isolates joined only by spaces, operators, numbers and balanced brackets (<bdi>a</bdi> = <bdi>b</bdi>)
   are merged into one, because separate LTR isolates in an RTL line are shown in reverse order (b = a).
   Commas, colons and Hebrew keep them apart. */
(function (root) {
  const HEB = /[֐-׿יִ-ﭏ]/;
  const TOKEN = /<bdi>(?:[^<]|<(?!\/?bdi>))*<\/bdi>|<(sub|sup)>(?:[^<]|<(?!\/?su[bp]>)|<(sub|sup)>[^<]*<\/\2>)*<\/\1>|<span class="nw">[^<]*<\/span>|[\s\S]/g;
  const TERM = /^<bdi>\([A-Za-z][A-Za-z '’\-–]*\)<\/bdi>$/;     // bracketed English term, e.g. (mole)
  const BOUND = /[֐-׿יִ-ﭏ“”"„«»]/; // Hebrew letters/punctuation (maqaf, ״) and quotes
  const LETTER = /[A-Za-zͰ-ϿµÅ]|<su[bp]>|class="nw"/;   // Latin, Greek, µ, Å, sub/superscript
  const OP = /[=×÷/|^→←⇌⇄≈≤≥<>±·∙√∑°∞∝−+]|&lt;|&gt;/;                      // math operators and symbols
  const EDGE = /^[\s.,:;!?…=×÷/|→←⇌⇄≈≤≥<>±·∙~*–—+−-]$/;          // may be trimmed from the ends of a run
  const SEP = /^[\s\d()=+−×÷/≈→⇌⇄≤≥±·∙<>]*$/;                               // what may sit between two isolates that merge (no . , :)

  function heWrap(s) {
    s = String(s);
    if (!HEB.test(s.replace(/<bdi>[\s\S]*?<\/bdi>/g, ''))) {
      // No Hebrew: leave it, unless it is a Hebrew-data line made of several isolates (<bdi>a</bdi>. <bdi>b</bdi>.),
      // which becomes one isolate so the pieces keep their left-to-right order. English data never contains <bdi>.
      if (!/<bdi>/.test(s) || /^<bdi>(?:[^<]|<(?!\/?bdi>))*<\/bdi>[.,:;!?]?$/.test(s)) return s;
      const m = s.match(/^\s*([\s\S]*?)([.,:;!?]?)\s*$/);
      return '<bdi>' + m[1].replace(/<\/?bdi>/g, '') + '</bdi>' + m[2];
    }
    const toks = s.match(TOKEN) || [];
    const isForm = t => t.length === 1 ? !BOUND.test(t) : !t.startsWith('<bdi>');
    let out = '', i = 0;
    while (i < toks.length) {
      if (!isForm(toks[i])) { out += toks[i++]; continue; }
      let j = i;
      while (j < toks.length && isForm(toks[j])) j++;
      out += wrapRun(toks.slice(i, j));
      i = j;
    }
    return merge(out);
  }

  function wrapRun(run) {
    let a = 0, b = run.length;
    for (let moved = true; moved && a < b;) {
      moved = false;
      const f = run[a], l = run[b - 1];
      const sign = /[−+-]/.test(f) && /^[\d(.A-Za-z<]/.test(run[a + 1] || '');   // −0.76, +3: keep the sign
      if (f.length === 1 && EDGE.test(f) && !sign) { a++; moved = true; continue; }
      const charge = /[−+]/.test(l) && /^\d$/.test(run[b - 2] || '');               // 3+, 1−: keep the charge sign
      if (l.length === 1 && EDGE.test(l) && !charge) { b--; moved = true; continue; }
      const mid = run.slice(a, b).join('');
      const bal = (o, c) => mid.split(o).length - mid.split(c).length;
      if (f === ')' || f === ']' || (f === '(' && bal('(', ')') > 0) || (f === '[' && bal('[', ']') > 0)) { a++; moved = true; continue; }
      if (l === '(' || l === '[' || (l === ')' && bal('(', ')') < 0) || (l === ']' && bal('[', ']') < 0)) { b--; moved = true; continue; }
    }
    const head = run.slice(0, a).join(''), tail = run.slice(b).join(''), text = run.slice(a, b).join('');
    if (!text || (!LETTER.test(text) && !(/\d/.test(text) && OP.test(text)))) return head + text + tail;
    return head + '<bdi>' + text + '</bdi>' + tail;
  }

  const JOIN = /<bdi>((?:[^<]|<(?!\/?bdi>))*)<\/bdi>([^<]*?)<bdi>((?:[^<]|<(?!\/?bdi>))*)<\/bdi>/g;
  const joinable = sep => SEP.test(sep) && (!/[\d()]/.test(sep) || (OP.test(sep) && sep.split('(').length === sep.split(')').length));
  function merge(s) {
    for (let changed = true; changed;) {
      changed = false;
      JOIN.lastIndex = 0;
      for (let m; (m = JOIN.exec(s));) {
        const a = '<bdi>' + m[1] + '</bdi>', b = '<bdi>' + m[3] + '</bdi>';
        if (TERM.test(a) || TERM.test(b) || !joinable(m[2])) { JOIN.lastIndex = m.index + a.length; continue; }
        s = s.slice(0, m.index) + '<bdi>' + m[1] + m[2] + m[3] + '</bdi>' + s.slice(m.index + m[0].length);
        changed = true;
        break;
      }
    }
    return s;
  }

  root.heWrap = heWrap;
  if (typeof module !== 'undefined' && module.exports) module.exports = { heWrap };
})(typeof window !== 'undefined' ? window : globalThis);
