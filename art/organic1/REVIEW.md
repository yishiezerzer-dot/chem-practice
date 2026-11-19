# Organic 1 automatic pictures: review log

These pictures are drawn automatically from SMILES by `tools/make-pictures.py`. Chem Sketcher fills the last three columns (checked_by, date, notes) after looking at each picture.
To view them all on one page, run `py -m http.server 8130 --bind 127.0.0.1` from the repo root and open http://127.0.0.1:8130/tools/pictures.html (add `?lang=he` for Hebrew). The viewer lives in `tools/`, outside the published site.

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

When a picture here is checked, change its `picture_check` in data/organic1/pictures.json from `unchecked` to `checked` (then run `py tools/make-pictures.py` to copy it to site/).

Chem Sketcher file (source "sketch"): `data/organic1/img/o-sample-mc-2-ethylpropane.svg`, the 2-ethylpropane choice on the o-sample-mc card, drawn as named (a three-carbon chain with an ethyl branch on carbon 2). Approved by Yishi; added in O3c and replaced in O3d by a redraw at the automatic pictures' scale (133x96, 34px bonds); not yet reviewed here.
