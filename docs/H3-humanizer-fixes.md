# H3 Hebrew polish: Copy Humanizer fixes (2026-11-09)

I reviewed all 23 Hebrew topic overlays (`data/he/topics/*.json`: reading sections and cards) on origin/dev at **166b897**, against PLAN.md Hebrew style rules 1–10 and for natural HUJI-student Hebrew. The review found **312 fixes**.

- Every “current” string below was checked by script as an exact substring of its field, with the real `<bdi>`/`<sub>`/`<sup>` markup. No two fixes overlap within a field, so each one is a drop-in replacement for the quoted part only.
- Not reviewed, per the brief: formula and bidi display, “פרק N” section labels, and chemistry accuracy. Check intros all match the measurement template already.
- 49 more בעיה → שאלה replacements are listed by location in Appendix A, and the two find-and-replace patterns are in notes 1.15 and 1.16. None of these is counted above.

## 1. New cross-topic style notes

These patterns aren't covered by rules 1–10. Each one recurs in several topics. Every instance I found is fixed in section 2, except where a note says otherwise.

1. **"problem" → שאלה / תרגיל, not בעיה.** In Hebrew, בעיה means a trouble, not an exercise. The pattern has 64 occurrences in 22 topics. Section 2 fixes 15 of them as part of other edits. The other 49 are listed in Appendix A, so they aren't itemized as fixes. Examples: “אם בבעיה נתונים” → “אם בשאלה נתונים”; “בבעיות מבוא” → “בשאלות מבוא”; “אלא אם הבעיה אומרת אחרת” → “אלא אם בשאלה כתוב אחרת”.
2. **"net" → כולל, or drop it.** Keep נטו only inside the fixed term משוואה יונית נטו, and always write the full term, never a bare “נטו:”. Examples: “דיפול נקי” → “דיפול כולל”; “מטען נקי” → “מטען חשמלי”; “התגובה נטו מתקדמת” → “התגובה מתקדמת”; “<bdi>K</bdi> נטו” → “<bdi>K</bdi> הכולל”; “כצרכנים נטו” → “אינם נצרכים”.
3. **Bookkeeping and "clean/messy" calques.** Use ספירה or חישוב for bookkeeping and ברור for clean. Examples: “כלי חשבונאות” → “דרך לספור אלקטרונים”; “וניהול ערכי <bdi>K<sub>a</sub></bdi>” → “והחישוב עם ערכי <bdi>K<sub>a</sub></bdi>”; “בצורה נקייה” → “בצורה ברורה”; “להתנקות למספרים שלמים” → “לצאת קרוב למספרים שלמים”.
4. **"solve for x" → מצאו / חשבו / בודדו את x, not פתרו עבור.** “פתרו את המשוואה הריבועית” is fine. Examples: “ופתרו עבור <bdi>x</bdi>” → “ומצאו את <bdi>x</bdi>”; “פתרון עבור <bdi>K</bdi>:” → “חישוב <bdi>K</bdi>:”.
5. **Drama verbs for approximations, buffers and trends.** Use these replacements: fails (נכשל) → לא תקף / לא עובד; breaks (נשברת) → קיבולת החציצה נגמרת; collapses (קורסת) → יורדת מאוד; wins/beats (מנצח) → גובר על; takes over (משתלטת) → תקפה; flips (יתהפך) → ישנה צבע.
6. **"silent error" → טעות שקשה לזהות / שקל לפספס, not טעות שקטה.** Examples are in light-matter, equilibrium and electrochemistry.
7. **Other recurring calques:**
   - recipe: מתכון → הרכב / סדר עבודה
   - story: סיפור → תהליך / חישוב
   - map: מפת דוגמאות → דוגמאות
   - toolkit: ארגז כלים → עובדים כך
   - stick to: הישארו עם → השתמשו ב
   - label: תווית / תיוג → תשובה / זיהוי
   - experiences: חווה → יש לו / פועלים עליו
   - takes longer: לוקח יותר זמן → צריך יותר זמן
   - modest: צנוע → קטן
   - X wants / expects: הבעיה רוצה, ש־<bdi>K<sub>p</sub></bdi> מצפה לה → בשאלה מבקשים, שבה נתון
   - still applies: עדיין חל → גם כאן צריך…
   - gentler / harsher photon: עדינים / חזקים → בעלי אנרגיה נמוכה / גבוהה
   - classroom check: בדיקת כיתה → הדגמה בכיתה
8. **Inanimate subjects that "use" or "do" something.** Switch to an impersonal verb. Examples: “תערובות אמיתיות משתמשות ב־” → “בתערובות אמיתיות משתמשים ב־”; “<bdi>Q</bdi> משתמש בריכוזים” → “ב־<bdi>Q</bdi> משתמשים בריכוזים”; “נקודת רתיחה נורמלית משתמשת ב־” → “מוגדרת ב־”.
9. **Voice in `mistake.wrong`: present impersonal plural.** Most topics use this voice (מחשבים, שוכחים). Several use a noun phrase (שימוש ב…, הצבת…, ערבוב…, הכפלת…) or an infinitive (לספור…, לדרג…). Fixed in bonding II, IMF, entropy, acids, buffers, solubility, electrochemistry and kinetics. Example: “שימוש ב־<bdi>[H<sup>+</sup>] = K<sub>a</sub></bdi>…” → “משתמשים ב־<bdi>[H<sup>+</sup>] = K<sub>a</sub></bdi>…”.
10. **One Hebrew word per concept (non-glossary words).**
    - phase: פאזה, not מופע (entropy used מופע 5 times)
    - melting: היתוך, not התכה or נמס
    - sublime: ממריא, not מתאדה or מומריא
    - dilution: מיהול / מהול / מהלו, not מדולל / מדלל. Use דליל for a low-pressure gas.
    - הכלאה, not היברידיזציה
    - resonance hybrid: היבריד תהודה, not היברידית
    - delocalized: לא ממוקם, not מפולג
    - spectral shift: הסטה, not הסחה (הסחה means distraction)
    - intransitive deposit: שוקע, not משקיע (which means invests). Transitive השקעה is fine.
    - always הבסיס הצמוד / החומצה הצמודה, never a bare "הצמוד"
    - spell טטראהדר־ and אוקטהדר־
11. **המסה (dissolving) vs מסה (mass).** “המסה של X” reads as "the mass of X". Use the construct form המסת X. Example: “המסה של <bdi>NaCl(s)</bdi> במים” → “המסת <bdi>NaCl(s)</bdi> במים”.
12. **Use נושא for a topic, not פרק.** פרק is the UI's section label (פרק N). Example: “כמו בפרק שיווי המשקל” → “כמו בנושא שיווי המשקל”.
13. **Bracket placement and first use.**
    - The bracket goes right after the term, before any adjective. Example: “קבוע היווצרות גדול <bdi>(formation constant)</bdi>” → “קבוע היווצרות <bdi>(formation constant)</bdi> גדול”.
    - Topic names and headings don't count as first use. In current practice the heading either carries the bracket or the next paragraph does, and I didn't flag either.
    - I itemized only real body-text misses, in atoms (the-mole) and KMT (p3).
14. **Spelling consistency.** Use לעיתים, not לעתים (all 6 fixed). Start a sentence with ודאו, not וודאו (2 in redox). Use שריפה (not שרפה), פלנק (not פלאנק), סטודנטים (not תלמידים), and gender agreement (שתי אונות, היא תרכובת).
15. **Step label “תשובה סופית:” vs “התשובה הסופית:”.** Seven topics use the article form in 47 steps: acids, electrons-in-atoms, entropy, gases, KMT, equilibrium and thermochemistry. The other 16 topics use “תשובה סופית:” in 56 steps. Pick one. I suggest “תשובה סופית:”. These aren't itemized because a find-and-replace covers them.
16. **Quotation marks.** Most topics use “…”. Redox (5 pairs), types (3) and gases (1) use gershayim ״…״ as quotation marks. Electrochemistry's single pair is fixed in section 2. Use “…” throughout. These aren't itemized because a find-and-replace covers them.


## 2. Per-topic fixes

### measurement-units-and-significant-figure (מדידות, יחידות וספרות משמעותיות)

1. `reading.sections[id=density].worked.steps[6]`: “בשלב הזה שומרים את הספרה הנוספת.” → “בשלב הזה שמרו את הספרה הנוספת.”. Rule 3, impersonal inside a step.
2. `questions.t1-q3.steps[1]`: “בחיבור, התשובה שומרת את המספר הקטן ביותר של ספרות אחרי הנקודה העשרונית מבין כל המחוברים.” → “בחיבור, בתשובה יש אחרי הנקודה העשרונית כמה ספרות שיש למחובר עם הכי מעט ספרות אחרי הנקודה.”. Calque of "the answer keeps"; matches the reading's wording in sig-figs-in-calculations p2.

### atoms-elements-and-the-mole (אטומים, יסודות ומושג המול)

1. `reading.sections[id=isotopes-and-ions].paragraphs[1]`: “בעלי מטען נקי” → “שיש להם מטען חשמלי”. "net charge" calque; מטען נקי is not Hebrew usage.
2. `reading.sections[id=isotopes-and-ions].paragraphs[2]`: “בסידור אחר של הנוסחה:” → “ומכאן:”. Same family as rule 1 (סידורים מחדש).
3. `reading.sections[id=mass-mole-particle].paragraphs[0]`: “שלוש המרות קשורות מכסות כמעט כל בעיית מול מוקדמת:” → “שלוש המרות שקשורות זו לזו מספיקות כמעט לכל תרגיל מולים בסיסי:”. "early mole problem" calque.
4. `questions.t2-q5.explanation`: “איזוטופים חולקים את אותו מספר אטומי” → “לאיזוטופים יש אותו מספר אטומי”. "share the same" calque.
5. `reading.sections[id=the-mole].paragraphs[0]`: “אטומים, מולקולות, יונים או יחידות נוסחה,” → “אטומים, מולקולות <bdi>(molecule)</bdi>, יונים או יחידות נוסחה <bdi>(formula unit)</bdi>,”. Bracket on first use: both terms first appear here, and the brackets currently sit in p3 (drop them there; see next item).
6. `reading.sections[id=the-mole].paragraphs[3]`: “מולקולות <bdi>(molecule)</bdi> מים” → “מולקולות מים”. Pairs with the item above (one bracket per term).
7. `reading.sections[id=the-mole].paragraphs[3]`: “יחידות נוסחה <bdi>(formula unit)</bdi> של” → “יחידות נוסחה של”. Pairs with the item above.

### chemical-compounds-formulas-and-oxidatio (תרכובות, נוסחאות ומספרי חמצון)

