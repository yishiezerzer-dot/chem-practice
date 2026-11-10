# Chem Practice Site — PLAN (APPROVED 2026-11-05)

## Summary
A free study website where HUJI chemistry students practice exam-style questions and get a clear explanation for each answer. v1 covers HUJI General Chemistry for chemistry majors. The site grows course by course until most chemistry and medical students can use it.

## Users
- v1: HUJI chemistry majors taking General Chemistry.
- Later: Organic 1 and 2 students (chemists), then medical students doing general and organic chemistry.

## How content gets made
1. **Source library.** Collect the course syllabus and the textbook it names. Build a database of topics with notes and pointers to the right chapters and pages.
2. **Question bot.** Drafts questions, answers, and explanations from that library. Yishi checks them before they go live.
3. **Design.** A design bot (figma bro) designs the question screen, the answer reveal, and the dashboards.

## Content rule (decided)
All explanations are written by us. Each answer points students to the book's chapter and pages. No textbook screenshots or copied text.
Diagrams and structures are redrawn by us: when a question needs a Lewis structure, electron configuration diagram, VSEPR shape, or MO diagram, **Chem Sketcher** draws it and **App Maker** embeds the sketch in the answer (never a textbook screenshot).

## Reading before practice (decided 2026-11-05, tightened same day)
Every topic opens with a **reading section** that teaches that topic in detail (the whole chemistry of the section), then the practice cards. Students learn first, then drill. Reading is original wording; book pointers only.
Readings must **show** the chemistry, not only describe it: molecules and structures the student can see (Lewis, shapes, electron configs via Chem Sketcher), worked examples (for example balancing an equation step by step) before any card on that skill, and illustrations of periodic trends with a plain-words why. Same rule for answer reveals that need a structure.

**Depth bar (Yishi):** current readings are too thin. Write as if for a new student who will notice any skipped step. Spell out every step between ideas (why this rule, what to do next, what the intermediate result is). No "you already know" leaps. Prefer longer, careful explanations over short summaries. Expand all 23 topics to this bar; use one upgraded topic as the template before mass rewrite if needed.

**Long-reading UI (Critiquito):** a short list of section jump-links at the top of each reading, keep the scroll progress bar, and show every worked-example step in full (never hide steps behind a tap).


## v1 (in)
- General Chemistry (HUJI, chemistry majors) only, organized by syllabus topic.
- Practice questions where you answer, then reveal a worked explanation.
- No logins. Progress is saved in the browser (it stays on that one device).
- Free small beta.

## Not in v1 (later list)
- v2: Organic Chemistry 1 (chemists). Still no logins.
- v3: Logins and progress dashboards that work across devices.
- v4: Organic Chemistry 2 (chemists).
- v5: General and organic chemistry for medical students.
- Later: paid extras, mock exams with a timer, flashcards.

## Learning flow (decided)
- Questions are grouped by syllabus topic: a short starter block (measurement, mole, formulas, stoichiometry), then Yishi's Hebrew main-topics order (atoms/periodic → bonding early, including ionic/covalent/polar, Lewis, VSEPR, MO → equilibrium/thermochem → entropy/Gibbs → kinetics/acids/redox/precipitation → spectroscopy), never shuffled randomly across the whole course.
- Each question is a card: question, then reveal answer with explanation and book reference.
- After the reveal the student taps **Knew it / Unsure / Didn't know**. Each button shows when that card will come back.
- Unsure and Didn't know cards come back later in the same session. The session ends when every card is marked Knew it.
- Proposed return gaps (to tune): Didn't know after about 3 cards, Unsure after about 8 cards, Knew it means done for this session.

- Spaced repetition across days: cards marked Knew it come back after 1 day, then 3 days, then 1 week (saved in the browser until logins). Unsure keeps the card's current interval, and Didn't know resets it to 1 day.
- No answer input before the reveal. Instead, show a tip such as "Try answering in your head, or in your notebook for calculations, before revealing."
- Weak topics view: chapters ranked by Didn't know and Unsure taps.
- Question types: concept questions plus calculation questions with step-by-step worked solutions.

- Topic order is set by one `order` number per topic in `data/topics.json`, and questions link to a topic by its id, never by its position. Reordering subjects means changing only those numbers, with no changes to questions or code.

## Language and environments (decided)
- Each version ships in English first, and Hebrew (RTL) is added afterward as a follow-up step of that same version.
- The GitHub repo has separate dev and production environments. Changes go to dev first and move to production only after Yishi approves.

