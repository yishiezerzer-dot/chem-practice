# Chem Practice — DESIGN SPEC v0.4.1 (figma bro, 5 Nov 2026; Critiquito reading fixes synced)

Spec only. Nothing is built. Values below are proposals for v1, not measured from an existing file.
Platform: mobile first (students on phones), 360–430 px wide; desktop centers content at max 680 px.

## 0. Decided
Self-graded flashcard flow, no answer input before reveal (PLAN.md updated to match).

## 1. Tokens
| Token | Value | Use |
|---|---|---|
| color/bg | #FAFAF7 | page |
| color/surface | #FFFFFF | cards |
| color/text | #1A1A1A | body |
| color/muted | #5F6B7A | meta, refs |
| color/border | #E3E5E8 | card borders, dividers |
| color/primary | #2B5FD9 | primary buttons, links, focus ring |
| color/knew | #17754A | Knew it |
| color/unsure | #8F5B0A | Unsure |
| color/didnt | #C2412D | Didn't know |
| color/tip-bg | #EEF3FD | tip box |
| space | 4, 8, 12, 16, 24, 32, 48 | only these |
| radius | 8 (buttons), 12 (cards) | |
| font | Inter (EN) + Rubik or Heebo (HE); math in KaTeX | |
| type | 28/34 title, 20/28 heading, 17/26 body, 15/22 meta, 13/18 caption | |
| tap target | min 48 px tall | all buttons |
| motion | 150 ms ease-out (fade/slide 8 px); 0 ms if prefers-reduced-motion | reveal, card change |

Contrast checked (WCAG formula) on white / on #FAFAF7: knew 5.7 / 5.5, unsure 5.7 / 5.5, didnt 5.1 / 4.9, primary 5.6 / 5.4, muted 5.4 / 5.2. All pass 4.5:1 as text and with white text on a filled button. Never color alone, always a label.

## 2. Global layout
- Top bar 56 px: back arrow (start side), screen title, language toggle EN/עב (end side). Weak topics icon on Home.
- Content padding 16 px mobile, 24 px desktop. Cards: surface, 1 px border, radius 12, padding 16/24.
- Bottom action area sticky on mobile (padding 16, safe-area aware), so the main button is under the thumb.

## 3. Home / topic picker (course order)
- Header: course "69107 · Introduction to Chemistry" (meta), title "Pick a topic".
- "Continue" card at top if a session is in progress: topic name, "12 cards left", primary button "Resume".
- "Due today" chip row if spaced cards are due: "8 cards due across 3 topics" → button "Review due".
- Topic list sorted by `order` from topics.json, never alphabetical. Tapping a topic opens the Reading screen (§3b), not the cards directly. Each row 64 px:
  - order number in a 32 px circle (muted), topic name (body), chapter ref (caption, e.g. "Focus 1 · Topic 1A").
  - end side: progress ring 24 px (share of cards in Knew-it state) + due count badge if > 0.
- Group rows under Atkins section headers (Fundamentals, Focus 1…10) as sticky 13 px uppercase labels.
- Empty topic (no reviewed questions yet): text stays full muted color (no opacity change); only the number circle is dimmed to border color; label "Coming soon"; not tappable, aria-disabled.

## 3b. Reading screen (added 5 Nov 2026, matches live build)

Flow change from v0.3: tapping a topic opens **Reading** first, then practice. A "Skip to cards" link jumps straight to the cards. After a reading, the topic page can reopen it with "Read the section again".