1. `reading.sections[id=formula-types].paragraphs[3]`: “האינדקסים התחתיים <bdi>(subscript)</bdi> בנוסחה נקבעים בטבע עבור התרכובת.” → “האינדקסים התחתיים <bdi>(subscript)</bdi> בנוסחה נקבעים על ידי התרכובת עצמה.”. "fixed by nature" read literally (בטבע = in nature).
2. `reading.sections[id=formula-types].paragraphs[5]`: “הן עשירות יותר מהנוסחה המולקולרית” → “הן נותנות יותר מידע מהנוסחה המולקולרית”. "richer" calque.
3. `reading.sections[id=percent-composition].paragraphs[4]`: “בבעיות אחוזים כמעט תמיד שואלים על יסוד אחד” → “בשאלות על אחוזי מסה בדרך כלל שואלים על יסוד אחד”. Calque; "almost always" kept as בדרך כלל is fine either way.
4. `reading.sections[id=empirical-from-percent].paragraphs[0]`: “דרך סטנדרטית הופכת הרכב באחוזי מסה לנוסחה אמפירית:” → “כך הופכים הרכב באחוזי מסה לנוסחה אמפירית:”. "a standard route turns" calque.
5. `reading.sections[id=empirical-from-percent].paragraphs[7]`: “כמויות המולים יכולות להיראות מבולגנות (<bdi>3.3306…</bdi>), אבל היחס הסופי צריך להתנקות למספרים שלמים בטווח של כ־0.1.” → “כמויות המולים יכולות לצאת מספרים לא נוחים (<bdi>3.3306…</bdi>), אבל היחס הסופי צריך לצאת קרוב למספרים שלמים, בטווח של כ־0.1.”. "messy / clean up" calques.
6. `reading.sections[id=oxidation-states].paragraphs[0]`: “מטען חשבונאי שמיוחס לאטום” → “מטען מוסכם שמייחסים לאטום”. "bookkeeping charge"; חשבונאי reads as accounting. Same in p10: במובן החשבונאי → במובן הפורמלי.
7. `reading.sections[id=oxidation-states].paragraphs[10]`: “(איבוד אלקטרונים במובן החשבונאי)” → “(איבוד אלקטרונים במובן הפורמלי)”. See p0.
8. `reading.sections[id=oxidation-states].paragraphs[9]`: “הישארו עם הכללים לערכים שלמים שלמעלה, אלא אם הבעיה אומרת אחרת.” → “השתמשו בכללים שלמעלה, שנותנים ערכים שלמים, אלא אם בשאלה כתוב אחרת.”. "stick to" calque.
9. `reading.sections[id=oxidation-states].paragraphs[11]`: “אם מקצים בעיוורון <bdi>O = −2</bdi>” → “אם מציבים אוטומטית <bdi>O = −2</bdi>”. "blindly assign" calque.
10. `reading.sections[id=oxidation-states].paragraphs[11]`: “זהו את קשר <bdi>O–O</bdi> היחיד ועברו לחריג של הפרוקסיד.” → “זהו את הקשר היחיד <bdi>O–O</bdi> והפעילו את החריג של הפרוקסיד.”. Meaning drift: "קשר O–O היחיד" reads as "the only O–O bond"; English is "the O–O single bond". "switch to" calque.
11. `questions.t3-q5.explanation`: “(שני אטומי הגופרית אינם שווים באמת” → “(שני אטומי הגופרית אינם שקולים באמת”. "equivalent" = שקולים.

### chemical-equations-and-stoichiometry (משוואות כימיות וסטויכיומטריה)

1. `reading.sections[id=balanced-equations].paragraphs[0]`: “משוואה כימית היא משפט קצר שמראה” → “משוואה כימית היא כתיבה מקוצרת שמראה”. "compact sentence"; משפט קצר loses the shorthand sense.
2. `reading.sections[id=balanced-equations].paragraphs[2]`: “משוואה מאוזנת היא הנהלת החשבונות שמכבדת את הכלל הזה.” → “משוואה מאוזנת היא רישום שמקיים את הכלל הזה.”. "bookkeeping that respects" calque.
3. `reading.sections[id=mole-ratios].worked.title`: “פשוט: מולים של מים” → “דוגמה פשוטה: מולים של מים”. Bare "פשוט:" reads as "simply".
4. `reading.sections[id=grams-to-grams].worked.title`: “קשה יותר: המסה של” → “דוגמה קשה יותר: המסה של”. Pairs with the fix above.
5. `reading.sections[id=limiting-reactant].paragraphs[0]`: “כששני מגיבים נתונים שניהם בכמויות מוגבלות” → “כששני המגיבים נתונים בכמויות מוגבלות”. Doubled שניהם.
6. `reading.sections[id=limiting-reactant].workedExamples[0].steps[5]`: “דווחו על 3 ספרות משמעותיות באחוז.” → “דווחו את האחוז עם 3 ספרות משמעותיות.”. "דווחו על" = report about.
7. `reading.sections[id=dilution].paragraphs[0]`: “ריכוז <bdi>(concentration)</bdi> בבעיות מוקדמות רבות הוא מולריות <bdi>(molarity)</bdi>.” → “ברוב השאלות בשלב הזה, ריכוז <bdi>(concentration)</bdi> פירושו מולריות <bdi>(molarity)</bdi>.”. "many early problems" calque.
8. `reading.sections[id=dilution].worked.steps[2]`: “ופתרו עבור <bdi>V<sub>1</sub></bdi>:” → “ובודדו את <bdi>V<sub>1</sub></bdi>:”. "solve for" calque, rule 1 family.
9. `questions.t4-q5.q`: “המגיב הנמצא במסה קטנה יותר” → “המגיב שמסתו קטנה יותר”. Stiff.

### types-of-reactions-in-aqueous-solution (סוגי תגובות בתמיסה מימית)

1. `reading.sections[id=electrolytes].heading`: “אלקטרוליטים ומה שמסיס” → “אלקטרוליטים ומסיסות”. "what dissolves" read literally.
2. `reading.sections[id=electrolytes].paragraphs[1]`: “באופן מלא כל כך במים מדוללים,” → “באופן מלא כל כך בתמיסה מהולה,”. "dilute water" (see English notes); glossary term is מיהול, so מהולה not מדוללת.
3. `reading.sections[id=electrolytes].paragraphs[4]`: “אם כל הצימודים האפשריים מסיסים” → “אם כל הצירופים האפשריים מסיסים”. צימוד is coupling/conjugation.
4. `reading.sections[id=electrolytes].paragraphs[5]`: “מדללים כל יון בנפח הכולל לפני שמשווים” → “מחשבים את הריכוז של כל יון בנפח הכולל לפני שמשווים”. "dilute each ion by" calque; also מיהול family.
5. `reading.sections[id=electrolytes].paragraphs[6]`: “השמטה שלהם עולה בנקודות קלות גם כשהנוסחאות נכונות.” → “מי שמשמיט אותם מפסיד נקודות גם כשהנוסחאות נכונות.”. "costs easy points" calque.
6. `reading.sections[id=electrolytes].paragraphs[8]`: “אלקטרוליט חזק מדולל יכול להיראות” → “אלקטרוליט חזק מהול יכול להיראות”. One term (מיהול).
7. `reading.sections[id=net-ionic].paragraphs[0]`: “שלוש רמות של משוואה מספרות סיפורים שונים. המשוואה המולקולרית <bdi>(molecular equation)</bdi> מציגה תרכובות כאילו הנוסחאות שלמות.” → “אפשר לכתוב את אותה תגובה בשלוש רמות, וכל רמה מראה משהו אחר. המשוואה המולקולרית <bdi>(molecular equation)</bdi> מציגה את התרכובות בנוסחאות שלמות, כאילו אינן מתפרקות ליונים.”. "tell different stories" and "as if they were intact formulas" calques.
8. `reading.sections[id=net-ionic].paragraphs[4]`: “תלמידים מצמצמים לא פעם” → “סטודנטים מצמצמים לא פעם”. HUJI readers are סטודנטים.
9. `reading.sections[id=net-ionic].paragraphs[5]`: “אם הרישום היוני שלכם ישר.” → “אם המשוואה היונית שלכם נכונה.”. "honest" calque.
10. `reading.sections[id=net-ionic].paragraphs[8]`: “באותה סדרת תרגילים. סווגו קודם ורק אחר כך כתבו את המשוואות. לתגובות חמצון־חיזור יש ארגז כלים משלהן בקריאה הבאה.” → “באותו גיליון תרגילים. סווגו קודם ורק אחר כך כתבו את המשוואות. לאיזון תגובות חמצון־חיזור יש שיטה משלו, בקריאה הבאה.”. Meaning drift: English says redox gets its own balancing toolkit; Hebrew dropped "balancing".
11. `reading.sections[id=net-ionic].workedExamples[0].steps[1]`: “התמונה המולקולרית:” → “משוואה מולקולרית:”. Matches the other worked examples.
12. `reading.sections[id=net-ionic].mistake.correct`: “צמצמו רק יונים שבאמת אינם עושים דבר.” → “צמצמו רק יונים שבאמת לא משתתפים בתגובה.”. "do nothing" calque.
13. `reading.sections[id=redox-solution].paragraphs[1]`: “בתגובות מימיות מתעדים לרוב את מספרי החמצון” → “בתגובות בתמיסה מימית עוקבים בדרך כלל אחרי מספרי החמצון”. "track" = עוקבים, not מתעדים.
14. `reading.sections[id=redox-solution].paragraphs[1]`: “מימן הוא בדרך כלל <bdi>+1</bdi> עם אל־מתכות.” → “מימן הוא בדרך כלל <bdi>+1</bdi> עם לא־מתכות.”. The compounds topic uses לא־מתכות; one term.
15. `reading.sections[id=redox-solution].paragraphs[2]`: “היא דוגמה נקייה לחמצון־חיזור.” → “היא דוגמה ברורה לחמצון־חיזור.”. "clean example" calque.
16. `reading.sections[id=redox-solution].paragraphs[4]`: “כששיקוע וחמצון־חיזור שניהם אפשריים, זהו אותם בנפרד. פריטים רבים בבחינות מערבבים בכוונה שאלת מסיסות עם תיוג של מחמצן.” → “כשאפשריים גם שיקוע וגם חמצון־חיזור, זהו כל אחד בנפרד. שאלות רבות בבחינות משלבות בכוונה שאלת מסיסות עם זיהוי של המחמצן.”. "exam items" and "label" calques.
17. `reading.sections[id=redox-solution].paragraphs[5]`: “ולא רק את סמל היסוד בדיעבד.” → “ולא רק את סמל היסוד.”. "after the fact" translated literally; בדיעבד makes no sense here.
18. `reading.sections[id=redox-solution].paragraphs[7]`: “כאן התמקדו בתיוג המחמצן והמחזר” → “כאן התמקדו בזיהוי המחמצן והמחזר”. תיוג = tagging.
19. `reading.sections[id=redox-solution].workedExamples[1].steps[2]`: “זהו תחלוף של הלוגן, נפוץ בבדיקות הליד מימיות.” → “זו תגובת תחלוף של הלוגן, שמשמשת לעיתים קרובות לזיהוי הלידים בתמיסה מימית.”. Garbled; English: "a halogen displacement, common in aqueous halide tests".
20. `questions.t5-q2.explanation`: “<bdi>KNO<sub>3</sub></bdi> הוא תרכובת יונית מסיסה ומתפרק לגמרי.” → “<bdi>KNO<sub>3</sub></bdi> היא תרכובת יונית מסיסה, והיא מתפרקת לגמרי.”. Gender agreement with תרכובת.
21. `reading.sections[id=net-ionic].workedExamples[0].steps[3]`: “נטו:” → “המשוואה היונית נטו:”. A bare נטו: reads as "net weight"; use the full fixed term.
22. `reading.sections[id=net-ionic].workedExamples[1].steps[3]`: “נטו:” → “המשוואה היונית נטו:”. Same.

### balancing-redox-equations-and-titrations (איזון תגובות חמצון־חיזור וטיטרציות)

1. `reading.sections[id=acidic-half].paragraphs[1]`: “בתמיסה חומצית ארגז הכלים הוא:” → “בתמיסה חומצית עובדים כך:”. "toolkit" calque.
2. `reading.sections[id=acidic-half].paragraphs[5]`: “צריך לאזן את החמצנים בעזרת מים.” → “צריך לאזן את אטומי החמצן בעזרת מים.”. החמצנים is ambiguous next to מחמצנים.
3. `reading.sections[id=acidic-half].paragraphs[11]`: “נהלו טבלת מטען מצטברת אחרי כל שלב.” → “בדקו את המטען בשני האגפים אחרי כל שלב.”. "running charge tally" calque; there is no table.
4. `reading.sections[id=acidic-half].why`: “חצאי תגובה הופכים את רישום האלקטרונים לגלוי.” → “בחצאי תגובה רואים בבירור כמה אלקטרונים עוברים.”. "make bookkeeping visible" calque.
5. `reading.sections[id=acidic-half].workedExamples[0].steps[5]`: “וודאו אטומים ומטען” → “ודאו שהאטומים והמטען מאוזנים”. Spelling (ודאו), and the bare object list.
6. `reading.sections[id=basic-half].workedExamples[0].steps[4]`: “וודאו שלא נשאר” → “ודאו שלא נשאר”. Spelling.
7. `reading.sections[id=basic-half].paragraphs[8]`: “בעיות של מי חמצון בסיסי ואקונומיקה מסתירות לעיתים קרובות את התווך ברשימת המרכיבים (<bdi>NaOH</bdi> נוכח). עדיין איזנו אלקטרונים במפורש,” → “בשאלות על מי חמצן בתמיסה בסיסית ועל אקונומיקה, התווך מוסתר לעיתים קרובות ברשימת המרכיבים (יש <bdi>NaOH</bdi>). גם אז איזנו את האלקטרונים במפורש,”. Typo מי חמצון; "Still balance" ≠ עדיין.
8. `reading.sections[id=basic-half].worked.steps[2]`: “השוו אלקטרונים (כפולה משותפת מזערית 6):” → “השוו את מספרי האלקטרונים (הכפולה המשותפת הקטנה ביותר היא 6):”. Standard term for LCM.
9. `reading.sections[id=basic-half].mistake.correct`: “הוסיפו <bdi>OH<sup>−</sup></bdi> בשווה לשני האגפים,” → “הוסיפו אותו מספר של <bdi>OH<sup>−</sup></bdi> לשני האגפים,”. בשווה is not idiomatic.
10. `reading.sections[id=redox-titration].paragraphs[1]`: “היא הצבע הוורוד המתמשך הראשון מעודף זעיר של” → “היא הופעת הצבע הוורוד הראשון שנשאר, בגלל עודף זעיר של”. "first persistent pink" calque.
11. `reading.sections[id=redox-titration].paragraphs[2]`: “יחס <bdi>1:5</bdi> הזה מניע כל חישוב ריכוז.” → “על היחס <bdi>1:5</bdi> הזה בנוי כל חישוב ריכוז.”. "drives" calque.
12. `reading.sections[id=redox-titration].paragraphs[8]`: “ספרות נפח אחרונות מביורטת זכוכית תומכות בדרך כלל בשתי ספרות אחרי הנקודה העשרונית ב־<bdi>mL</bdi>.” → “בביורטת זכוכית קוראים את הנפח בדרך כלל עד שתי ספרות אחרי הנקודה העשרונית ב־<bdi>mL</bdi>.”. Word-for-word from "trailing volume digits ... support".
13. `reading.sections[id=basic-half].paragraphs[8]`: “נכשל כשהמטען לא מתאים.” → “לא עובד כשהמטען לא מתאים.”. "fails" calque.
14. `reading.sections[id=basic-half].worked.steps[5]`: “הצורה הבסיסית נטו:” → “המשוואה הסופית בסביבה בסיסית:”. "net basic form" calque.
15. `reading.sections[id=basic-half].mistake.whyWrong`: “את איזון המטען נטו שכבר תיקנתם.” → “את איזון המטען שכבר תיקנתם.”. "net" adds nothing here.

### gases-gas-laws-and-the-ideal-gas-equatio (גזים: חוקי הגזים וחוק הגזים האידאליים)

1. `reading.sections[id=gas-laws].paragraphs[1]`: “מכפילים את הלחץ ומחצים את הנפח.” → “כשהלחץ גדל פי 2, הנפח קטן לחצי.”. Reads as two separate actions, not cause and effect.
2. `reading.sections[id=gas-laws].paragraphs[7]`: “בשפת המעבדה:” → “דוגמאות מהמעבדה:”. "In lab terms" calque.
3. `reading.sections[id=gas-laws].why`: “שלושת החוקים האלה מתחברים למשוואת הגז האידאלי שתשתמשו בה” → “שלושת החוקים האלה מתחברים לחוק הגזים האידאליים, שתשתמשו בו”. One term (glossary: חוק הגזים האידאליים); the topic name and heading already use it.
4. `reading.sections[id=ideal-gas-equation].paragraphs[2]`: “סידורים של הנוסחה:” → “אפשר לסדר את הנוסחה גם כך:”. Rule 1, exact case.
5. `reading.sections[id=ideal-gas-equation].paragraphs[4]`: “בחרו מערכת אחת והישארו בתוכה.” → “בחרו מערכת יחידות אחת ועבדו רק בה.”. "stay inside it" calque.
6. `reading.sections[id=ideal-gas-equation].paragraphs[5]`: “אפשר לפתור כל משתנה אחד אם שלושת האחרים ידועים. סמנו את הנעלם, כתבו את הנוסחה המסודרת,” → “אפשר לחשב כל אחד מהמשתנים אם שלושת האחרים ידועים. סמנו את הנעלם, בודדו אותו בנוסחה,”. Rule 1 (פותרים את), and "rearranged formula".
7. `reading.sections[id=ideal-gas-equation].paragraphs[7]`: “אם יש בערך <bdi>1 mol</bdi> בערך ב־<bdi>25 L</bdi>” → “אם יש כ־<bdi>1 mol</bdi> בנפח של כ־<bdi>25 L</bdi>”. Doubled בערך.
8. `reading.sections[id=molar-mass-density].paragraphs[0]`: “היא צפיפות <bdi>(density)</bdi> מסה (<bdi>m/V</bdi>).” → “היא הצפיפות <bdi>(density)</bdi>, כלומר מסה ליחידת נפח (<bdi>m/V</bdi>).”. "mass density" left as two stacked nouns.
9. `reading.sections[id=molar-mass-density].paragraphs[1]`: “בתנאי אותו חדר, ובגלל זה מטף כיבוי עם <bdi>CO<sub>2</sub></bdi> יכול לדחוק חמצן מקרוב לרצפה.” → “באותו חדר, ובגלל זה מטף כיבוי עם <bdi>CO<sub>2</sub></bdi> יכול לדחוק את החמצן מהאזור שליד הרצפה.”. Awkward word order.
10. `reading.sections[id=molar-mass-density].paragraphs[3]`: “דירוג צפיפויות הוא אם כן פשוט דירוג ערכי <bdi>M</bdi>.” → “לכן דירוג לפי צפיפות הוא בעצם דירוג לפי <bdi>M</bdi>.”. Stiff.
11. `reading.sections[id=molar-mass-density].paragraphs[5]`: “חממו כדי להתאדות ולמלא את הבקבוק באדים” → “חממו עד שהנוזל מתאדה וממלא את הבקבוק באדים”. Subject mismatch (the reader does not evaporate).
12. `reading.sections[id=molar-mass-density].paragraphs[6]`: “<bdi>g/L</bdi> נפוץ ממשוואה זו עם <bdi>R = 0.082057</bdi>. אם הבעיה רוצה <bdi>g/mL</bdi>,” → “עם <bdi>R = 0.082057</bdi> המשוואה הזו נותנת בדרך כלל <bdi>g/L</bdi>. אם השאלה מבקשת <bdi>g/mL</bdi>,”. Calque word order; "the problem wants".
13. `reading.sections[id=dalton].paragraphs[5]`: “גז יבש פירושו שכבר הפחתתם אדי מים.” → “גז יבש פירושו שכבר החסרתם את לחץ אדי המים.”. Meaning: the vapor pressure is subtracted.
14. `reading.sections[id=dalton].paragraphs[6]`: “כשהברומטר <bdi>758 torr</bdi>.” → “כשהברומטר מראה <bdi>758 torr</bdi>.”. Missing verb.
15. `reading.sections[id=gas-stoichiometry].paragraphs[0]`: “עברו ליחס מולים והמירו” → “השתמשו ביחס המולים והמירו”. "go to the mole ratio".
16. `reading.sections[id=gas-stoichiometry].paragraphs[4]`: “מגיב מגביל <bdi>(limiting reagent)</bdi> עדיין חל.” → “גם כאן צריך למצוא את המגיב המגביל <bdi>(limiting reagent)</bdi>.”. "still applies" calque; a reagent does not "apply".
17. `questions.t7-q2.explanation`: “(עיקרון אבוגדרו <bdi>(Avogadro's law)</bdi>)” → “(חוק אבוגדרו <bdi>(Avogadro's law)</bdi>)”. Glossary and reading use חוק אבוגדרו.

### kinetic-molecular-theory-and-real-gases (התאוריה הקינטית של גזים וגזים ריאליים)

1. `reading.sections[id=kmt-postulates].paragraphs[9]`: “קרובים ביותר לאידאליים כשהם מדוללים וחמים.” → “קרובים ביותר לאידאליים כשהם דלילים וחמים.”. A dilute gas is גז דליל; מדולל belongs to solutions (and the glossary there is מיהול).
2. `reading.sections[id=kmt-postulates].paragraphs[10]`: “התנגשויות אלסטיות שומרות על האנרגיה הקינטית הכוללת של החלקיקים קבועה בקופסה סגורה ומבודדת.” → “בהתנגשויות אלסטיות האנרגיה הקינטית הכוללת של החלקיקים נשארת קבועה בקופסה סגורה ומבודדת.”. Broken construction (שומרות על ... קבועה).
3. `reading.sections[id=kmt-postulates].paragraphs[11]`: “צריכות לחץ נמוך כדי לעבוד נקי.” → “צריכות לחץ נמוך כדי לעבוד היטב.”. "work cleanly" calque.
4. `reading.sections[id=kmt-postulates].paragraphs[12]`: “אפשר לחלץ עבור גז אידאלי את” → “אפשר לגזור עבור גז אידאלי את”. "derive" = לגזור.
5. `reading.sections[id=kmt-postulates].paragraphs[12]`: “היא צפיפות <bdi>(density)</bdi> המסה.” → “היא הצפיפות <bdi>(density)</bdi>.”. "mass density" again (same pattern as the gases topic).
6. `reading.sections[id=kmt-postulates].why`: “והיא מצביעה על המקומות שבהם גזים ריאליים נכשלים:” → “והיא מראה איפה היא לא מתאימה לגזים ריאליים:”. Gases don't "fail"; the model does.
7. `reading.sections[id=speed-and-energy].paragraphs[3]`: “פורשת את מהירויות המולקולות.” → “מתארת את פיזור המהירויות של המולקולות.”. "spreads out" calque.
8. `reading.sections[id=graham].paragraphs[6]`: “הגז עם <bdi>M</bdi> גדולה יותר לוקח יותר זמן.” → “הגז עם <bdi>M</bdi> גדולה יותר צריך יותר זמן.”. "takes longer" calque.
9. `reading.sections[id=graham].paragraphs[7]`: “ואז פתרו. צמצמו את ההנחות על <bdi>T</bdi> ו־<bdi>P</bdi> זהות, שחוק גרהם כבר דורש.” → “ואז חשבו. ההנחה ש־<bdi>T</bdi> ו־<bdi>P</bdi> זהים כבר כלולה בחוק גרהם, ולכן הם לא מופיעים ביחס.”. The Hebrew is garbled (the English is unclear too, see section 4).
10. `reading.sections[id=real-gases].paragraphs[3]`: “מולקולות גדולות וניתנות לקיטוב יותר בדרך כלל בעלות <bdi>a</bdi> גדול יותר. מולקולות גדולות יותר בדרך כלל בעלות <bdi>b</bdi> גדול יותר.” → “למולקולות גדולות שקל יותר לקטב יש בדרך כלל <bdi>a</bdi> גדול יותר. למולקולות גדולות יותר יש בדרך כלל <bdi>b</bdi> גדול יותר.”. בעלות as a verb substitute is stiff.
11. `reading.sections[id=real-gases].paragraphs[5]`: “בעיות שנותנות <bdi>a</bdi> ו־<bdi>b</bdi> מצפות שתציבו בזהירות” → “בשאלות שנותנות <bdi>a</bdi> ו־<bdi>b</bdi> מצפים שתציבו בזהירות”. A problem does not "expect".
12. `reading.sections[id=real-gases].paragraphs[9]`: “כי <bdi>CO<sub>2</sub></bdi> ניתן לקיטוב יותר וחווה כוחות משיכה חזקים יותר.” → “כי קל יותר לקטב את <bdi>CO<sub>2</sub></bdi>, ולכן כוחות המשיכה בין המולקולות שלו חזקים יותר.”. "experiences" calque.
13. `reading.sections[id=real-gases].worked.title`: “מתי חוק הגזים האידאליים בטוח ביותר?” → “מתי אפשר לסמוך על חוק הגזים האידאליים?”. "safest" calque.
14. `reading.sections[id=kmt-postulates].paragraphs[3]`: “כלומר אין אובדן נטו של אנרגיה קינטית.” → “כלומר האנרגיה הקינטית <bdi>(kinetic energy)</bdi> הכוללת אינה אובדת.”. "net loss" calque; this is also the first use of kinetic energy (drop the bracket in p5; see next item).
15. `reading.sections[id=kmt-postulates].paragraphs[5]`: “האנרגיה הקינטית <bdi>(kinetic energy)</bdi> הממוצעת” → “האנרגיה הקינטית הממוצעת”. Pairs with the item above.

### thermochemistry-and-the-first-law (תרמוכימיה והחוק הראשון)

1. `reading.sections[id=first-law].paragraphs[5]`: “אבל הם פתוחים ללחץ קבוע.” → “אבל הם פתוחים לאוויר, ולכן הלחץ בהם קבוע.”. "open to constant pressure" read literally.
2. `reading.sections[id=first-law].workedExamples[0].steps[1]`: “המערכת הרוויחה <bdi>110 J</bdi> של אנרגיה פנימית.” → “האנרגיה הפנימית של המערכת עלתה ב־<bdi>110 J</bdi>.”. "gained" calque.
3. `reading.sections[id=enthalpy-calorimetry].paragraphs[2]`: “בתגובה מימית מדוללת,” → “בתמיסה מימית מהולה,”. One term (מיהול); a reaction is not dilute, the solution is.
4. `reading.sections[id=enthalpy-calorimetry].paragraphs[2]`: “לתמיסות מימיות מדוללות)” → “לתמיסות מימיות מהולות)”. Same.
5. `reading.sections[id=enthalpy-calorimetry].paragraphs[6]`: “דורש את התיקון <bdi>Δn<sub>g</sub> RT</bdi> כשמבקשים.” → “דורש את התיקון <bdi>Δn<sub>g</sub> RT</bdi>, כשהשאלה מבקשת זאת.”. Subjectless מבקשים.
6. `reading.sections[id=hess-formation].paragraphs[4]`: “לשלב תגובות שרפה או היווצרות” → “לשלב תגובות שריפה או היווצרות”. Spelling, the other 6 uses are שריפה.
7. `reading.sections[id=hess-formation].paragraphs[8]`: “ואז סדרו מחדש.” → “ואז חברו את השלבים.”. Rule 1 family (סידור מחדש).
8. `reading.sections[id=hess-formation].mistake.wrong`: “שכחו להפוך סימן כשהופכים תגובת היווצרות, או ערבוב בין ערכי” → “שוכחים להפוך את הסימן כשהופכים תגובת היווצרות, או מערבבים בין ערכי”. Mixed voice (past imperative-looking שכחו + noun); other mistake.wrong fields use present impersonal.
9. `reading.sections[id=hess-formation].mistake.whyWrong`: “מצב צבירה שגוי משתמש בשורה שגויה בטבלה.” → “מצב צבירה שגוי פירושו שורה שגויה בטבלה.”. A phase does not "use".
10. `reading.sections[id=hess-formation].mistake.correct`: “ישרו כל שלב או כל <bdi>ΔH<sub>f</sub>°</bdi> עם מצב הצבירה שלו,” → “התאימו כל שלב וכל <bdi>ΔH<sub>f</sub>°</bdi> למצב הצבירה הנכון,”. "align" calque.
11. `reading.sections[id=hess-formation].workedExamples[0].steps[4]`: “נשארים עם <bdi>C + ½ O<sub>2</sub> → CO</bdi>.” → “מה שנשאר: <bdi>C + ½ O<sub>2</sub> → CO</bdi>.”. Rule 3 (impersonal in a step) and "left with" calque.

