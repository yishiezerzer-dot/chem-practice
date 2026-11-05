# Chem Practice (v1, English)
Flashcard study site for HUJI 69107 Intro to Chemistry (Atkins 8e).

- `site/` is the website (plain HTML/CSS/JS, no build step). Open it through a local server: `cd site && python3 -m http.server 18432 --bind 127.0.0.1`, then visit http://127.0.0.1:18432
- `data/topics.json` lists the 23 topics. Each topic has an `id` (questions point to it) and an `order` (change only this to reorder). Home sorts by `order`.
- `data/readings.json` holds a detailed reading for each topic (keyed by topic id). Every reading is marked `reviewed: false` until Yishi checks it. Structure drawings use `figure: {status:'pending-sketch'}` slots for Chem Sketcher.
- `data/questions.json` holds the questions. `reviewed: false` means Yishi hasn't checked it yet. An optional `image` field on a question embeds a sketch in the revealed answer. Copy data files into `site/data/` after editing.
- Flow: pick a topic → read the section → Start practice (or Skip to cards). From the card list you can reopen the reading.
- Progress is stored in the browser (localStorage key `chemPractice.v1`), with export/import on the home screen.
- `shots/` has the test screenshots. Tests live in `/workspace/pwtest/` (`chem-m4.mjs`, `chem-m5.mjs`, `chem-reading.mjs`).
- `backups/` keeps copies from before big changes.
- Dev site: https://yishiezerzer-dot.github.io/chem-practice/dev/ (production root stays "Coming soon" until Yishi says go).
