# Chem Practice (v1, English)
Flashcard study site for HUJI 69107 Intro to Chemistry (Atkins 8e).

- `site/` is the website (plain HTML/CSS/JS, no build step). Open it through a local server: `cd site && python3 -m http.server 18432 --bind 127.0.0.1`, then visit http://127.0.0.1:18432
- `data/topics.json` lists the 23 topics. Each topic has an `id` (questions point to it) and an `order` (change only this to reorder). Home sorts by `order`.
- `data/readings.json` holds a detailed reading for each topic (keyed by topic id). Every reading is marked `reviewed: false` until Yishi checks it. Structure drawings use `figure: {status:'pending-sketch'}` slots for Chem Sketcher.
- `data/questions.json` holds the questions. `reviewed: false` means Yishi hasn't checked it yet. An optional `image` field on a question embeds a sketch in the revealed answer. Copy data files into `site/data/` after editing.
- Hebrew (default, right-to-left; toggle עב / EN in the top bar, saved in localStorage key `chemPractice.lang`; progress is shared by both languages). UI strings live in `site/i18n/he.js` and `site/i18n/en.js`. Hebrew content is an overlay in `data/he/` (copy to `site/data/he/`); see `data/he/README.md` for adding topics. Anything not yet translated falls back to English.
- Flow: pick a topic → read the section → Start practice (or Skip to cards). From the card list you can reopen the reading.
- Progress is stored in the browser (localStorage key `chemPractice.v1`), with export/import on the home screen.
- `shots/` has the test screenshots. Tests live in `/workspace/pwtest/` (`chem-m4.mjs`, `chem-m5.mjs`, `chem-reading.mjs`).
- `backups/` keeps copies from before big changes.
- Dev site: https://yishiezerzer-dot.github.io/chem-practice/dev/ (production root stays "Coming soon" until Yishi says go).

## Organic 1 pictures

Automatic Organic 1 molecule pictures are built with RDKit 2026.03.5 by `tools/make-pictures.py`, from the SMILES in data/organic1/questions.json, readings.json and pictures.json.
It writes the SVGs into data/organic1/img/, writes each picture's width and height, and copies the JSON and pictures to site/data/organic1/. The same RDKit version gives byte-identical files.
Setup: RDKit is the pip package `rdkit`, pinned with `py -m pip install rdkit==2026.03.5`.
Run these from the repo root:
- Regenerate: `py tools/make-pictures.py`
- Check only: `py tools/make-pictures.py --check` (changes nothing; exits 1 if a picture or a size is out of date; a Chem Sketcher sketch that is not drawn yet is listed as PENDING, not as a problem).

The local sample viewer is `tools/pictures.html` (not part of the published site): from the repo root run `py -m http.server 8130 --bind 127.0.0.1`, then open http://127.0.0.1:8130/tools/pictures.html (add `?lang=he` for Hebrew).
