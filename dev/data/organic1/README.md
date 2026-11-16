# Organic Chemistry 1 data (course 69128)

Data for the second course, Organic Chemistry 1 (Solomons 11e). The layout mirrors data/:
topics.json, questions.json, readings.json and he/ (index.json, glossary.json).

- Id rule: every Organic topic id and card id starts with `o-` (cards are `o-<tutorial>-q<n>`).
  Never reuse a General Chemistry id.
- `tutorial` is the tutorial number shown in the list (strings such as "2–3" or "10a").
- `solomons_chapter` is the main Solomons 11e chapter. It is a chapter-level guess to check
  against the book; edit it in place.
- Every file here must be copied byte-for-byte to site/data/organic1/.
