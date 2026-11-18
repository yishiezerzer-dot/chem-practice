# Organic Chemistry 1 data (course 69128)

Data for the second course, Organic Chemistry 1 (Solomons 11e). The layout mirrors data/:
topics.json, questions.json, readings.json and he/ (index.json, glossary.json).

- Id rule: every Organic topic id and card id starts with `o-` (cards are `o-<tutorial>-q<n>`).
  Never reuse a General Chemistry id.
- `tutorial` is the tutorial number shown in the list (strings such as "2–3" or "10a").
- `solomons_chapter` is the main Solomons 11e chapter. It is a chapter-level guess to check
  against the book; edit it in place.
- Every file here must be copied byte-for-byte to site/data/organic1/.
- Pictures (O3): every picture entry is { source, file, smiles, alt, width, height }, in questions.json,
  readings.json (sections[].picture) and pictures.json (the sample set). source "auto": `py tools/make-pictures.py`
  draws img/<file> from the SMILES (RDKit) and writes width/height; source "sketch": a Chem Sketcher SVG in img/,
  which the tool never redraws (it only reads its size). Run the tool after any picture change; `--check` reports
  anything out of date. Review log: art/organic1/REVIEW.md; all sample pictures: site/pictures.html.