Layout, top to bottom:
1. Top bar 56 px: back (to Home) + the word "Reading" (or empty). Never put the topic name in the top bar; the on-page H1 already shows it in full (same rule as cards using "Card N of 5").
2. Thin progress bar under the top bar (4 px, primary fill = scroll position / content height), same pattern as the card session bar.
3. Chapter ref (caption, muted).
4. H1 topic name (20/28 or 28/34 on mobile, wrap freely).
5. Draft badge when `reviewed:false`: caption muted, "Draft, not checked yet".
6. **"Skip to cards"** text link (primary) directly under the title/badge, so a student who wants to skip can do it without scrolling. Do not put Skip only next to Start practice at the bottom.
7. Sections in order. Each section:
   - Heading (20/28 bold).
   - Body paragraphs (17/26), max ~65 characters per line.
   - Optional **Worked example** card: tip-bg fill (`color/tip-bg`) OR a 4 px primary left border on surface, radius 12, padding 16. Caption "Worked example", then bold title, then numbered steps (same step style as calculation reveals). Must look different from a plain content card while scrolling. Equations: break only before `=`, keep value + unit together, sideways scroll if needed.
   - Optional **chart** (schematic only): full content width, max height ~200 px. Title inside the SVG in 15 px meta/caption style (`color/muted`), worded like "Relative size (schematic, not to scale)". No numeric bar labels or axis values. Series colors: primary blue + neutral gray only — never knew-green, unsure-amber, or didnt-red. Visible key for each color series (e.g. anions / cations) on its own row below the title, ~8 px gap, swatches vertically centered with their labels. Never put the key on the same line as the title. External caption may still say the chart is schematic (not Atkins data).
   - Optional **figure**: if `src` is set, render `<img class="rsketch">` inside `.rfig` — `max-width: 100%`, height auto, centered. Use `alt` from Chem Sketcher. On phones (≤430 px): tap opens a lightbox. The image must render at ≥2× its natural pixel width inside a pan/scroll container (both axes), with pinch-zoom allowed (`touch-action: pinch-zoom`; do not lock the page with `user-scalable=no` while the lightbox is open). Dim the backdrop to ≥85% opacity. Caption under the inline figure: "Tap to enlarge". Prefer Chem Sketcher stacked/narrow layouts when available. If still `status: pending-sketch`, show a dashed placeholder (radius 12, muted border, padding 16) with caption "Figure coming soon" and the note.
8. Bottom of reading: sticky primary button "Start practice (N cards)" only — same sticky bottom pattern as the rating bar (padding = bar height + 16 + safe-area so the last paragraph is never covered).

Tokens: reuse existing ones. No new colors. Charts use primary blue + neutral gray (+ muted/text for labels); never rating colors as series fills; no rainbow series unless tokens gain a plot palette later.


### Reading depth (Yishi, 5 Nov 2026)
**Deep-reading chrome (live on Measurement & Stoichiometry samples):**
- **"In this reading"** TOC card under Skip to cards: surface, 1 px border, radius 12, numbered links to each H2 (`scroll-margin-top` clears the sticky top bar). Keep it.
- Callouts:
  - **Why this matters:** tip-bg + 4 px primary left edge.
  - **Common mistake:** warm tint `#FCF2F0` + 4 px didnt left edge; optional Wrong / Why wrong / Correct sub-lines.
  - **Check yourself:** soft gray tint `#F4F5F6` + 4 px neutral edge `#6B7280` (≥3:1 on the tint). Short numbered self-test questions. **Exception:** hide each answer behind a "Show answer" button (one per question). Self-tests are not worked-example steps — never accordion those steps.
- **Common mistake:** soft amber tint `#FFF8EB` + 4 px amber edge `#B45309` (≥3:1 on the tint). Do **not** reuse Knew / Didn't know greens and reds for callouts — those colors mean rating feedback.
- Intro line (with Show answer): "Try these without looking back, then tap Show answer to check."
- Mistake UI labels: "Wrong approach." / "Why that's wrong." / "Do this instead." — JSON `wrong` / `correct` must not repeat those labels.
- Order under the H1: Draft badge → Skip to cards → TOC → sections.
- Worked examples stay fully expanded; never accordion the steps.