## Screens (v1)
1. Home: pick a topic from the syllabus (order from `data/topics.json`).
2. Topic page: **Reading** first (full teach-up for that section), then a list of practice cards with simple done/not done marks.
3. Question card: question plus the try-it-first tip, then a Reveal button (no answer input, as Yishi decided).
4. Answer reveal: step-by-step explanation, Chem Sketcher diagram when the structure matters, and source reference.
5. Progress and weak topics view: done per topic, plus the weakest chapters first, kept in the browser.

## Data
- Topics: name, syllabus `order`, section theme, textbook chapter reference, plus a reading markdown body (teach-up).
- Questions: topic, text, explanation, source reference, reviewed yes/no, optional sketch asset path (from Chem Sketcher).
- Student progress (with a 'saved on this device' hint and export/import): only in the browser for v1 and v2, with no personal data.

## Cost
- v1 and v2: free hosting, nothing charged to students. The main cost is the AI used to draft questions, which is small and runs only when we make new batches.
- Paid extras are planned after the betas.

## Risks
- **Copyright.** Textbook screenshots and copied text can't appear on a public site. Use the book as a reference for topics and pages, write original explanations, and redraw structures.
- **Wrong answers.** AI-drafted chemistry can be wrong, so every question needs Yishi's review before going live.
- **Syllabus changes.** The course or book may change between years, so record which year each syllabus is from.
- **Scope creep.** Five courses is a lot. Finish v1 before starting any of the next ones.

## Milestones (v1)
**M1: Source library for General Chemistry**
- Done when the syllabus topics are listed in order, with the textbook named (proof: the file).
- Done when each topic has chapter and page references (proof: the file).

**M2: First question batch**
- Done when there are 5 reviewed questions with explanations for each of 3 topics (proof: the file).
- Done when Yishi has marked each question as checked (proof: the review column).

**M3: Design**
- Done when there are mockups of the home, question, and answer reveal screens (proof: screenshot).

**M4: Working site, one topic**
- Done when a student can pick a topic, answer, and see the explanation (proof: link plus screenshot).
- Done when progress survives a page reload (proof: screenshot).

**M5: All topics and beta launch**
- Done when every syllabus topic has questions (proof: link).
- Done when the site is public and a few test students have used it (proof: link plus their feedback).

- 2026-11-05: Book refs have no page numbers (no book copy). Yishi to fill pages from his copy, or keep section-level refs.

