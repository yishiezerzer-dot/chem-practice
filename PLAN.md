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