**Long-reading chrome (Critiquito, 5 Nov 2026):**
- Top bar: add a compact **Sections** control that scrolls back to the "In this reading" TOC. Keep the progress bar.
- Order under H1: Draft badge → Skip to cards → TOC → body.
- Mistake / Check callouts use amber / gray (above), not Knew / Didn't-know.


Readings must teach, not summarize. Write for a student who is seeing the idea for the first time:
- Never skip an intermediate step (algebra, unit cancel, electron count, sign convention).
- Each non-obvious claim gets one short "why" line or a worked example that shows the hop.
- Prefer more short paragraphs and more worked examples over one dense paragraph.
- Optional callouts: **Why this matters** (tip-bg + primary edge), **Common mistake** (amber `#FFF8EB` / edge `#B45309`), **Check yourself** (gray `#F4F5F6` / edge `#6B7280`). Self-test answers sit behind "Show answer" buttons. Never reuse Knew/Didn't-know colors for callouts.
- Worked examples may use `worked` (one) and/or `workedExamples` (list). Every step stays visible; never collapse steps behind a tap.
- Under the reading title and Skip to cards, show **In this reading**: a short TOC of section links. Section headings get stable `id`s and `scroll-margin-top` so the sticky top bar does not cover them. Keep the reading progress bar (`#bar`).
- Long readings stay usable: keep the scroll progress bar, H2 section headings in a real outline, and Skip to cards at the top. Do not hide steps behind "show more".

Accessibility: headings in a real outline (h1 topic, h2 section). Placeholder figures need a short alt describing what will be drawn. Skip to cards sits near the top (after the title); sticky Start practice must not trap keyboard focus away from it.

## 4. Question card
Order top to bottom:
1. Meta row (caption, muted): topic name · "Card 4 of 15" · type tag ("Concept" or "Calculation").
2. Progress bar 4 px under top bar: Knew-it cards / total in session.
3. Question text, body 17/26, max 65 characters per line. Formulas via KaTeX, chem via mhchem (\ce{H2O}).
4. Optional figure (redrawn by us, never a textbook scan): full card width, max 240 px tall, alt text required.
5. **Tip box** (see §5).
6. Sticky primary button: "Show answer" (full width, 48 px).

### 4a. Concept vs calculation
| | Concept | Calculation |
|---|---|---|
| Tag | "Concept" | "Calculation" |
| Given data | inside the question text | separate "Given" block: one line per value, symbol = value unit, tabular numerals |
| Tip text | "Answer it in your head first, then check." | "Solve it in your notebook first, then check." |
| Reveal | short answer + explanation paragraph(s) | final answer box + numbered steps (§6) |

## 5. "Try it first" tip
- Box: tip-bg, radius 8, padding 12, 15/22 text, small lightbulb icon on the start side.
- Shown on every card until the student dismisses with "Hide tips" (saved in browser); then a 13 px one-line reminder remains above the button.

## 6. Answer reveal
- Replaces the "Show answer" button; content appears under the question (question stays visible). 150 ms fade, then scroll so the top of the **Answer** block sits 16 px under the top bar (not to the rating bar).
- Reveal content gets bottom padding = rating bar height + 16 px + safe-area inset, so the last step and the book reference are never under the sticky bar.
- **Answer** block: label "Answer" (caption), answer in 20/28 bold. Calculation: final value in a bordered box, with units and sig figs.
- **Explanation**: concept = 1–3 short paragraphs; calculation = numbered steps, each step one line of reasoning + one equation line, results highlighted in text color bold.
- **Book reference** row (meta, muted): book icon + "Atkins 8e · Topic 2B, pp. xx–xx". Text only, no scans.
- "Report a problem" link (caption) at the very end (opens a mailto or a form later; no account).
- Then the rating bar (§7).

