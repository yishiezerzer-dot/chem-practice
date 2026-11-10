// Parses docs/H3-humanizer-fixes.md (section 2 + Appendix A) and applies or verifies it.
// usage: node tools/h3-fixes.js apply|verify
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const md = fs.readFileSync(path.join(root, 'docs/H3-humanizer-fixes.md'), 'utf8').split(/\r?\n/);
const topicDir = path.join(root, 'data/he/topics');

function parse() {
  const fixes = []; let topic = null, section = 0;
  for (const line of md) {
    if (/^## 2\./.test(line)) section = 2;
    else if (/^## 3\./.test(line)) section = 3;
    else if (/^## Appendix A/.test(line)) section = 'A';
    const h = line.match(/^### (\S+) \(/);
    if (section === 2 && h) topic = h[1];
    const m = line.match(/^(\d+)\. `([^`]+)`: “(.*?)” → “(.*?)”\.(?: |$)/);
    if (section === 2 && m) fixes.push({ topic, n: +m[1], p: m[2], cur: m[3], sug: m[4] });
  }
  const appendix = []; section = 0; topic = null;
  for (const line of md) {
    if (/^## Appendix A/.test(line)) section = 'A';
    const h = line.match(/^\*\*(\S+)\*\*$/);
    if (section === 'A' && h) topic = h[1];
    const m = line.match(/^- `([^`]+)` \((\d+)\)/);
    if (section === 'A' && m) appendix.push({ topic, p: m[1], count: +m[2] });
  }
  return { fixes, appendix };
}

// resolve "reading.sections[id=x].paragraphs[3]" -> {obj, key}
function resolve(doc, p) {
  const parts = p.match(/[^.\[\]]+|\[[^\]]*\]/g);
  let cur = doc, parent = null, key = null;
  for (const part of parts) {
    parent = cur;
    if (part.startsWith('[id=')) { const id = part.slice(4, -1); key = cur.findIndex(s => s.id === id); if (key < 0) throw new Error('no id ' + id); cur = cur[key]; }
    else if (part.startsWith('[')) { key = +part.slice(1, -1); cur = cur[key]; }
    else { key = part; cur = cur[key]; }
    if (cur === undefined) throw new Error('missing ' + part + ' in ' + p);
  }
  return { parent, key };
}
const load = t => JSON.parse(fs.readFileSync(path.join(topicDir, t + '.json'), 'utf8'));
const save = (t, d) => fs.writeFileSync(path.join(topicDir, t + '.json'), JSON.stringify(d, null, 2) + '\n');

module.exports = { parse, resolve, load };
if (require.main === module) {
  const mode = process.argv[2], { fixes, appendix } = parse();
  console.log('parsed fixes:', fixes.length, ' appendix locations:', appendix.length, ' appendix occurrences:', appendix.reduce((a, b) => a + b.count, 0));
  const docs = {}; let applied = 0, misses = [];
  for (const f of fixes) {
    const d = docs[f.topic] || (docs[f.topic] = load(f.topic));
    try {
      const { parent, key } = resolve(d, f.p); const s = parent[key];
      if (mode === 'apply') {
        const idx = s.indexOf(f.cur);
        if (idx < 0) { if (s.includes(f.sug)) { applied++; continue; } misses.push(`${f.topic} #${f.n} ${f.p}: current not found`); continue; }
        parent[key] = s.slice(0, idx) + f.sug + s.slice(idx + f.cur.length); applied++;
      } else {
        if (s.split(f.sug).join('').includes(f.cur)) misses.push(`${f.topic} #${f.n} ${f.p}: current still present`);
        else if (!s.includes(f.sug)) misses.push(`${f.topic} #${f.n} ${f.p}: suggested missing`);
        else applied++;
      }
    } catch (e) { misses.push(`${f.topic} #${f.n}: ${e.message}`); }
  }
  if (mode === 'apply') for (const t in docs) save(t, docs[t]);
  else {
    let left = 0; const re = /(?<![א-ת])[ובכלמשה]{0,3}בעי(?:ה|ות|ית)(?![א-ת])/g;
    for (const f of fs.readdirSync(topicDir)) left += (fs.readFileSync(path.join(topicDir, f), 'utf8').match(re) || []).length;
    console.log('remaining בעיה/בעיות/בעיית (Appendix A swaps, 49 expected done):', left); if (left) misses.push(left + ' בעיה left');
  }
  console.log(mode, 'ok:', applied, 'of', fixes.length); misses.forEach(x => console.log('MISS', x));
}