- 2026-11-05: Yishi approved: create repo, push to \`dev\`, publish \`dev\` on GitHub Pages for review. Production stays Coming soon until he says go.

- 2026-11-05: Dev live at https://yishiezerzer-dot.github.io/chem-practice/dev/ · repo https://github.com/yishiezerzer-dot/chem-practice (`dev` / `main`). Production Coming soon until Yishi approves.

- 2026-11-05: Topic order remapped to Yishi's Hebrew main-topics list (bonding early; quantitative last). Added reading-before-practice and Chem Sketcher → App Maker embed rule.

- 2026-11-05: Starter block before atoms (Yishi). Readings must show molecules, worked methods, and trend illustrations before cards.

- 2026-11-05: Yishi: readings too minimal — expand with no skipped steps; teach for new students.


- 2026-11-05: Critiquito: Check-yourself answers behind Show answer (OK to hide; not explanation steps). Top-bar Sections jump. Fix before expanding other 21.

- 2026-11-05: All 23 topics now have deep readings on `dev` (dev 7f3feda, gh-pages 27a7df4). Still labeled Draft until Yishi chemistry review. Critiquito checking titration S-curve fix. Chem Sketcher slots and page numbers still open. Production stays Coming soon until he says go.

- 2026-11-05: Reading design + copy signed off (Critiquito shot 41; Copy Humanizer clear). All 23 deep readings on `dev` stay Draft until Yishi chemistry review. Open: Chem Sketcher slots, page numbers, production go.

## Claude Code rounds (decided 2026-11-08)
Setup: Claude Code builds only, on branch `claude/<milestone>` in https://github.com/yishiezerzer-dot/chem-practice. App Maker merges into `dev` and publishes. The App & Web Lab tests (Critiquito, Copy Humanizer, figma bro), App Planner updates this plan, and Claude Code Relay passes instructions. Claude Code does no testing, publishing, or merging, and never touches `main`. Each round ends with a short "done, what changed, files touched" note.

**C1: Chem Sketcher slots wired in** (model: Opus 5.5, Yishi's pick for the first round)
- Done when every pending-sketch slot in `data/readings.json` and `data/questions.json` points to an `art/<id>.svg` path, with a visible placeholder if the file is missing (proof: dev link + screenshot).
- Done when nothing on the page shows the raw slot text (proof: screenshot).

**C2: Yishi review fixes** (model: lighter, since these are small data edits)
- Done when every issue Yishi reports with Report a problem is fixed in the data files and marked in a `REVIEW_LOG.md` (proof: the log).
- Done when reviewed items have `reviewed: true` and lose the Draft label (proof: screenshot).

**C2b: Fix-note button on every card and reading** (model: lighter; approved by Yishi 2026-11-09; Chem Sketcher drawings come right after)
Why: Yishi reviews on weekends and wants every problem he spots saved in one place so nothing is forgotten.
- Done when every flashcard and every reading section has a "Report a problem" button that opens a new GitHub issue prefilled with the topic, card or section id, and a box for what's wrong (proof: screenshot of a card and a reading with the button).
- Done when a test report shows up in the repo's Issues list with the right id in it (proof: issue link).
- Done when C2 rounds read open issues instead of REVIEW_LOG.md, and each fix closes its issue (proof: one closed issue).

**C3: Production release prep** (model: lighter, since it's mostly a careful copy to `main`)
- Done when `main` has a release build of the reviewed content, with nothing labeled Draft (proof: diff summary).
- Done when production goes live only after Yishi says go (proof: his message + link).

## Hebrew rounds (APPROVED by Yishi 2026-11-09)
Decisions (Yishi, 2026-11-09): the site opens in Hebrew by default with a toggle to English that remembers the choice. Chemistry terms are written in Hebrew with the English in brackets the first time, for example אנתלפיה (enthalpy). Copy Humanizer polishes the Hebrew, then Yishi skims it on weekends with the report button.
Rules: the English content stays the source of truth and isn't changed. Hebrew lives in its own files next to it, for example `data/he/`. Formulas, equations, units and numbers stay left-to-right inside the Hebrew text. Book references stay as Atkins 8e (English). Labels inside the drawings stay English for now (later list).

**H1: Hebrew site frame and one sample topic** (model: heavy, Opus 5.5, new feature)
- Done when the site opens in Hebrew, right-to-left, and the toggle switches to English and back, with the choice remembered after a reload (proof: dev link + 2 screenshots).
- Done when all buttons, menus and labels are in Hebrew, and the first topic (reading and cards) is fully translated using the term rule (proof: screenshot).
- Done when formulas and numbers display correctly inside the Hebrew text, and the report button still works and says which language it came from (proof: screenshot).

**H2: Translate the other 22 topics** (model: lighter, Sonnet, in about 4 batches of 5 to 6 topics, following H1's sample)
- Done when every topic's reading and cards are in Hebrew with nothing left in English by mistake (proof: test count of untranslated fields = 0).
- Done when a topic in Hebrew has the same number of sections and cards as in English (proof: test).

**H3: Hebrew polish** (Copy Humanizer, then the Lab)
- Done when Copy Humanizer has gone over every reading and card, and Claude has applied the fixes (proof: Copy Humanizer's sign-off).
- Done when Critiquito has checked the right-to-left layout on a phone (proof: screenshots).
- Then Yishi skims it on weekends with the report button.

Model rule: every Claude prompt names its model at the top. Heavy model for new features or big rewrites, a lighter one for data edits, copy fixes, and routine steps. Yishi has the final say.

- 2026-11-09: Yishi checked most of the chemistry: the calculation methods are right; exact numbers don't matter for now. He'll keep reviewing on weekends through the in-app button (C2b proposed).

- 2026-11-09: Yishi approves every Chem Sketcher drawing from a preview image before it goes to Claude or the repo.

- 2026-11-09: Yishi approved all 15 Chem Sketcher drawings. Seven were redrawn under the same names (orbital-shapes-1s-2p-3d, fe56-fe3-nucleus, orbital-boxes-c-n, orbital-boxes-cr-fe3, unpaired-ca-zn2-fe2, vsepr-sf4-seesaw, lewis-h2o-co2-sf4); old versions are in art/_prev/. After C2b merges: App Maker pushes the 7 new SVGs to a branch, and Claude swaps them in (round C2c).
- 2026-11-09: C2b is live on dev (5c64b79). Weekend review notes now come in as GitHub issues labeled review. C2c was sent to Claude: the 7 redrawn SVGs and wrapping for card step text that was cut off on phones.
- 2026-11-09: C2c is live on dev (104a2ed). All 15 drawings are approved and live. Claude stays idle until Yishi sends weekend review issues.

## Hebrew style rules
(Copy Humanizer review of H1 sample, 2026-11-09; rule 10 Yishi, 2026-11-09)
Applies to H2 and every later Hebrew topic. The shared glossary is `data/he/glossary.json` and the checker is `tools/check-he.js` (run it per batch; all topics must PASS).

1. Write it the way a Hebrew lecturer would say it, with no English calques. Use סולם or קנה מידה, not סקאלה. Use מחשבים or מבודדים, not פותרים את. Use לפני עיגול, not גולמי. Use אפשר לסדר את הנוסחה גם כך, not סידורים מחדש.
2. Use ספרת העשיריות and ספרת המאיות, not מקום ה... Use בהגדרה, not לפי הגדרה.
3. Steps lists use one voice, imperative plural (כתבו, הציבו, חשבו). The impersonal form is fine in paragraphs.
4. No semicolons in Hebrew prose, except between two bdi formulas.
5. English goes in brackets only on the first use of a term in each reading and each card. Never add a second bracket for the same term. Write the English in dictionary form, singular and lowercase, e.g. (mole). Proper unit names keep their capital, e.g. (Kelvin).
6. One Hebrew term per concept everywhere. Keep the shared glossary at `data/he/glossary.json` and grow it with each batch.
7. No Hebrew inside formulas. Use chemical formulas instead, e.g. m(H<sub>2</sub>O), not m(מים).
8. Always use <sup> and <sub>, never raw ³ or ₂ characters.
9. Quoted UI labels must match the Hebrew UI strings exactly. Use לחצו, not הקישו.
10. Trailing zeros = אפסים בסוף המספר everywhere (Yishi, 2026-11-09). Do not use נגררים.
(Added in H3 from Copy Humanizer's review, docs/H3-humanizer-fixes.md section 1; rules 11-26.)
11. "problem" = שאלה or תרגיל, never בעיה (בעיה means a trouble). Construct form: שאלת.
12. "net" = כולל, or drop it. נטו only inside the fixed term משוואה יונית נטו. Not דיפול נקי or מטען נקי.
13. No bookkeeping or "clean/messy" calques. Use ספירה or חישוב, ברור, לא נוח. Not חשבונאי, נקי, מבולגן, להתנקות.
14. "Solve for x" = מצאו, חשבו or בודדו את x, not פתרו עבור.
15. No drama verbs for approximations, buffers or trends: לא תקף or לא עובד (not נכשל), קיבולת החציצה נגמרת (not נשברת), יורדת מאוד (not קורסת), גובר על (not מנצח), תקפה (not משתלטת), ישנה צבע (not יתהפך).
16. "Silent error" = טעות שקשה לזהות or שקל לפספס, not טעות שקטה.
17. Other calques to avoid: מתכון (use הרכב or סדר עבודה), סיפור (תהליך or חישוב), ארגז כלים (עובדים כך), הישארו עם (השתמשו ב), חווה (יש לו or פועלים עליו), לוקח יותר זמן (צריך יותר זמן), צנוע (קטן), עדיין חל (גם כאן צריך), פוטונים עדינים or חזקים (בעלי אנרגיה נמוכה or גבוהה), בדיקת כיתה (הדגמה בכיתה).
18. An inanimate subject does not "use" or "do" something. Use an impersonal verb: בתערובות אמיתיות משתמשים ב־, not תערובות משתמשות ב־.
19. Voice in mistake.wrong: present impersonal plural (מחשבים, שוכחים, משתמשים ב־…). Not a noun phrase (שימוש ב…) and not an infinitive (לספור…).
20. One Hebrew word per concept (non-glossary): פאזה (not מופע); היתוך (not התכה or נמס); ממריא (not מתאדה or מומריא); מיהול, מהול (not מדולל or מדלל; דליל for a low-pressure gas); הכלאה (not היברידיזציה); היבריד תהודה; לא ממוקם (not מפולג); הסטה (not הסחה); שוקע, intransitive (not משקיע); always הבסיס הצמוד or החומצה הצמודה, never a bare הצמוד; טטראהדר־ and אוקטהדר־.
21. המסת X (dissolving X), not המסה של X (which reads as "the mass of X").
22. נושא for a topic, never פרק. פרק is only the UI section label (פרק N).
23. English in brackets goes right after the term, before any adjective: קבוע היווצרות (formation constant) גדול. Headings and topic names do not count as first use.
24. Spelling: לעיתים (not לעתים), ודאו (not וודאו), שריפה, פלנק, סטודנטים (not תלמידים), and gender agreement (שתי אונות, היא תרכובת).
25. Step label = "תשובה סופית:" everywhere (not "התשובה הסופית:"). Applied in H3.
26. Quotation marks are “…” throughout, never ״…״ (gershayim). Applied in H3.
Decisions from Yishi, 2026-11-09 (H3): standard = סטנדרטי everywhere (תנאי תקן stays only for STP); בליעה is used for both absorption and absorbance, with the English in brackets only on first use.
H2 batch 2 (claude/h2-batch2 3623b95, includes batch 1): 13/13 topics pass check-he, Focus = פרק N. More English issues for the weekend review: t10-q1 4.087e-19 J vs 4.086 in the reading; R_H 1.097e7 vs 1.0974e7; t11-q2 "six unpaired in 3d5" (check the card: if it's Cr, 3d5 4s1, all six really are unpaired, so the translator's note may be wrong); O=O 498 vs 496 (t13-q2); a typo in real gases, "attractions particles stick together more".
H2 batch 3 (claude/h2-batch3 ac95d79, from dev 8590ea8): 18/18 topics pass. English issues for the weekend review: the equilibrium ICE paragraph 3 has a placeholder, "x ≈ √(K × something)" (a visible bug, fix it in the first English fix round); in P<sub>CO</sub>₂ the 2 sits outside the sub tag; Clausius-Clapeyron uses 373/363 K vs 373.15/353.15 K in t16-q3; loose phrasing on inert gas at constant volume, "K = 1 balanced mix" and dipole vs dispersion; the spectroscopy reading refers to an unnamed schematic.
H2 batch 4 (claude/h2-batch4 5a07451, includes batch 3): all 23 topics in Hebrew, check-he 23/23 PASS, 338 glossary terms. Planner decision: the buffers topic keeps the glossary-matching name תמיסות חוצצות, מחוונים ועקומות טיטרציה. English issues for the weekend review: the AgBr example uses Ksp 1.7e-8, but the real value is about 5e-13 (a real error, top of the English fix list); acetic acid pKa 4.74 vs 4.75 (t20-q1, t20-q2); PbCl2 Ksp 1.7e-5 vs 1.6e-5 (t21-q3); H2SO4 polyprotic/strong and HSO4- called amphoteric; Nernst 0.0592 vs 0.05916; t23-q3 missing parentheses; loose wording in electrolysis and the salt bridge.
Next: App Maker merges and tests batches 3+4, then H3 (Copy Humanizer polish pass, Critiquito RTL phone check, Yishi skims on the weekend).
H2 merged into dev (d3019f8, gh-pages 9c6bddb). Bug found by App Maker: in Hebrew prose, formulas that aren't in a <bdi> get scrambled or split across lines (electrochemistry cell notation, E° equations; shot 64).
### H2b fix round (planner, 2026-11-09), Opus 5.5 (bidi logic)
- Wrap every formula, equation and cell notation in Hebrew prose in a nowrap LTR <bdi>. Prefer doing it in the data, with a safety net in fmtRich that wraps runs of Latin, math or formula characters on its own. Punctuation at the end of a sentence stays outside the bdi.
- check-he flags Latin, math or formula runs outside a bdi in Hebrew fields.
- Retire or repoint chem-hebrew check (4), since no untranslated topic is left. Use a test fixture instead.
Done when: check-he 23/23 including the new rule; App Maker's new "no formula split across lines" check passes; 360px shots of electrochemistry, equilibrium, thermochemistry and acids show the formulas whole and in the right order.
H2b done: claude/h2b-bidi 4762038, check-he 23/23 PASS, check 4 now uses a fixture (planner: fixture is fine). Long formulas now scroll sideways instead of wrapping, judge at 360px after the merge. Claude session: context 87% and 72% of the 5-hour limit used (resets 18:50 IL), so the next Claude round needs a fresh session started by Yishi.
H2b merged into dev 451ec35 (gh-pages d3a58b2): electrochemistry is fixed (shot 67), English is pixel-identical, check-he 23/23.
### H2c fix round (planner, 2026-11-09), Sonnet, fresh Claude session
1. Long equation chains: break them into one nowrap bdi per piece, split before " = ", " ⇌ " and " → ", with normal line breaks allowed between pieces (the RTL order of the pieces must stay left-to-right, so wrap the whole chain in an outer LTR bdi that is allowed to wrap only at those points). No sideways scrolling. Shot 71 (Qc chain looked like "= 0") must show the whole chain over 2 lines.
2. Card answers follow the same nowrap rule (redox answers MnO4− + 5Fe2+ … split inside).
3. A unit inside parentheses next to a Hebrew prefix gets its own bdi, e.g. (mol/L) in equilibrium step 1.
4. Find and fix the 2 page overflows from App Maker's no-split check.
Done when: App Maker's no-split check at 360px shows 0 splits and 0 overflow (SVG labels excluded); shot 71 shows the full chain ending in 4.0; check-he 23/23; English unchanged.
H2c done: claude/h2c-long-formulas b30762b (long chains break before = ⇌ → ≈, then +; overflows on t15-q2 and t18-q3 fixed; the maqaf break is blocked). Waiting on App Maker's re-test. That Claude session is finished (context 91%), and the next round needs a fresh session from Yishi.
H2c merged into dev 166b897 (gh-pages 3073128): no-split at 360px finds 0 splits and 0 overflow, check-he 23/23, English pixel-identical. H2 DONE.
### H3 (started 2026-11-09)
- Copy Humanizer: reviews all 23 Hebrew topics against the style rules and returns style notes plus per-field fixes (no file edits).
- Critiquito: RTL phone check on /dev/ (360px), covering home, reading, card and the toggle.
- Known polish item for the H3 fix round: a sign or coefficient sitting just outside a bdi displays RTL-style ('מ־7+ ל־2+', 'H₂O 4' in t6-q1). Pull leading coefficients and signs into the adjacent bdi, wrap oxidation states like +7, and add a check-he rule for it.
- Then one Claude round (fresh session) applies the fixes, and Yishi skims on the weekend with the report button.
H3 Critiquito RTL check (shots/crit-he-*, list in /workspace/critiquito/chem-practice-DESIGN.md). Planner triage after looking at the shots:
- NOT bugs: a sentence-final period appearing to the left of a formula is correct RTL order. "ΔG°, K ו־E°" reads correctly right to left.
- Real, for the H3 Claude round: (a) punctuation and brackets must stick to the formula next to them across line breaks: no comma alone at the start of a line (crit-he-04 step 1), no "(" left alone at a line end (crit-he-10 step 4, around NH3); (b) the sign and coefficient fix from App Maker ('מ־7+', 'H₂O 4'); (c) the meta line "Focus N · Topics …" in Hebrew mode becomes "פרק N · נושאים …", with codes kept; (d) "Σ reactants / Σ products" in the thermo mistake box gets translated; (e) the galvanic-cell figure subtitle has a raw E°_cell, use a real subscript (Hebrew drawing labels stay on the later list); (f) on home, keep "· 0/5 נלמדו" from breaking apart; (g) the arrow in equilibrium step 3 ("← יותר") should point the right way for RTL, check the data.
- Report link: the URL is a correct github.com issues/new link. The 404 was a signed-out headless browser. Yishi confirms with one tap on his phone.
H3 Copy Humanizer review: vault/H3-humanizer-fixes.md (312 fixes, 49 swaps of בעיה → שאלה, 16 cross-topic notes, glossary changes, English notes in section 4). Planner calls: use “תשובה סופית:” everywhere; UI: הקישו להגדלה → לחצו להגדלה, לא בטוח → לא בטוחים, א׳/ב׳ with a real geresh. Yishi 2026-11-09: standard = סטנדרטי everywhere (תנאי תקן stays for STP); בליעה for both absorption and absorbance, bracketed once.
### H3 Claude round (fresh session), Sonnet
Apply all of H3-humanizer-fixes.md (the file has to be committed to the repo first, docs/H3-humanizer-fixes.md), add its cross-topic notes to the PLAN style rules and the glossary changes to glossary.json, plus Critiquito items (a) to (g) above. Done when: check-he 23/23; a script confirms every 'current' string is gone and every 'suggested' string is present; App Maker's no-split check is clean; Critiquito re-checks at 360px.