## 7. Knew it / Unsure / Didn't know
- Sticky bar, three equal buttons, 56 px tall, 8 px gap. Order: Didn't know · Unsure · Knew it (Knew it at the thumb end; mirrors in RTL).
- Each button: label (15 bold) + return time underneath (13), centered, up to 2 lines each; button grows to 64 px if a line wraps (all three grow together):
  - Didn't know → "~3 cards"
  - Unsure → "~8 cards"
  - Knew it → "Done for today" (or "next: in 3 days" when the day schedule applies, see §9).
- Style: outline in its status color, filled on press. Keyboard 1/2/3 on desktop.
- If fewer cards remain than the gap, label reads "at the end".
- Width test before build: at 360 px each button is ~104 px wide; test the longest Hebrew labels ("לא ידעתי", "לא בטוח", "ידעתי") with their return times in Rubik 15/13. If any overflows, drop the label to 14 px, never truncate.

## 8. Session flow
1. Start from topic or "Review due": queue = topic's cards in question order (or due cards).
2. Card → Show answer → rate → next card slides in (8 px, 150 ms).
3. Didn't know re-inserted 3 places ahead; Unsure 8 places ahead (or end).
4. Session ends when every card in the queue is Knew it.
5. **End screen**: "Topic done" title, counts row (Got it first try · Needed another go), the 3 hardest cards listed, buttons "Back to topics" (primary) and "Review hardest again".
6. Leaving mid-session keeps the queue; Home shows the Continue card.

## 9. Spaced repetition across days
- Final rating of the card in a session sets its day schedule:
  - Knew it on first try: advance one step, 1 day → 3 days → 1 week, then stays at 1 week (v1).
  - Unsure at any point in the session: keep the current interval (a new card starts at 1 day).
  - Didn't know at any point in the session: reset to 1 day.
- Home "Due today" row and per-topic due badges are the only entry points; no notifications in v1.
- Home footer: "Progress is saved on this device only." plus two text buttons, "Export progress" (downloads a .json file) and "Import progress" (file picker, then a confirm dialog: "This will replace your progress on this device." with Cancel / Replace).
- Show a dismissible one-line nudge above the footer, "Back up your progress", only when there are 20+ rated cards AND 7+ days since the last export (or since the first rating if never exported). Dismiss hides it for 7 days.

## 10. Weak topics view
- Title "Weak topics". Sorted by weakness share = (Didn't-know × 2 + Unsure) ÷ total ratings in that topic, over the last 14 days. Ties broken by more Didn't-know.
- A topic needs at least 10 ratings to be ranked; below that it shows in a separate "Not enough practice yet" group, with no score.
- Row: topic name, chapter ref, a horizontal stacked bar (didnt / unsure / knew), and "Practice" button.
- Topics with no attempts: hidden, with a line "Topics you haven't tried don't show here."
- Empty state: "No weak spots yet. Do a few cards and check back."

## 11. Hebrew + English (RTL)
- **v1 ships English only.** Hebrew layout rules below are for the post-v1 pass; keep `dir` and logical CSS ready, but do not ship Hebrew strings in v1.
- Use `dir="rtl"` on the html element for Hebrew; layout uses logical properties (margin-inline-start etc.), so icons, back arrow and the rating order mirror.
- Formulas, equations, units and numbers stay LTR inside RTL text (wrap math in `dir="ltr"` spans).
- Chemistry terms: show the English term in parentheses after the Hebrew the first time on a card.
- Toggle in top bar, saved in browser. Content needs both languages per question; missing translation falls back to English with a small "English only" tag.

## 12. Accessibility
- Contrast 4.5:1 for text; focus ring 2 px primary with 2 px offset; all buttons reachable by keyboard.
- Status always shown by text, not just color. Figures need alt text; KaTeX renders accessible MathML.
- Respect prefers-reduced-motion and 200% text zoom without horizontal scroll.

## 13. Not in v1
Multiple-choice answer input (flashcards chosen), logins, cross-device sync, timers, mock exams, leaderboards, notifications, dark mode (tokens are ready for it later).
