# Chem Practice (v1, English)
Flashcard study site for HUJI 69107 Intro to Chemistry (Atkins 8e).

- `site/` is the website (plain HTML/CSS/JS, no build step). Open it through a local server: `cd site && python3 -m http.server 18432 --bind 127.0.0.1`, then visit http://127.0.0.1:18432
- `data/topics.json` lists the 23 topics. Each topic has an `id` (questions point to it) and an `order` (change only this to reorder).
- `data/questions.json` holds the questions. `reviewed: false` means Yishi hasn't checked it yet. Copy both files into `site/data/` after editing.
- Progress is stored in the browser (localStorage key `chemPractice.v1`), with export/import on the home screen.
- `shots/` has the test screenshots; the test script is `/workspace/pwtest/chem-m4.mjs`.
- `backups/` keeps copies from before big changes.
