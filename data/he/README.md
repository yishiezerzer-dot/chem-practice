# Hebrew content (overlay)

English in `data/*.json` is the source of truth and is never edited for Hebrew. Hebrew sits next to it here and is laid over the English by id. Anything missing in Hebrew falls back to English (shown left-to-right with an "English only" tag).

## Files
- `index.json`: `topics` lists every topic id that has a Hebrew file. The site only loads ids listed here.
- `topics/<topic id>.json`: one file per topic, named with the exact topic id from `data/topics.json`.

## Topic file shape
```json
{
  "topic_id": "<topic id>",
  "name": "<Hebrew topic name>",
  "reading": { "sections": [ { "id": "<English section id>", "heading": "...", "paragraphs": ["..."], "why": "...",
                               "worked": { "title": "...", "steps": ["..."] }, "workedExamples": [ ... ],
                               "mistake": { "wrong": "...", "whyWrong": "...", "correct": "..." },
                               "check": { "title": "...", "intro": "...", "items": [ { "q": "...", "a": "..." } ] } } ] },
  "questions": { "<card id>": { "q": "...", "given": ["..."], "answer": "...", "steps": ["..."], "explanation": "..." } }
}
```
- Sections match English by `id`; cards match by card id. Arrays (paragraphs, steps, given, check items, workedExamples) match by position, so keep the same count and order as the English.
- Only text fields are read. `id`, `reviewed`, `ref`, `type`, `topic` and figure `src` always come from the English. Figure alt text and drawing labels stay English for now.

## Writing rules
- Term rule: the Hebrew term with the English in brackets the first time it appears in each reading and in each card, e.g. צפיפות <bdi>(density)</bdi>. Wrap the English term with its brackets in `<bdi>…</bdi>` (headings, body, cards, check items) so the brackets do not flip in right-to-left text. Plain Hebrew after that.
- Formulas, equations, units and numbers with units go inside `<bdi>…</bdi>` so they read left to right, e.g. `<bdi>1 kg = 1000 g</bdi>`. Use `<sub>`/`<sup>` inside it (`<bdi>10<sup>3</sup></bdi>`). Plain counting numbers in a sentence (3 ספרות) need no wrapper.
- A card line with no Hebrew letters at all (a pure formula such as `d = 19.7 g / 25.0 mL = 0.788 g/mL`) is isolated left-to-right automatically; no `<bdi>` needed.
- Do not use straight double quotes inside strings; use “ ” for quotes and ״ (gershayim) for Hebrew abbreviations.
- Book references stay "Atkins 8e" in English (they come from the English data).
- Use plural address (נסו, כתבו) for a first-year HUJI student.

## Adding the next topics (H2 batches)
1. Create `topics/<topic id>.json` for each topic in the batch (copy the measurement file as the template).
2. Add each topic id to `index.json` → `topics`.
3. Copy the folder to the site: `cp -r data/he site/data/` (same rule as the other data files).
4. No code changes are needed.