### electrons-in-atoms-quantum-theory-and-or (אלקטרונים באטום: תורת הקוונטים ואורביטלים)

1. `reading.sections[id=light-energy].paragraphs[0]`: “אור נראה הוא פרוסה אחת של קרינה אלקטרומגנטית” → “אור נראה הוא תחום אחד של קרינה אלקטרומגנטית”. "slice" calque.
2. `reading.sections[id=light-energy].paragraphs[1]`: “פלאנק ואיינשטיין הראו” → “פלנק ואיינשטיין הראו”. Spelling; the same paragraph and the glossary have קבוע פלנק.
3. `reading.sections[id=light-energy].paragraphs[3]`: “אורך גל של אור נראה מצוטט לרוב ב־<bdi>nm</bdi>:” → “את אורך הגל של אור נראה מקובל לציין ב־<bdi>nm</bdi>:”. "is quoted" calque.
4. `reading.sections[id=bohr-hydrogen].paragraphs[0]`: “<bdi>n = 1, 2, 3, …</bdi> האנרגיה של רמה” → “<bdi>n = 1, 2, 3, …</bdi>. האנרגיה של רמה”. Missing full stop between two sentences.
5. `reading.sections[id=quantum-numbers].paragraphs[1]`: “ואת סולם האנרגיה הראשי.” → “ואת רמת האנרגיה העיקרית.”. "main energy scale" calque.
6. `reading.sections[id=orbital-shapes].paragraphs[1]`: “לאורביטל <bdi>p</bdi> יש שני אונות משני צדי הגרעין <bdi>(nucleus)</bdi> (דמבל).” → “לאורביטל <bdi>p</bdi> יש שתי אונות משני צדי הגרעין <bdi>(nucleus)</bdi> (צורת משקולת).”. Gender (אונה is feminine); דמבל is transliterated English.
7. `reading.sections[id=orbital-shapes].paragraphs[3]`: “סימני הסימן (<bdi>+/−</bdi>) על אונות האורביטל” → “הסימנים (<bdi>+/−</bdi>) על אונות האורביטל”. Doubled noun.

