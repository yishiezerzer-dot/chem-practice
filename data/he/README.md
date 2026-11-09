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
- Term rule: the Hebrew term with the English in brackets the first time it appears in each reading and in each card, e.g. צפיפות <bdi>(density)</bdi>, in dictionary form (singular, lowercase; proper unit names keep the capital: <bdi>(Kelvin)</bdi>). Never repeat the bracket for the same term in the same reading or card. Wrap the English term with its brackets in `<bdi>…</bdi>` (headings, body, cards, check items) so the brackets do not flip in right-to-left text. Plain Hebrew after that.
- Formulas, equations, units and numbers with units go inside `<bdi>…</bdi>` so they read left to right, e.g. `<bdi>1 kg = 1000 g</bdi>`. Use `<sub>`/`<sup>` inside it (`<bdi>10<sup>3</sup></bdi>`). Plain counting numbers in a sentence (3 ספרות) need no wrapper.
- One formula = one `<bdi>`: never split it into several isolates joined by `=`, `−` or spaces (they would show in reverse order). Sentence punctuation goes after `</bdi>`. Use a plain `<` / `>` for comparisons, not `&lt;`. `tools/check-he.js` flags any Latin, Greek or formula run left outside a `<bdi>` (H2b), and the site wraps leftovers on its own as a safety net (`site/bidi.js`).
- A card line with no Hebrew letters at all (a pure formula such as `d = 19.7 g / 25.0 mL = 0.788 g/mL`) is isolated left-to-right automatically; no `<bdi>` needed.
- Do not use straight double quotes inside strings; use “ ” for quotes and ״ (gershayim) for Hebrew abbreviations.
- Book references stay "Atkins 8e" in English (they come from the English data).
- Use plural address (נסו, כתבו) for a first-year HUJI student.
- Full style rules: see PLAN.md, "Hebrew style rules" (no calques, no semicolons, brackets only on first use, no Hebrew inside formulas, אפסים בסוף המספר, etc.). Shared terms live in `glossary.json`: one Hebrew term per concept; add every new bracketed term there.

## Adding the next topics (H2 batches)
1. Create `topics/<topic id>.json` for each topic in the batch (copy the measurement file as the template).
2. Add each topic id to `index.json` → `topics`.
3. Add new terms to `glossary.json` (array of `{"he","en"}`, sorted by en).
4. Copy the folder to the site: `cp -r data/he site/data/` (same rule as the other data files).
5. Run `node tools/check-he.js <topic ids>` and get all PASS. `node tools/check-he.js --self-test` checks the checker itself against the broken fixture in `tools/fixtures/he-broken.json`.
6. No code changes are needed.

## H2 batch plan
The 22 remaining topics in syllabus order (English name from `data/topics.json`).

**Batch 1**
- `atoms-elements-and-the-mole`: Atoms, elements and the mole
- `chemical-compounds-formulas-and-oxidatio`: Chemical compounds, formulas and oxidation states
- `chemical-equations-and-stoichiometry`: Chemical equations and stoichiometry
- `types-of-reactions-in-aqueous-solution`: Types of reactions in aqueous solution
- `balancing-redox-equations-and-titrations`: Balancing redox equations and titrations
- `gases-gas-laws-and-the-ideal-gas-equatio`: Gases: gas laws and the ideal gas equation

**Batch 2**
- `kinetic-molecular-theory-and-real-gases`: Kinetic-molecular theory and real gases
- `thermochemistry-and-the-first-law`: Thermochemistry and the first law
- `electrons-in-atoms-quantum-theory-and-or`: Electrons in atoms: quantum theory and orbitals
- `electron-configurations-and-the-periodic`: Electron configurations and the periodic table
- `periodic-trends-in-atomic-properties`: Periodic trends in atomic properties
- `chemical-bonding-i-lewis-structures-and-`: Chemical bonding I: Lewis structures and molecular shape

**Batch 3**
- `chemical-bonding-ii-hybridization-and-mo`: Chemical bonding II: hybridization and molecular orbitals
- `light-matter-interaction-and-spectroscop`: Light-matter interaction and spectroscopy basics
- `intermolecular-forces-and-phases`: Intermolecular forces and phases
- `entropy-gibbs-energy-and-spontaneity`: Entropy, Gibbs energy and spontaneity
- `principles-of-chemical-equilibrium`: Principles of chemical equilibrium

**Batch 4**
- `acids-and-bases`: Acids and bases
- `buffers-indicators-and-titration-curves`: Buffers, indicators and titration curves
- `solubility-precipitation-and-complex-ion`: Solubility, precipitation and complex ions
- `electrochemistry`: Electrochemistry
- `chemical-kinetics`: Chemical kinetics
