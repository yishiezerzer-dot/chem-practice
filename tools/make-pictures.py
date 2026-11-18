#!/usr/bin/env python
"""Organic 1 molecule pictures (O3).

Every picture entry in data/organic1/questions.json, readings.json and pictures.json is an object
  { "source": "auto" | "sketch", "file": "<name>.svg", "smiles": "...", "alt": "...", "width": W, "height": H }
- source "auto": this tool draws data/organic1/img/<file> from the SMILES with RDKit (bond-line drawing,
  black on transparent, labels in English, text drawn as outlines so every phone shows the same picture).
- source "sketch": a Chem Sketcher SVG file in data/organic1/img/. This tool never changes it; it only reads its size.
For both, the tool writes width and height (the picture's pixel size) into the entry, so the page can reserve the
space before the picture loads, and copies the pictures and the JSON files byte for byte to site/data/organic1/.

Usage:  py tools/make-pictures.py          build pictures, update width/height, copy to site/data
        py tools/make-pictures.py --check  change nothing; exit 1 if a picture or a size is out of date
Needs RDKit (pip package rdkit). Same RDKit version gives the same files.
"""
import json, math, os, re, shutil, sys
from rdkit import Chem
from rdkit.Chem import rdDepictor
from rdkit.Chem.Draw import rdMolDraw2D

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
DIR = 'data/organic1'
JSON_FILES = ['questions.json', 'readings.json', 'pictures.json']
BOND = 34          # pixels per bond: the same scale in every automatic picture
PAD = 22           # room around the atoms for labels, charges and wedge ends
MIN_W, MIN_H = 120, 80
MAX_W = 296        # card text width at a 360px screen: wider pictures would be scaled down

rdDepictor.SetPreferCoordGen(True)


def draw(smiles):
    m = Chem.MolFromSmiles(smiles)
    if m is None:
        raise ValueError('RDKit cannot read the SMILES ' + smiles)
    m = rdMolDraw2D.PrepareMolForDrawing(m)  # 2D coordinates, wedges and dashes from the stereo in the SMILES
    c = m.GetConformer()
    pts = [c.GetAtomPosition(i) for i in range(m.GetNumAtoms())]
    lens = [(c.GetAtomPosition(b.GetBeginAtomIdx()) - c.GetAtomPosition(b.GetEndAtomIdx())).Length() for b in m.GetBonds()]
    unit = sum(lens) / len(lens) if lens else 1.0
    xs, ys = [p.x for p in pts], [p.y for p in pts]
    w = max(MIN_W, math.ceil((max(xs) - min(xs)) / unit * BOND + 2 * PAD))
    h = max(MIN_H, math.ceil((max(ys) - min(ys)) / unit * BOND + 2 * PAD))
    d = rdMolDraw2D.MolDraw2DSVG(w, h)
    o = d.drawOptions()
    o.fixedBondLength = BOND
    o.useBWAtomPalette()
    o.clearBackground = False
    o.bondLineWidth = 2
    o.scaleBondWidth = False
    o.padding = 0
    o.minFontSize = 15
    o.maxFontSize = 18
    o.addStereoAnnotation = False  # no R/S or E/Z labels: the picture must not give the answer away
    d.DrawMolecule(m)
    d.FinishDrawing()
    svg = d.GetDrawingText()
    return svg, w, h


def svg_size(text):
    root = re.search(r'<svg\b[^>]*>', text, re.S).group(0)
    wm, hm = re.search(r'\bwidth=[\'"]([\d.]+)(px)?[\'"]', root), re.search(r'\bheight=[\'"]([\d.]+)(px)?[\'"]', root)
    if wm and hm:
        return round(float(wm.group(1))), round(float(hm.group(1)))
    vb = re.search(r'\bviewBox=[\'"][\d.\-]+[ ,]+[\d.\-]+[ ,]+([\d.]+)[ ,]+([\d.]+)[\'"]', root)
    if vb:
        return round(float(vb.group(1))), round(float(vb.group(2)))
    raise ValueError('no width/height or viewBox')


def pictures(node, out):
    """Every dict that has a "source" and a "file" key, anywhere in the JSON."""
    if isinstance(node, dict):
        if 'source' in node and 'file' in node:
            out.append(node)
        for v in node.values():
            pictures(v, out)
    elif isinstance(node, list):
        for v in node:
            pictures(v, out)
    return out


def set_size(text, file, w, h):
    """Write width/height into the JSON object that holds "file": "<file>", keeping the file's own layout."""
    key = '"file": ' + json.dumps(file, ensure_ascii=False)
    pos, n = 0, 0
    while True:
        i = text.find(key, pos)
        if i < 0:
            break
        n += 1
        # the enclosing object: walk back to its "{" and forward to its "}" (no nested objects inside a picture)
        a, b = text.rfind('{', 0, i), text.find('}', i)
        obj = text[a:b + 1]
        new = obj
        for k, v in (('width', w), ('height', h)):
            if re.search(r'"%s":\s*-?[\d.]+' % k, new):
                new = re.sub(r'("%s":\s*)-?[\d.]+' % k, lambda m: m.group(1) + str(v), new)
            else:
                body = new[:-1].rstrip()
                new = body + ', "%s": %d' % (k, v) + new[len(body):]
        text = text[:a] + new + text[b + 1:]
        pos = a + len(new)
    if not n:
        raise ValueError('cannot find ' + key)
    return text


def main():
    check = '--check' in sys.argv
    problems, wrote = [], []
    img = os.path.join(ROOT, DIR, 'img')
    for name in JSON_FILES:
        src = os.path.join(ROOT, DIR, name)
        if not os.path.exists(src):
            continue
        text = open(src, encoding='utf-8', newline='').read()
        new_text = text
        for p in pictures(json.loads(text), []):
            f = os.path.join(img, p['file'])
            if p['source'] == 'auto':
                svg, w, h = draw(p['smiles'])
                old = open(f, encoding='utf-8', newline='').read() if os.path.exists(f) else None
                if old is None or old.replace('\r\n', '\n') != svg:  # git may check files out with CRLF
                    if check:
                        problems.append('%s: %s is not the drawing of its SMILES (run the tool)' % (name, p['file']))
                    else:
                        open(f, 'w', encoding='utf-8', newline='').write(svg)
                        wrote.append(p['file'])
            elif p['source'] == 'sketch':
                if not os.path.exists(f):
                    problems.append('%s: sketch file %s is missing' % (name, p['file']))
                    continue
                w, h = svg_size(open(f, encoding='utf-8').read())
            else:
                problems.append('%s: %s has unknown source %r' % (name, p['file'], p['source']))
                continue
            if w > MAX_W:
                problems.append('%s: %s is %dpx wide, more than %dpx: it would be scaled down at 360px' % (name, p['file'], w, MAX_W))
            if p.get('width') != w or p.get('height') != h:
                if check:
                    problems.append('%s: %s should have width %d, height %d' % (name, p['file'], w, h))
                new_text = set_size(new_text, p['file'], w, h)
        if new_text != text and not check:
            open(src, 'w', encoding='utf-8', newline='').write(new_text)
            wrote.append(name)
        if not check:
            shutil.copyfile(src, os.path.join(ROOT, 'site', DIR, name))
    if not check:
        dst = os.path.join(ROOT, 'site', DIR, 'img')
        for f in os.listdir(img):
            shutil.copyfile(os.path.join(img, f), os.path.join(dst, f))
    for p in problems:
        print('PROBLEM', p)
    print(('checked' if check else 'built') + ': %d file(s) %s, %d problem(s)' % (len(wrote), 'written' if wrote else 'changed', len(problems)))
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()