### electron-configurations-and-the-periodic (קונפיגורציה אלקטרונית והטבלה המחזורית)

1. `reading.sections[id=aufbau-pauli-hund].paragraphs[6]`: “פיזורם בין אורביטלים שונים (עם אותו ספין) שומר עליהם רחוקים יותר זה מזה בממוצע מאשר זיווגם באורביטל אחד.” → “כשהם מפוזרים באורביטלים שונים (עם אותו ספין), הם רחוקים יותר זה מזה בממוצע מאשר כשהם מזווגים באורביטל אחד.”. "keeps them farther apart" calque, noun-heavy.
2. `reading.sections[id=aufbau-pauli-hund].worked.steps[2]`: “אלקטרונים ששימשו עד כה: 4.” → “אלקטרונים שהוצבו עד כה: 4.”. Electrons are placed, not "used".
3. `reading.sections[id=aufbau-pauli-hund].worked.steps[5]`: “זה יעלה אנרגיית זיווג” → “זה דורש אנרגיית זיווג”. "would cost" read as "would raise".
4. `reading.sections[id=writing-configurations].paragraphs[6]`: “טיפ מקוצר:” → “בדיקה מהירה:”. "Condensed tip" (tip for the condensed notation) came out as "shortened tip".
5. `reading.sections[id=exceptions-cr-cu].paragraphs[5]`: “אבל העדיפות הראשונה שלכם היא <bdi>Cr</bdi> ו־<bdi>Cu</bdi>.” → “אבל את <bdi>Cr</bdi> ו־<bdi>Cu</bdi> צריך לדעת קודם כול.”. "first priority" calque.
6. `reading.sections[id=exceptions-cr-cu].worked.steps[3]`: “(בתווית הסופית מקובל לכתוב” → “(בתשובה הסופית מקובל לכתוב”. "final label" calque.
7. `reading.sections[id=ions-configurations].paragraphs[6]`: “תמיד בנו את היון מחדש מהאטום הניטרלי” → “תמיד התחילו מהאטום הניטרלי”. "rebuild" calque.

### periodic-trends-in-atomic-properties (מגמות מחזוריות בתכונות האטום)

1. `reading.sections[id=atomic-radius].paragraphs[1]`: “המשיכה החיובית נטו שחש אלקטרון ערכיות” → “המשיכה הכוללת שאלקטרון ערכיות מרגיש”. "net positive pull" calque.
2. `reading.sections[id=atomic-radius].paragraphs[5]`: “ולכן השוו דברים דומים כשאתם קוראים איור.” → “ולכן כשאתם קוראים איור, השוו רק רדיוסים מאותו סוג.”. "compare like with like" calque.
3. `reading.sections[id=ionization-energy].paragraphs[4]`: “מעידה שפרצתם לליבת גז אציל.” → “מעידה שהגעתם לאלקטרונים של ליבת הגז האציל.”. "broke into the core" calque.
4. `reading.sections[id=ionization-energy].paragraphs[5]`: “הסרת אלקטרונים עוקבים עולה תמיד יותר אנרגיה:” → “הסרה של כל אלקטרון נוסף דורשת תמיד יותר אנרגיה:”. עולה reads as "rises"; "successive electrons".
5. `reading.sections[id=ionization-energy].paragraphs[6]`: “ויותר פעמים יוצרות אניונים” → “ולעיתים קרובות יותר יוצרות אניונים”. "more often" calque.
6. `reading.sections[id=electron-affinity-magnetism].paragraphs[3]`: “קראו את מוסכמת הסימן בבעיה.” → “בדקו באיזו מוסכמת סימן השאלה משתמשת.”. "read the sign convention in the problem".
7. `reading.sections[id=electron-affinity-magnetism].paragraphs[5]`: “אטום <bdi>F</bdi> הקטן דוחס את הדחייה בין האלקטרונים למרחב צפוף כשהוא יוצר <bdi>F<sup>−</sup></bdi>. הפרט הזה אופציונלי למבחנים מוקדמים.” → “באטום <bdi>F</bdi> הקטן, האלקטרון הנוסף נכנס למרחב צפוף, ולכן הדחייה בין האלקטרונים ב־<bdi>F<sup>−</sup></bdi> חזקה במיוחד. את הפרט הזה לא צריך לבחינות הראשונות.”. "crams repulsion into a tight space" and "optional for early exams" calques.
8. `reading.sections[id=electron-affinity-magnetism].workedExamples[0].steps[2]`: “ואז מזווגים אחד, ולכן ארבעה בודדים.” → “ואז אלקטרון אחד מזדווג, ולכן ארבעה בודדים.”. Rule 3 (impersonal in a step).
9. `reading.sections[id=atomic-radius].paragraphs[1]`: “המשיכה הגרעינית החזקה יותר מנצחת,” → “המשיכה הגרעינית החזקה יותר גוברת,”. "wins" calque.
10. `reading.sections[id=atomic-radius].paragraphs[4]`: “מעריכים לעתים קרובות” → “מעריכים לעיתים קרובות”. Spelling consistency.
11. `reading.sections[id=ionic-radius].mistake.wrong`: “אבל הקיצור הזה נכשל כשהמטענים” → “אבל הקיצור הזה לא עובד כשהמטענים”. "fails" calque.

### chemical-bonding-i-lewis-structures-and- (קשר כימי א': מבני לואיס וצורת מולקולות)

1. `reading.sections[id=lewis-structures].paragraphs[0]`: “זה כלי חשבונאות שמראה איך אטומים חולקים אלקטרונים” → “זו דרך לספור אלקטרונים ולראות איך אטומים חולקים אלקטרונים”. "bookkeeping tool" calque (same family as מטען חשבונאי in the compounds topic).
2. `reading.sections[id=lewis-structures].paragraphs[7]`: “ותקנו למבנים טובים יותר לפי הצורך.” → “ואם צריך, שפרו את המבנה.”. Calque word order.
3. `reading.sections[id=lewis-structures].paragraphs[8]`: “ושומרים על סכום המטענים הפורמליים שווה למטען היון (או אפס למולקולה).” → “וסכום המטענים הפורמליים בהם שווה למטען היון (או לאפס במולקולה).”. Broken construction (שומרים על ... שווה).
4. `reading.sections[id=lewis-structures].paragraphs[10]`: “הסולם עולה לכיוון הפינה הימנית העליונה בטבלת הקבוצות הראשיות” → “האלקטרושליליות עולה לכיוון הפינה הימנית העליונה של הטבלה, בקבוצות הראשיות”. "the scale rises" calque.
5. `reading.sections[id=resonance-and-formal-charge].paragraphs[0]`: “המולקולה האמיתית היא היברידית של כולם.” → “המולקולה האמיתית היא היבריד תהודה של כולם.”. "hybrid" is a noun here; היברידית reads as an adjective.
6. `reading.sections[id=resonance-and-formal-charge].paragraphs[1]`: “קשרי ה־<bdi>O–O</bdi> האמיתיים שווים ובינוניים.” → “במולקולה האמיתית שני קשרי ה־<bdi>O–O</bdi> שווים, וביניים בין קשר יחיד לקשר כפול.”. בינוניים = mediocre/medium; English "intermediate".
7. `reading.sections[id=vsepr-shapes].paragraphs[4]`: “אם יש לה דיפול נקי <bdi>(dipole)</bdi> שאינו אפס.” → “אם יש לה דיפול <bdi>(dipole)</bdi> כולל שאינו אפס.”. "net dipole" calque.
8. `reading.sections[id=vsepr-shapes].why`: “לפני שפוגשים את ההיברידיזציה.” → “לפני שפוגשים את ההכלאה.”. One term: glossary and Bonding II use הכלאה.
9. `reading.sections[id=bond-enthalpies].paragraphs[4]`: “ההערכה מחמיצה אנתלפיות של מעבר פאזה. בכל זאת, בבעיות מבחן רבות ערכי הטבלה הם אלה שמבקשים מכם להשתמש בהם.” → “ההערכה לא כוללת את האנתלפיות של מעברי הפאזה. בכל זאת, בשאלות מבחן רבות מבקשים מכם להשתמש בערכי הטבלה.”. "misses" calque, inverted word order.
10. `questions.t13-q4.explanation`: “ודיפולי הקשר מצטרפים לדיפול נקי.” → “ודיפולי הקשר מצטרפים לדיפול כולל.”. "net dipole".
11. `reading.sections[id=lewis-structures].paragraphs[9]`: “יש לעתים קרובות” → “יש לעיתים קרובות”. Spelling consistency (note f).

### chemical-bonding-ii-hybridization-and-mo (קשר כימי ב': הכלאה ואורביטלים מולקולריים)

1. `reading.sections[id=hybridization].paragraphs[1]`: “(4 תחומים, טטראדר,” → “(4 תחומים, טטראהדר,”. Spelling: Bonding I and the rest of this file use טטראהדר־.
2. `reading.sections[id=hybridization].paragraphs[1]`: “(6 תחומים, אוקטאדר).” → “(6 תחומים, אוקטהדר).”. Same, Bonding I has אוקטהדרי.
3. `reading.sections[id=hybridization].paragraphs[4]`: “אם גאומטריית האלקטרונים טטראדרית,” → “אם גאומטריית האלקטרונים טטראהדרית,”. Same.
4. `reading.sections[id=hybridization].paragraphs[3]`: “מפת דוגמאות:” → “דוגמאות:”. "example map" calque.
5. `reading.sections[id=hybridization].paragraphs[6]`: “משתמשים במפה הזו כל הזמן.” → “משתמשים בהתאמה הזו כל הזמן.”. Follows the fix above.
6. `reading.sections[id=hybridization].paragraphs[7]`: “יש טיפולים מתקדמים שנמנעים מאורביטלי <bdi>d</bdi>.” → “יש תיאורים מתקדמים יותר שלא משתמשים באורביטלי <bdi>d</bdi>.”. "treatments" = טיפולים is a calque here.
7. `reading.sections[id=sigma-pi].paragraphs[4]`: “ומערכת <bdi>π</bdi> מפולגת שבתמונת לואיס פשוטה סופרים לעתים כ־3 קשרי <bdi>π</bdi> (התיאור האמיתי באורביטלים מולקולריים הוא מפולג סביב הטבעת).” → “ומערכת <bdi>π</bdi> לא ממוקמת, שבתמונת לואיס פשוטה סופרים לעיתים כ־3 קשרי <bdi>π</bdi> (בתיאור האמיתי, באורביטלים מולקולריים, אלקטרוני ה־<bdi>π</bdi> פרושים על פני כל הטבעת).”. מפולג means split/divided; delocalized = לא ממוקם. See glossary.
8. `reading.sections[id=sigma-pi].mistake.wrong`: “לספור קשר כפול כשני קשרי <bdi>σ</bdi>,” → “סופרים קשר כפול כשני קשרי <bdi>σ</bdi>,”. Other mistake.wrong fields use the present impersonal.
9. `reading.sections[id=mo-basics].paragraphs[6]`: “מנבאת אילו דו־אטומיות הן מה.” → “מנבאת אילו מולקולות דו־אטומיות פרמגנטיות ואילו דיאמגנטיות.”. "which diatomics are which" calque.
10. `reading.sections[id=mo-basics].paragraphs[7]`: “מבני לואיס מתקשים עם זה,” → “במבני לואיס קשה לתאר את זה,”. "struggle with" calque.
11. `reading.sections[id=mo-basics].why`: “שמבני לואיס אינם מראים בצורה נקייה,” → “שמבני לואיס אינם מראים בצורה ברורה,”. "cleanly" calque.
12. `reading.sections[id=mo-o2].heading`: “של <bdi>O<sub>2</sub></bdi> ומקורביו” → “של <bdi>O<sub>2</sub></bdi> והיונים הקרובים לו”. מקורביו = his cronies.
13. `reading.sections[id=mo-o2].paragraphs[1]`: “שבהם כל האלקטרונים מזווגים מחמיצים עובדה זו.” → “שבהם כל האלקטרונים מזווגים לא מראים את זה.”. "miss this" calque.
14. `reading.sections[id=mo-o2].paragraphs[7]`: “בדיקת כיתה:” → “הדגמה בכיתה:”. "Classroom check".
15. `questions.t14-q5.answer`: “אלקטרוני ה־<bdi>π</bdi> מפולגים על פני הטבעת כולה” → “אלקטרוני ה־<bdi>π</bdi> אינם ממוקמים, והם פרושים על פני הטבעת כולה”. Delocalized.

### light-matter-interaction-and-spectroscop (אינטראקציה של אור עם חומר ויסודות ספקטרוסקופיה)

1. `reading.sections[id=em-radiation].paragraphs[1]`: “כימאים רוצים לעתים קרובות אנרגיה למול:” → “כימאים משתמשים לעיתים קרובות באנרגיה למול:”. "chemists want" calque; לעיתים spelling.
2. `reading.sections[id=em-radiation].paragraphs[2]`: “פוטונים באינפרא־אדום עדינים יותר מפוטונים בתחום הנראה, ופוטונים באולטרה־סגול חזקים יותר.” → “לפוטונים באינפרא־אדום יש אנרגיה נמוכה יותר מלפוטונים בתחום הנראה, ולפוטונים באולטרה־סגול יש אנרגיה גבוהה יותר.”. "gentler/harsher" calque; a photon is not עדין or חזק.
3. `reading.sections[id=em-radiation].paragraphs[5]`: “פליטה היא הסיפור ההפוך:” → “פליטה היא התהליך ההפוך:”. "the reverse story" calque.
4. `reading.sections[id=em-radiation].paragraphs[6]`: “ומצומדות לסיבובים או להיפוך ספין בניסויים מיוחדים” → “ובניסויים מיוחדים הן מעוררות סיבובים או היפוך ספין”. מצומד is reserved for conjugation in this same topic.
5. `reading.sections[id=em-radiation].paragraphs[7]`: “הוא הטעות השקטה הקלאסית.” → “היא טעות קלאסית שקל לא לשים לב אליה.”. "the classic silent error" calque.
6. `reading.sections[id=em-radiation].why`: “נמנעים מאסונות ביחידות בהמשך.” → “נמנעים בהמשך מטעויות ביחידות.”. "unit disasters" calque.
7. `reading.sections[id=absorption-emission].paragraphs[2]`: “תמונת בוהר וריידברג עדיין מלמדת את ההרגל:” → “המודל של בוהר ונוסחת ריידברג מדגימים את הרעיון:”. "teaches the habit" calque.
8. `reading.sections[id=absorption-emission].paragraphs[2]`: “אותו הרגל, <bdi>ΔE ↔ λ</bdi>, ממשיך למולקולות עם פערי אורביטלים.” → “אותו קשר, <bdi>ΔE ↔ λ</bdi>, חל גם על מולקולות, עם פערים בין אורביטלים.”. Same.
9. `reading.sections[id=absorption-emission].paragraphs[3]`: “אילו פערים מותרים בחוזקה.” → “אילו מעברים מותרים ואילו מהם חזקים.”. "strongly allowed" calque.
10. `reading.sections[id=absorption-emission].paragraphs[4]`: “פסגות מסמנות את המעברים הפתוחים בתנאי הניסוי.” → “הפסגות מראות את המעברים שמתרחשים בתנאי הניסוי.”. "open transitions" calque.
11. `reading.sections[id=absorption-emission].paragraphs[5]`: “דעו איזו תמונה הבעיה מניחה.” → “בדקו באיזה סוג ספקטרום מדובר בשאלה.”. "problem assumes which picture".
12. `reading.sections[id=beer-lambert].paragraphs[2]`: “שבהן המין הבולע אינו מצטבר” → “שבהן המין הבולע אינו יוצר צברים”. EN "aggregate"; מצטבר = accumulates.
13. `reading.sections[id=beer-lambert].paragraphs[3]`: “הסחה של <bdi>λ<sub>max</sub></bdi> עצמו” → “הסטה של <bdi>λ<sub>max</sub></bdi> עצמו”. הסחה = distraction; shift = הסטה.
14. `reading.sections[id=beer-lambert].paragraphs[4]`: “ופתרו עבור <bdi>c</bdi>. התאימו תמיד את הממס הריק ואת אורך המסלול של הקובטה לכיול.” → “וחשבו את <bdi>c</bdi>. ודאו תמיד שהבלנק (הממס) ואורך המסלול של הקובטה זהים לאלה של הכיול.”. "solve for" calque; "match the blank" garbled.
15. `reading.sections[id=beer-lambert].why`: “מתרגמים לעתים קרובות” → “מתרגמים לעיתים קרובות”. Spelling consistency.
16. `reading.sections[id=beer-lambert].mistake.whyWrong`: “ממציא ריכוז מזויף.” → “נותן ריכוז שגוי.”. "invents a fake concentration" calque.
17. `reading.sections[id=beer-lambert].mistake.correct`: “לפני שפותרים עבור <bdi>c</bdi>.” → “לפני שמחשבים את <bdi>c</bdi>.”. "solve for".
18. `reading.sections[id=ir-wavenumbers].paragraphs[4]`: “השתמשו בו להתאמה לחומרים ידועים יותר מאשר כדי לשייך כל פסגה בפעם הראשונה.” → “השתמשו בו בעיקר כדי להשוות לספקטרום של חומר ידוע, ולא כדי לשייך כל פסגה כבר במעבר הראשון.”. Reads as "better-known substances".
19. `reading.sections[id=ir-wavenumbers].paragraphs[5]`: “גבוהות ולעתים רחבות” → “גבוהות ולעיתים רחבות”. Spelling.
20. `reading.sections[id=ir-wavenumbers].paragraphs[5]`: “נקודת בדיקה שימושית מאוד בבעיות באורגנית.” → “נקודת בדיקה שימושית מאוד בשאלות בכימיה אורגנית.”. בעיה; באורגנית is slang.
21. `reading.sections[id=ir-wavenumbers].paragraphs[6]`: “מורידה מתיחה שהשתתף בה אותו <bdi>H</bdi>,” → “מורידה את מספר הגל של מתיחה שבה משתתף אותו <bdi>H</bdi>,”. Tense and missing object.
22. `reading.sections[id=ir-wavenumbers].worked.steps[2]`: “פוטוני <bdi>IR</bdi> רכים בהרבה” → “האנרגיה של פוטוני <bdi>IR</bdi> נמוכה בהרבה”. "softer" calque.
23. `reading.sections[id=conjugation-color].paragraphs[0]`: “(הסחה לאדום)” → “(הסטה לאדום)”. Red shift = הסטה לאדום.

### intermolecular-forces-and-phases (כוחות בין־מולקולריים ומצבי צבירה)

1. `reading.sections[id=imf-types].paragraphs[1]`: “ענני אלקטרונים גדולים יותר וניתנים לקיטוב רב יותר <bdi>(polarizability)</bdi> נותנים פיזור חזק יותר. גם שטח מגע ארוך יותר” → “ענני אלקטרונים גדולים יותר, שיש להם יכולת להתקטב <bdi>(polarizability)</bdi> גבוהה יותר, נותנים פיזור חזק יותר. גם שטח מגע גדול יותר”. Glossary term יכולת להתקטב (already used in p7); a surface area is not ארוך.
2. `reading.sections[id=imf-types].paragraphs[6]`: “דומה מתמוסס בדומה.” → “דומה ממיס דומה.”. The standard Hebrew wording of "like dissolves like".
3. `reading.sections[id=imf-types].paragraphs[9]`: “מתכון מהיר לדירוג: (1) שריגים יוניים מנצחים כוחות בין־מולקולריים בנקודות היתוך. (2) בין מולקולות, קשר מימן מנצח דיפול־דיפול רגיל. (3) דיפול־דיפול מנצח פיזור רק כשהמסות דומות. (4) כשנשאר רק פיזור, המולקולה הגדולה והפחות קומפקטית מנצחת.” → “סדר עבודה מהיר לדירוג: (1) בנקודות היתוך, שריגים יוניים גוברים על כוחות בין־מולקולריים. (2) בין מולקולות, קשר מימן גובר על דיפול־דיפול רגיל. (3) דיפול־דיפול גובר על פיזור רק כשהמסות דומות. (4) כשנשאר רק פיזור, למולקולה הגדולה והפחות קומפקטית יש נקודת רתיחה גבוהה יותר.”. "recipe" and "beats/wins" calques.
4. `reading.sections[id=shape-and-dispersion].paragraphs[2]`: “פנטאן רותח גבוה יותר מניאופנטאן” → “פנטאן רותח בטמפרטורה גבוהה יותר מניאופנטאן”. "boils higher" calque.
5. `reading.sections[id=shape-and-dispersion].paragraphs[5]`: “אלכוהולים רותחים גבוה יותר מאתרים” → “לאלכוהולים נקודת רתיחה גבוהה יותר מלאתרים”. Same.
6. `reading.sections[id=shape-and-dispersion].worked.title`: “למה פנטאן רותח גבוה יותר מניאופנטאן” → “למה נקודת הרתיחה של פנטאן גבוהה מזו של ניאופנטאן”. Same.
7. `reading.sections[id=shape-and-dispersion].paragraphs[6]`: “מוצקים רשתיים ומתכות אינם סיפור של כוחות בין־מולקולריים. יהלום וקוורץ נמסים בטמפרטורה גבוהה” → “במוצקים רשתיים ובמתכות לא מדובר בכוחות בין־מולקולריים. יהלום וקוורץ ניתכים בטמפרטורה גבוהה”. "not a story of" calque; melt = ניתך (נמס reads as dissolves; text elsewhere uses היתוך).
8. `reading.sections[id=shape-and-dispersion].mistake.wrong`: “לדרג נקודות רתיחה רק לפי מסה מולרית ולהתעלם מקשר מימן או מצורה (למשל לחזות ש־” → “מדרגים נקודות רתיחה רק לפי מסה מולרית ומתעלמים מקשר מימן או מצורה (למשל חוזים ש־”. Mistake.wrong voice: present impersonal.
9. `reading.sections[id=vapor-pressure-clausius].paragraphs[1]`: “יותר מולקולות הן בעלות די אנרגיה כדי לברוח.” → “ליותר מולקולות יש מספיק אנרגיה כדי לברוח.”. Stiff construction.
10. `reading.sections[id=vapor-pressure-clausius].paragraphs[3]`: “נקודת רתיחה נורמלית משתמשת ב־<bdi>1 atm</bdi>” → “נקודת רתיחה נורמלית מוגדרת ב־<bdi>1 atm</bdi>”. A boiling point does not "use".
11. `reading.sections[id=vapor-pressure-clausius].worked.steps[6]`: “= −0.361</bdi>..” → “= −0.361</bdi>.”. Double period.
12. `reading.sections[id=phases].paragraphs[0]`: “קירור הופך את השינויים האלה.” → “קירור גורם לשינויים ההפוכים.”. הופך is ambiguous (turns into / reverses).
13. `reading.sections[id=phases].paragraphs[3]`: “מתאדה ב־<bdi>1 atm</bdi>” → “ממריא ב־<bdi>1 atm</bdi>”. EN "sublimes"; המראה is used in the same paragraph.
14. `reading.sections[id=phases].paragraphs[6]`: “ומסביר את ההמסה בלחץ מתחת לגלשני קרח בסיפור הקלאסי,” → “ומסביר, בהסבר הקלאסי, את ההיתוך בלחץ מתחת ללהבי המחליקיים,”. גלשני קרח is not ice skates; melt = היתוך.
15. `reading.sections[id=phases].worked.steps[3]`: “חימום המוצק יכול להמריא ישירות לגז בלי נוזל יציב.” → “בחימום, המוצק יכול להמריא ישירות לגז בלי נוזל יציב.”. Heating does not sublime; the solid does.
16. `reading.sections[id=phases].workedExamples[0].steps[3]`: “קירור בהתאדות מאידוי של מים.” → “קירור על ידי התאדות של מים.”. Redundant (התאדות + אידוי).
17. `questions.t16-q5.answer`: “הוא מומריא ישירות לגז” → “הוא ממריא ישירות לגז”. Wrong verb form (hof'al).
18. `questions.t16-q3.q`: “<bdi>(Clausius-Clapeyron equation)</bdi>” → “<bdi>(Clausius–Clapeyron equation)</bdi>”. The glossary and the reading (vapor-pressure-clausius p2) use an en dash; this card uses a hyphen.

### entropy-gibbs-energy-and-spontaneity (אנטרופיה, אנרגיה חופשית וספונטניות)

1. `reading.sections[id=entropy].paragraphs[1]`: “המסה של מוצק או נוזל בממס מעלה בדרך כלל את האנטרופיה, והמסה של גז בנוזל” → “המסת מוצק או נוזל בממס מעלה בדרך כלל את האנטרופיה, והמסת גז בנוזל”. המסה של reads as "the mass of"; the construct form is unambiguous.
2. `reading.sections[id=entropy].paragraphs[2]`: “גם מעברי מופע ומורכבות” → “גם מעברי פאזה ומורכבות”. Glossary phase = פאזה (used in all other topics).
3. `reading.sections[id=entropy].paragraphs[6]`: “כשהחום הזה הוא ההחלפה היחידה,” → “כשזה חילוף האנרגיה היחיד עם הסביבה,”. "the only exchange" calque.
4. `reading.sections[id=entropy].paragraphs[10]`: “ללא מעבר מופע,” → “ללא מעבר פאזה,”. Phase = פאזה.
5. `reading.sections[id=entropy].paragraphs[11]`: “בלי שום כימיה.” → “בלי שום תגובה כימית.”. "without any chemistry" calque.
6. `reading.sections[id=entropy].paragraphs[13]`: “ושל מעברי המופע” → “ושל מעברי הפאזה”. Phase = פאזה.
7. `reading.sections[id=entropy].workedExamples[1].title`: “המסה של <bdi>NaCl(s)</bdi> במים” → “המסת <bdi>NaCl(s)</bdi> במים”. המסה/מסה ambiguity.
8. `reading.sections[id=gibbs].paragraphs[5]`: “תערובות אמיתיות משתמשות ב־” → “בתערובות אמיתיות משתמשים ב־”. Mixtures don't "use".
9. `reading.sections[id=gibbs].paragraphs[6]`: “מעברי מופע בנקודת הרתיחה הנורמלית או בנקודת ההתכה הנורמלית נמצאים בשיווי משקל: <bdi>ΔG = 0</bdi> ו־<bdi>ΔH = TΔS</bdi> עבור מעבר המופע ההפיך.” → “מעברי פאזה בנקודת הרתיחה הנורמלית או בנקודת ההיתוך הנורמלית נמצאים בשיווי משקל: <bdi>ΔG = 0</bdi> ו־<bdi>ΔH = TΔS</bdi> עבור מעבר הפאזה ההפיך.”. Phase = פאזה; היתוך everywhere else.
10. `reading.sections[id=gibbs].paragraphs[8]`: “בבעיות ביולוגיה וחומרים שואלים לעיתים” → “בשאלות בביולוגיה ובמדע החומרים שואלים לעיתים”. בעיה; "materials" needs a noun.
11. `reading.sections[id=gibbs].paragraphs[10]`: “הטמפרטורה היא המתג. למדו את טבלת ארבעת המקרים עד שתוכלו לשחזר אותה בלי הערות.” → “הטמפרטורה מכריעה. למדו את טבלת ארבעת המקרים עד שתוכלו לשחזר אותה בלי להציץ בסיכום.”. "the switch" calque; הערות is ambiguous.
12. `reading.sections[id=gibbs].paragraphs[11]`: “הלוגיקה של הסימן קורסת.” → “מקבלים סימן שגוי.”. "sign logic collapses" calque.
13. `reading.sections[id=gibbs].paragraphs[12]`: “שלב לא ספונטני אפשר למשוך קדימה כשהוא מחובר לשלב ספונטני מאוד” → “אפשר לקדם שלב לא ספונטני כשמצמדים אותו לשלב ספונטני מאוד”. "pulled forward" calque; ties to מצומדים in the same sentence.
14. `reading.sections[id=gibbs].mistake.wrong`: “ערבוב של ג׳אול וקילו־ג׳אול ב־” → “מערבבים ג׳אול וקילו־ג׳אול ב־”. Mistake.wrong voice.
15. `reading.sections[id=dg-k].paragraphs[3]`: “שינוי צנוע ב־” → “שינוי קטן ב־”. "modest" calque.
16. `reading.sections[id=dg-k].paragraphs[6]`: “פתרון עבור <bdi>K</bdi>:” → “חישוב <bdi>K</bdi>:”. "solve for" calque.
17. `reading.sections[id=dg-k].paragraphs[6]`: “פתרון עבור <bdi>ΔG°</bdi>:” → “חישוב <bdi>ΔG°</bdi>:”. Same.
18. `reading.sections[id=dg-k].paragraphs[7]`: “(לה שטלייה)” → “(עקרון לה שטלייה)”. A bare name in parentheses is unclear.
19. `reading.sections[id=check-entropy].check.items[3].a`: “אפס, המופעים נמצאים” → “אפס. שתי הפאזות נמצאות”. Phase = פאזה; comma splice.

### principles-of-chemical-equilibrium (עקרונות שיווי משקל כימי)

1. `reading.sections[id=k-and-q].paragraphs[4]`: “משנים את המהירות שבה מגיעים לשיווי משקל או את המקום לאורך המסלול,” → “משנים את המהירות שבה מגיעים לשיווי משקל או את הנקודה שבה המערכת נמצאת בדרך אליו,”. "position along the path" calque, unclear.
2. `reading.sections[id=k-and-q].paragraphs[8]`: “יוצר טעויות שקטות.” → “גורם לטעויות שקשה לזהות.”. "silent errors" calque.
3. `reading.sections[id=k-and-q].paragraphs[11]`: “ההשוואה האחת הזו מונעת את רוב הניחושים.” → “ההשוואה הפשוטה הזו חוסכת את רוב הניחושים.”. "that one comparison" calque.
4. `reading.sections[id=k-and-q].worked.steps[3]`: “התגובה נטו מתקדמת בכיוון ההפוך” → “התגובה מתקדמת בכיוון ההפוך”. "net" calque (see note b).
5. `reading.sections[id=ice-tables].paragraphs[1]`: “ופתרו עבור <bdi>x</bdi>.” → “ומצאו את <bdi>x</bdi>.”. "solve for" calque.
6. `reading.sections[id=ice-tables].paragraphs[3]`: “ביחידה ש־<bdi>K<sub>p</sub></bdi> מצפה לה.” → “ביחידה שבה נתון <bdi>K<sub>p</sub></bdi>.”. "K_p expects" calque.
7. `reading.sections[id=le-chatelier].paragraphs[0]`: “התגובה נטו נעה כך שהיא מקזזת חלקית את ההפרעה.” → “המערכת נעה בכיוון שמקזז חלקית את ההפרעה.”. "net reaction".
8. `reading.sections[id=le-chatelier].paragraphs[7]`: “זה עקרון לה שטלייה בצורה הנדסית.” → “זה יישום הנדסי של עקרון לה שטלייה.”. Calque.
9. `reading.sections[id=le-chatelier].paragraphs[8]`: “כדי לנעול את ההמרה,” → “כדי לשמר את ההמרה,”. "lock in" calque.
10. `reading.sections[id=le-chatelier].paragraphs[9]`: “הפרעות של נפח ולחץ משנות רק כש־” → “הפרעות של נפח ולחץ משפיעות רק כש־”. משנות needs an object.
11. `reading.sections[id=le-chatelier].paragraphs[10]`: “פירושו שהתגובה נטו ההפוכה יוצרת יותר מגיבים” → “פירושו שהתגובה ההפוכה גוברת ויוצרת יותר מגיבים”. "net".
12. `reading.sections[id=check-equil].check.items[0].q`: “לאיזה כיוון התגובה נטו מתקדמת?” → “לאיזה כיוון התגובה מתקדמת?”. "net".

### acids-and-bases (חומצות ובסיסים)

1. `reading.sections[id=bronsted].paragraphs[8]`: “טעויות במלאי המינים” → “טעויות ברשימת המינים”. "inventory" calque.
2. `reading.sections[id=bronsted].paragraphs[9]`: “התפקיד שמנצח תלוי” → “התפקיד הדומיננטי תלוי”. "wins" calque.
3. `reading.sections[id=bronsted].why`: “זוגות צמודים וניהול ערכי <bdi>K<sub>a</sub></bdi> ו־<bdi>K<sub>b</sub></bdi> הם עמוד השדרה של כל בעיית” → “זוגות צמודים והחישוב עם ערכי <bdi>K<sub>a</sub></bdi> ו־<bdi>K<sub>b</sub></bdi> הם עמוד השדרה של כל שאלת”. "bookkeeping" calque; בעיה.
4. `reading.sections[id=ph-strong].paragraphs[2]`: “והידרוקסידים של קבוצה 2 הכבדים” → “וההידרוקסידים של המתכות הכבדות בקבוצה 2”. Word order: הכבדים attaches to קבוצה.
5. `reading.sections[id=ph-strong].paragraphs[3]`: “ואז תרומת המים משנה.” → “ואז אי אפשר להזניח את תרומת המים.”. "matters" = משנה is slang and ambiguous (changes).
6. `reading.sections[id=weak-acids].paragraphs[9]`: “נראית כמו בפרק שיווי המשקל:” → “נראית כמו בנושא שיווי המשקל:”. פרק is the UI label for a section (פרק N); a topic is נושא.
7. `reading.sections[id=weak-acids].paragraphs[10]`: “אם הקירוב נכשל” → “אם הקירוב לא תקף”. "fails" calque.
8. `reading.sections[id=weak-acids].paragraphs[12]`: “תמיסות חוצצות <bdi>(buffer)</bdi> (הנושא הבא) מערבבות במכוון” → “בתמיסות חוצצות <bdi>(buffer)</bdi> (הנושא הבא) מערבבים במכוון”. Solutions don't mix themselves.
9. `reading.sections[id=weak-acids].paragraphs[12]`: “הן החימום לקראת זה.” → “הן הכנה לנושא הזה.”. "warm-up" calque.
10. `reading.sections[id=weak-acids].workedExamples[1].steps[1]`: “הוא הצמוד של” → “הוא הבסיס הצמוד של”. "the conjugate" needs its noun in Hebrew.
11. `reading.sections[id=weak-acids].mistake.wrong`: “שימוש ב־<bdi>[H<sup>+</sup>] = K<sub>a</sub></bdi> עבור חומצה חלשה, או התייחסות לחומצה חלשה כאל חזקה” → “משתמשים ב־<bdi>[H<sup>+</sup>] = K<sub>a</sub></bdi> עבור חומצה חלשה, או מתייחסים לחומצה חלשה כאל חזקה”. Mistake.wrong voice.

### buffers-indicators-and-titration-curves (תמיסות חוצצות, מחוונים ועקומות טיטרציה)

1. `reading.sections[id=buffers-hh].paragraphs[0]`: “המתכון הרגיל הוא” → “ההרכב הרגיל הוא”. "recipe" calque.
2. `reading.sections[id=buffers-hh].paragraphs[7]`: “והקיבולת קורסת.” → “וקיבולת החציצה יורדת מאוד.”. "collapses" calque.
3. `reading.sections[id=buffers-hh].paragraphs[10]`: “הקירוב נכשל כש־” → “הקירוב לא תקף כש־”. "fails" calque.
4. `reading.sections[id=buffers-hh].paragraphs[11]`: “תמיסות חוצצות של אמוניה/אמוניום משתמשות ב־” → “בתמיסות חוצצות של אמוניה/אמוניום משתמשים ב־”. Solutions don't "use".
5. `reading.sections[id=buffers-hh].paragraphs[11]`: “או עוברות דרך” → “או עוברים דרך”. Follows the fix above.
6. `reading.sections[id=buffers-hh].workedExamples[1].steps[2]`: “מתכון אחד:” → “הרכב אפשרי אחד:”. "recipe".
7. `reading.sections[id=buffer-stress].paragraphs[0]`: “התייחסו לחומצה החזקה או לבסיס החזק כמגיבים באופן מלא קודם עם הרכיב המנוגד של התמיסה החוצצת.” → “הניחו קודם שהחומצה החזקה או הבסיס החזק מגיבים באופן מלא עם הרכיב המנוגד של התמיסה החוצצת.”. Word order: קודם is misplaced.
8. `reading.sections[id=buffer-stress].paragraphs[2]`: “והתמיסה החוצצת נשברת.” → “וקיבולת החציצה נגמרת.”. "the buffer breaks" calque.
9. `reading.sections[id=buffer-stress].paragraphs[7]`: “הוא הדרך שבה תוכננו הבקבוקים האלה.” → “הוא הדרך שבה מתכננים תמיסות כאלה.”. "bottles were designed" calque.
10. `reading.sections[id=buffer-stress].paragraphs[8]`: “הוא בדיוק סיפור הסטויכיומטריה הזה שחוזר” → “הוא בדיוק חישוב הסטויכיומטריה הזה, שחוזר”. "story" calque.
11. `reading.sections[id=buffer-stress].workedExamples[1].title`: “שבירת תמיסה חוצצת בעזרת עודף בסיס” → “מיצוי קיבולת החציצה בעזרת עודף בסיס”. "breaking a buffer".
12. `reading.sections[id=buffer-stress].mistake.wrong`: “הצבת ריכוז הבסיס החזק” → “מציבים את ריכוז הבסיס החזק”. Mistake.wrong voice.
13. `reading.sections[id=buffer-stress].mistake.whyWrong`: “בין החומצה החלשה לצמוד שלה” → “בין החומצה החלשה לבסיס הצמוד שלה”. "the conjugate" needs its noun.
14. `reading.sections[id=buffer-stress].mistake.correct`: “הגיבו קודם באופן מלא,” → “חשבו קודם את התגובה המלאה,”. הגיבו is "you react".
15. `reading.sections[id=titration-curves].paragraphs[2]`: “הקפיצה החדה ממורכזת סביב <bdi>7</bdi>.” → “מרכז הקפיצה החדה הוא סביב <bdi>7</bdi>.”. ממורכז is jargon calque.
16. `reading.sections[id=titration-curves].paragraphs[4]`: “עם שינוי צבע חי ליד” → “שמשנה צבע באופן בולט ליד”. "vivid" calque.
17. `reading.sections[id=titration-curves].paragraphs[9]`: “ממורכז ליד” → “שמרכזו ליד”. Same as p2.
18. `reading.sections[id=titration-curves].paragraphs[10]`: “עקומות של חומצה חלשה בררניות יותר.” → “בטיטרציה של חומצה חלשה הבחירה מוגבלת יותר.”. Curves are not "picky".
19. `reading.sections[id=titration-curves].workedExamples[0].title`: “שרטוט ה־<bdi>pH</bdi> בשקילות” → “ה־<bdi>pH</bdi> בנקודת השקילות”. The steps compute a number; nothing is drawn.
20. `reading.sections[id=titration-curves].workedExamples[1].steps[2]`: “יתהפך מוקדם מדי” → “ישנה צבע מוקדם מדי”. "flip" calque.
21. `reading.sections[id=titration-curves].workedExamples[2].steps[3]`: “ומשוואת הנדרסון־הסלבך משתלטת.” → “ומשוואת הנדרסון־הסלבך תקפה.”. "takes over" calque.
22. `questions.t20-q5.q`: “מומס נתרן אצטט בתמיסה של חומצה אצטית.” → “ממיסים נתרן אצטט בתמיסה של חומצה אצטית.”. מומס reads as the noun "solute".

### solubility-precipitation-and-complex-ion (מסיסות, שיקוע ויונים קומפלקסיים)

1. `reading.sections[id=ksp].paragraphs[5]`: “השוואה ישירה של מספרי <bdi>K<sub>sp</sub></bdi> מדרגת מסיסות רק כשלמלחים” → “אפשר לדרג מסיסות בהשוואה ישירה של ערכי <bdi>K<sub>sp</sub></bdi> רק כשלמלחים”. A comparison does not rank.
2. `reading.sections[id=ksp].paragraphs[7]`: “היא הסימן הבטוח לרוויה.” → “היא הסימן הוודאי לרוויה.”. "sure sign" calque.
3. `reading.sections[id=ksp].paragraphs[10]`: “זו אותה משפחת אלגברה כמו של” → “זה אותו סוג חישוב כמו של”. "algebra family" calque.
4. `reading.sections[id=ksp].paragraphs[13]`: “יכולה לגרום להפרשת מוצק פתאומית.” → “יכולה לגרום לשקיעה פתאומית של מוצק.”. הפרשה = secretion.
5. `reading.sections[id=precipitate-q].paragraphs[4]`: “ריכוז כל יון נעשה חצי” → “ריכוז כל יון יורד בחצי”. "becomes half" calque.
6. `reading.sections[id=precipitate-q].paragraphs[7]`: “ריכוזי יון סולפיד שנשלטים על ידי <bdi>pH</bdi> יכולים להפריד” → “כשמכוונים את ריכוז יון הסולפיד בעזרת ה־<bdi>pH</bdi>, אפשר להפריד”. Concentrations can't separate anything.
7. `reading.sections[id=precipitate-q].paragraphs[11]`: “אם ההנחה הזו נכשלת” → “אם ההנחה הזו לא מתקיימת”. "fails" calque.
8. `reading.sections[id=precipitate-q].workedExamples[1].steps[2]`: “ו־<bdi>Q</bdi> יחצה את <bdi>K<sub>sp</sub></bdi>.” → “ו־<bdi>Q</bdi> יעלה מעל <bdi>K<sub>sp</sub></bdi>.”. "cross" calque.
9. `reading.sections[id=precipitate-q].mistake.wrong`: “שימוש בריכוזי תמיסות האב לפני הערבוב בחישוב <bdi>Q</bdi>.” → “משתמשים בריכוזי תמיסות האב שלפני הערבוב כדי לחשב את <bdi>Q</bdi>.”. Mistake.wrong voice.
10. `reading.sections[id=precipitate-q].mistake.whyWrong`: “ערבוב מדלל כל יון. <bdi>Q</bdi> משתמש בריכוזים בתמיסה המשולבת.” → “הערבוב מהל כל יון. ב־<bdi>Q</bdi> משתמשים בריכוזים בתמיסה המעורבת.”. One dilution term (מיהול); Q doesn't "use"; המשולבת calque.
11. `reading.sections[id=precipitate-q].mistake.correct`: “מהלו קודם בעזרת” → “חשבו קודם את המיהול בעזרת”. The student calculates; nothing is physically diluted.
12. `reading.sections[id=complex-ions].paragraphs[2]`: “כי <bdi>Ag<sup>+</sup></bdi> חופשי נמשך אל” → “כי <bdi>Ag<sup>+</sup></bdi> חופשי נקשר ויוצר את”. "pulled into" calque.
13. `reading.sections[id=complex-ions].paragraphs[3]`: “המסה כוללת של <bdi>AgCl</bdi> ב־<bdi>NH<sub>3</sub></bdi> משלבת את <bdi>K<sub>sp</sub></bdi> ואת <bdi>K<sub>f</sub></bdi>. קבוע שיווי המשקל נטו הוא” → “בהמסה הכוללת של <bdi>AgCl</bdi> ב־<bdi>NH<sub>3</sub></bdi> משתלבים <bdi>K<sub>sp</sub></bdi> ו־<bdi>K<sub>f</sub></bdi>. קבוע שיווי המשקל הכולל הוא”. המסה/מסה ambiguity; "net".
14. `reading.sections[id=complex-ions].paragraphs[4]`: “מספר אטומי התורם של הליגנדים” → “מספר האטומים התורמים של הליגנדים”. Wrong construct.
15. `reading.sections[id=complex-ions].paragraphs[7]`: “המסה של הידרוקסידים אמפוטריים” → “המסת הידרוקסידים אמפוטריים”. המסה/מסה ambiguity.
16. `reading.sections[id=complex-ions].paragraphs[8]`: “כתבו ערכי <bdi>K<sub>f</sub></bdi> מדורגים כשבעיה נותנת אותם.” → “השתמשו בערכי <bdi>K<sub>f</sub></bdi> מדורגים כשהם נתונים בשאלה.”. Calque; בעיה.
17. `reading.sections[id=complex-ions].worked.title`: “<bdi>K</bdi> נטו להמסת” → “<bdi>K</bdi> הכולל להמסת”. "net".
18. `reading.sections[id=complex-ions].worked.steps[2]`: “חברו:” → “חברו את שתי המשוואות:”. Missing object.
19. `reading.sections[id=complex-ions].workedExamples[1].steps[2]`: “עד שהליגנדים נעשים נדירים.” → “עד שרוב הליגנד נצרך.”. "ligands become scarce" calque.
20. `questions.t21-q5.explanation`: “עם קבוע היווצרות גדול <bdi>(formation constant)</bdi>,” → “עם קבוע היווצרות <bdi>(formation constant)</bdi> גדול,”. The bracket belongs right after the term, before the adjective.

### electrochemistry (אלקטרוכימיה)

1. `reading.sections[id=galvanic].paragraphs[10]`: “ברישום בקווים האנודה נמצאת משמאל בהסכמה.” → “בסימון התא נהוג לכתוב את האנודה משמאל.”. "line notation… by convention" calque; p2 already calls it סימון התא.
2. `reading.sections[id=galvanic].paragraphs[12]`: “<bdi>Cu</bdi> שמשקיעה על הקתודה,” → “<bdi>Cu</bdi> ששוקעת על הקתודה,”. Intransitive משקיעה reads as "invests".
3. `reading.sections[id=galvanic].why`: “הם כרטיס הכניסה לבעיות של” → “הם הבסיס לשאלות על”. "entry ticket" calque; בעיה.
4. `reading.sections[id=galvanic].workedExamples[1].steps[2]`: “איזנו אלקטרונים:” → “איזנו את מספר האלקטרונים:”. Missing noun.
5. `reading.sections[id=thermo-links].paragraphs[4]`: “״הולכות עד הסוף״” → ““הולכות עד הסוף””. Quote style (see note).
6. `reading.sections[id=thermo-links].paragraphs[9]`: “תיקוני נרנסט אינם בגדר רשות.” → “אי אפשר לוותר על תיקון נרנסט.”. Stiff register.
7. `reading.sections[id=thermo-links].mistake.wrong`: “הכפלת <bdi>E°</bdi> ב־<bdi>n</bdi>” → “מכפילים את <bdi>E°</bdi> ב־<bdi>n</bdi>”. Mistake.wrong voice.
8. `reading.sections[id=thermo-links].mistake.whyWrong`: “ולגורם של נרנסט, ולא כמכפיל של הפוטנציאל שבטבלה עצמו.” → “ולגורם שבמשוואת נרנסט, ואינו מכפיל את הפוטנציאל שבטבלה.”. Broken parallel (שייך ל… ולא כ…).
9. `reading.sections[id=nernst-faraday].paragraphs[4]`: “שונים מהמקרה הגלווני באופן שימושי, ולכן עקבו” → “שונים מאלה שבתא הגלווני, ולכן עקבו”. "in useful ways" calque.
10. `reading.sections[id=nernst-faraday].paragraphs[6]`: “לכל מול של <bdi>Cu</bdi> שמשקיע.” → “לכל מול של <bdi>Cu</bdi> ששוקע.”. Intransitive deposit.
11. `reading.sections[id=nernst-faraday].paragraphs[11]`: “זו סטויכיומטריה בתוספת גאומטריה, שעדיין מונעת על ידי חוק פאראדיי.” → “זו סטויכיומטריה בתוספת גאומטריה, ובבסיסה עדיין חוק פאראדיי.”. "driven by" calque.
12. `reading.sections[id=nernst-faraday].paragraphs[12]`: “ערבוב דקות עם אמפרים הוא שגיאת יחידות שקטה שהורסת חישובי פאראדיי.” → “שימוש בדקות במקום בשניות הוא טעות יחידות נפוצה שקל לפספס, והיא הורסת חישובי פאראדיי.”. "silent error" calque.
13. `questions.t22-q5.answer`: “שומר על ניטרליות חשמלית בשני התאים” → “שומר על ניטרליות חשמלית בשני חצאי התא”. There is one cell with two half-cells (the explanation says חצי תא).
14. `reading.sections[id=nernst-faraday].workedExamples[2].steps[4]`: “מתמוססת בחצי התא המדולל ומשקיעה בחצי התא המרוכז.” → “מתמוססת בחצי התא המהול ושוקעת בחצי התא המרוכז.”. One dilution term (מהול); intransitive deposit = שוקעת.

### chemical-kinetics (קינטיקה כימית)

1. `reading.sections[id=rate-laws].paragraphs[4]`: “שתגובות הפוכות מתחילות לשחק תפקיד.” → “שתגובות הפוכות מתחילות להשפיע.”. "start to play a role" calque.
2. `reading.sections[id=rate-laws].paragraphs[8]`: “שיטות הקצבים ההתחלתיים נמנעות מהסיבוך הזה בכך שהן קוראות את תחילת כל ניסוי.” → “שיטת הקצבים ההתחלתיים עוקפת את הסיבוך הזה, כי מודדים בה רק את תחילת כל ניסוי.”. A method doesn't "read"; singular matches the bracketed term in p3.
3. `reading.sections[id=rate-laws].paragraphs[9]`: “אמירה “הקצב” בלי לקשור אותו למין מסוים עלולה להיות דו־משמעית” → “אם כותבים “הקצב” בלי לציין לאיזה מין הכוונה, זה עלול להיות דו־משמעי”. Broken construction.
4. `reading.sections[id=rate-laws].why`: “ובאיזה חוק אינטגרלי להשתמש.” → “ואיזה חוק אינטגרלי מתאים.”. Dangling: the orders don't "show which law to use".
5. `reading.sections[id=integrated].paragraphs[9]`: “המתמטיקה זהה, דעיכה מעריכית.” → “המתמטיקה זהה: דעיכה מעריכית.”. Comma should be a colon.
6. `reading.sections[id=integrated].worked.steps[0]`: “כל זמן מחצית חיים מחצה את הכמות.” → “בכל זמן מחצית חיים הכמות קטנה בחצי.”. מחצה = crushes.
7. `reading.sections[id=integrated].worked.steps[3]`: “וגם:” → “בדרך אחרת:”. "Also:" calque; this is a second method.
8. `reading.sections[id=integrated].mistake.wrong`: “שימוש ב־<bdi>t<sub>1/2</sub> = 0.693/k</bdi> לתגובה מסדר שני, או קריאת הסדרים” → “משתמשים ב־<bdi>t<sub>1/2</sub> = 0.693/k</bdi> לתגובה מסדר שני, או קוראים את הסדרים”. Mistake.wrong voice.
9. `reading.sections[id=arrhenius].paragraphs[9]`: “ביחס למסלול שלא עבר זירוז.” → “לעומת המסלול ללא זרז.”. Stiff.
10. `reading.sections[id=arrhenius].paragraphs[10]`: “מנגנונים חייבים להסתכם לתגובה הכוללת, לצמצם תוצרי ביניים ולחזות חוק קצב שמתאים לניסוי.” → “סכום השלבים במנגנון חייב לתת את התגובה הכוללת, תוצרי הביניים חייבים להצטמצם, וחוק הקצב החזוי חייב להתאים לניסוי.”. A mechanism does not "cancel intermediates".
11. `reading.sections[id=arrhenius].paragraphs[11]`: “זרזים אינם מופיעים בסטויכיומטריה הכוללת כצרכנים נטו,” → “זרזים אינם נצרכים בסטויכיומטריה הכוללת,”. "net consumers" calque.
12. `questions.t23-q5.explanation`: “ולכן יותר התנגשויות הן בעלות מספיק אנרגיה כדי להגיב.” → “ולכן ליותר התנגשויות יש מספיק אנרגיה כדי להגיב.”. Stiff.
13. `questions.t23-q5.explanation`: “נשארים אותו דבר.” → “אינם משתנים.”. Colloquial.

## 3. Glossary changes

**Add**
- absorbance: this entry is missing, and it needs your decision. Beer–Lambert p0 brackets “הבליעה <bdi>(absorbance)</bdi>”, while the section just before it brackets “בליעה <bdi>(absorption)</bdi>”. That gives one Hebrew word two different English brackets in the same topic. Options:
  - (a) Keep בליעה for both, and drop the second bracket in favour of “הבליעה <bdi>A</bdi>”.
  - (b) Give absorbance its own term. I'm not sure of HUJI lab usage here (some labs say אבסורבנס), so please confirm before choosing it.
  - Avoid בליעוּת: it collides with בליעות מולרית (molar absorptivity).
- delocalized: לא ממוקם (used in Bonding II fixes, replacing מפולג).
- resonance hybrid: היבריד תהודה (Bonding I).
- nonmetal: לא־מתכת. Compounds and periodic trends use it, and types (redox-solution p1) has אל־מתכות, which is fixed in section 2.
- melting: היתוך. Entropy had התכה and IMF had נמסים, both fixed.
- tetrahedral: טטראהדרי; octahedral: אוקטהדרי. These fix the spelling drift in Bonding II.

**Change**
- spin quantum number: “מספר הספין הקוונטי” → “מספר קוונטי של ספין”. This parallels מספר קוונטי ראשי / מגנטי / של התנע הזוויתי.
- standard: the glossary mixes the two spellings. It has פוטנציאל תא תקני and פוטנציאל חיזור תקני, but מצב סטנדרטי and אנתלפיית היווצרות סטנדרטית, and 10 topics write סטנדרטי.
  - Suggestion: use סטנדרטי everywhere and rename the two electrochemistry entries to פוטנציאל תא סטנדרטי and פוטנציאל חיזור סטנדרטי.
  - Then replace תקני/תקניים/התקני in electrochemistry at galvanic p3 (×2), p5, p12, thermo-links p2, p9 (×2) and nernst-faraday p0.
  - Keep תנאי תקן (STP) as it is.
  - These aren't itemized in section 2 because they depend on this decision.
- dash style in English names: Clausius–Clapeyron and Henderson–Hasselbalch use an en dash, but Beer-Lambert uses a hyphen. Pick one. The en dash fits names of two people. The t16-q3 bracket is fixed to match the current Clausius–Clapeyron entry.

**Cross-topic inconsistencies against the glossary (fixed in section 2)**
- Avogadro עיקרון → חוק (t7-q2).
- ideal gas law: one term, חוק הגזים האידאליים (gases why).
- polarizability: יכולת להתקטב (IMF p1 and KMT real-gases p9 used ניתנים / ניתן לקיטוב).
- hybridization: הכלאה (Bonding I vsepr why used היברידיזציה).
- phase: פאזה (entropy used מופע).
- dilution: מיהול (מדולל/מדלל in types, thermo, solubility and electrochemistry; KMT now uses דליל for a gas).

**FYI, outside the overlay files**
- Some `topics.json` topic_he values are stale: compounds still has דרגות חמצון, and gases has משוואת הגז האידאלי. The overlay name wins in the app (app.js line 95), so students don't see the stale values.
- The Bonding I and II names use an ASCII apostrophe (א' / ב'). Use the geresh: א׳ / ב׳.
- UI: `site/i18n/he.js` tapToEnlarge “הקישו להגדלה” breaks rule 9. The suggested replacement is “לחצו להגדלה”. Also, unsure “לא בטוח” is masculine singular. Students are addressed in the plural elsewhere, so consider “לא בטוחים”.

## 4. English source notes for Yishi

- Compounds (empirical-from-percent): “35.0%, or to one decimal as 35.0%” repeats itself.
- Types p1: “in dilute water” should probably be "in dilute solution".
- Thermo first-law p5: “Open vs closed vs isolated” never defines an open system.
- KMT graham p7: “Cancel identical T and P assumptions” is unclear.
- t11-q2: “a half-filled 3d⁵ subshell with all six electrons unpaired”. A 3d⁵ subshell holds five electrons, so the six unpaired electrons presumably mean 3d⁵4s¹. Worth rewording.
- Equilibrium le-chatelier p2: “does not change partial pressures of reactants/products the same way” is vague (the same way as what?). The Hebrew is faithful to it, so the fix belongs in the English.
- Buffers titration-curves wE0 title says “sketch”, but the steps compute a number. The Hebrew title is fixed in section 2.
- English words inside formulas: “PV = constant”, “(P + small)(V − small)”, “molecules/mol”, “aA + bB → products” (kinetics p1 and t23-q4).
- The reading and the cards use different symbols for the same quantity: c₁ vs M₁ (t4-q2), R = 0.08206 vs 0.082057, v(rms) vs u_rms, l vs ℓ.
- I've left out issues already listed in PLAN.md, such as the “x ≈ √(K × something)” placeholder in equilibrium ice-tables p2.



## Appendix A. Remaining בעיה locations (note 1.1)

These are the field paths that still contain בעיה after the section 2 fixes are applied. In each one, replace it with שאלה/שאלות (or תרגיל when it clearly means an exercise) and keep the prefix (ב־, ה־, כש־ and so on).


**acids-and-bases**

- `reading.sections[id=ph-strong].paragraphs[7]` (1)
- `reading.sections[id=ph-strong].paragraphs[10]` (1)

**atoms-elements-and-the-mole**

- `reading.sections[id=isotopes-and-ions].paragraphs[4]` (1)
- `reading.sections[id=average-atomic-mass].paragraphs[4]` (1)
- `reading.sections[id=the-mole].paragraphs[4]` (1)
- `reading.sections[id=mass-mole-particle].paragraphs[5]` (1)

**balancing-redox-equations-and-titrations**

- `reading.sections[id=acidic-half].paragraphs[7]` (1)
- `reading.sections[id=basic-half].paragraphs[7]` (1)

**buffers-indicators-and-titration-curves**

- `reading.sections[id=buffers-hh].paragraphs[9]` (1)
- `reading.sections[id=buffers-hh].why` (1)
- `reading.sections[id=buffer-stress].paragraphs[2]` (1)
- `reading.sections[id=titration-curves].paragraphs[1]` (1)

**chemical-bonding-i-lewis-structures-and-**

- `reading.sections[id=bond-enthalpies].paragraphs[2]` (1)

**chemical-compounds-formulas-and-oxidatio**

- `reading.sections[id=molecular-from-empirical].paragraphs[0]` (1)
- `reading.sections[id=oxidation-states].paragraphs[9]` (1)

**chemical-kinetics**

- `reading.sections[id=integrated].paragraphs[10]` (1)

**electrochemistry**

- `reading.sections[id=galvanic].paragraphs[9]` (1)
- `reading.sections[id=thermo-links].paragraphs[6]` (1)
- `reading.sections[id=nernst-faraday].paragraphs[8]` (1)
- `reading.sections[id=nernst-faraday].paragraphs[9]` (1)
- `reading.sections[id=nernst-faraday].paragraphs[11]` (1)

**electron-configurations-and-the-periodic**

- `reading.sections[id=exceptions-cr-cu].paragraphs[3]` (1)
- `reading.sections[id=exceptions-cr-cu].paragraphs[4]` (1)
- `reading.sections[id=ions-configurations].paragraphs[4]` (1)

**entropy-gibbs-energy-and-spontaneity**

- `reading.sections[id=dg-k].paragraphs[1]` (2)
- `reading.sections[id=dg-k].paragraphs[4]` (2)

**gases-gas-laws-and-the-ideal-gas-equatio**

- `reading.sections[id=gas-laws].paragraphs[4]` (1)
- `reading.sections[id=gas-laws].paragraphs[6]` (1)
- `reading.sections[id=dalton].paragraphs[4]` (1)

**kinetic-molecular-theory-and-real-gases**

- `reading.sections[id=speed-and-energy].paragraphs[3]` (1)
- `reading.sections[id=graham].paragraphs[6]` (1)
- `reading.sections[id=real-gases].paragraphs[8]` (2)

**measurement-units-and-significant-figure**

- `reading.sections[id=sig-figs-in-calculations].mistake.wrong` (1)

**periodic-trends-in-atomic-properties**

- `reading.sections[id=ionic-radius].paragraphs[3]` (1)

**principles-of-chemical-equilibrium**

- `reading.sections[id=k-and-q].paragraphs[3]` (1)
- `reading.sections[id=ice-tables].paragraphs[3]` (1)
- `reading.sections[id=ice-tables].paragraphs[7]` (1)
- `reading.sections[id=le-chatelier].paragraphs[2]` (1)

**solubility-precipitation-and-complex-ion**

- `reading.sections[id=ksp].paragraphs[4]` (1)
- `reading.sections[id=ksp].why` (1)
- `reading.sections[id=precipitate-q].paragraphs[10]` (1)

**thermochemistry-and-the-first-law**

- `reading.sections[id=first-law].paragraphs[6]` (1)
- `reading.sections[id=first-law].why` (1)
- `reading.sections[id=enthalpy-calorimetry].paragraphs[8]` (1)
- `reading.sections[id=hess-formation].paragraphs[6]` (1)

**types-of-reactions-in-aqueous-solution**

- `reading.sections[id=electrolytes].why` (1)
