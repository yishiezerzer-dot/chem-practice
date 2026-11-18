# Organic 1 automatic pictures: review log

These pictures are drawn automatically from SMILES by `tools/make-pictures.py`. Chem Sketcher fills the last three columns (checked_by, date, notes) after looking at each picture.
To view them all on one page, serve `site/` and open `site/pictures.html` (add `?lang=he` for Hebrew).

| id | SMILES | what it should show | checked_by | date | notes |
|---|---|---|---|---|---|
| o-pic-butane | `CCCC` | A zigzag of four carbons, no labels. | | | |
| o-pic-2-methylbutane | `CC(C)CC` | A four-carbon zigzag with one methyl branch on carbon 2. | | | |
| o-pic-cyclohexane | `C1CCCCC1` | A plain six-membered ring, single bonds only. | | | |
| o-pic-ethanol | `CCO` | Two carbons in a line, ending in an OH label. | | | |
| o-pic-benzene | `c1ccccc1` | A six-membered ring with three alternating double bonds. | | | |
| o-pic-e-but-2-ene | `C/C=C/C` | E: the two methyls on opposite sides of the double bond. | | | |
| o-pic-z-but-2-ene | `C/C=C\C` | Z: the two methyls on the same side of the double bond. | | | |
| o-pic-r-2-bromobutane | `C[C@@H](Br)CC` | (R) centre at carbon 2: Br on carbon 2, one bond at carbon 2 drawn as a wedge or dash, chain drawn as a zigzag. | | | |
| o-pic-trans-1-2-dimethylcyclohexane | `C[C@@H]1CCCC[C@H]1C` | trans: the two methyls on neighbouring ring carbons on opposite faces, one wedge and one dash. | | | |
| o-pic-acetate | `CC(=O)[O-]` | A methyl on a carbon with one double-bonded O and one single-bonded O carrying a minus charge. | | | |
