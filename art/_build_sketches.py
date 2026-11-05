#!/usr/bin/env python3
"""Generate Chem Practice reading sketches (original educational drawings)."""
from __future__ import annotations
import math
import json
from pathlib import Path
import cairosvg

OUT = Path(__file__).resolve().parent
FONT = "Arial, Helvetica, sans-serif"
INK = "#1A1A1A"
MUTED = "#5F6B7A"
BLUE = "#2B5FD9"
RED = "#E53935"      # O
NBLUE = "#1E88E5"    # N
SYEL = "#C9A227"     # S (dark enough on white)
FGREEN = "#2E7D32"   # F
ACCENT = "#17754A"
BG = "#FFFFFF"

def save(sid: str, svg: str, width: int, height: int, scale: float = 2.0):
    svg_path = OUT / f"{sid}.svg"
    png_path = OUT / f"{sid}.png"
    # ensure xmlns
    if "<svg" not in svg[:200]:
        raise ValueError(sid)
    svg_path.write_text(svg, encoding="utf-8")
    cairosvg.svg2png(
        bytestring=svg.encode("utf-8"),
        write_to=str(png_path),
        output_width=int(width * scale),
        output_height=int(height * scale),
        background_color="white",
    )
    print(f"wrote {sid} ({width}x{height} → png @{scale}x)")

def svg_wrap(w, h, body, title=""):
    aria = f' role="img" aria-label="{title}"' if title else ""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"{aria}>
<rect width="{w}" height="{h}" fill="{BG}"/>
{body}
</svg>
'''

def text(x, y, s, size=14, fill=INK, anchor="middle", weight="normal", family=FONT):
    s = (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="{family}" font-size="{size}" font-weight="{weight}" fill="{fill}">{s}</text>'

def tspan_sub(base, sub, size=14, subsize=10):
    """Return mixed content with subscript (for use inside text via raw)."""
    return f'{base}<tspan baseline-shift="sub" font-size="{subsize}">{sub}</tspan>'

# ───────────────────────── 1. Fe-56 Fe3+ nucleus ─────────────────────────
def sketch_fe56_fe3_nucleus():
    sid = "fe56-fe3-nucleus"
    w, h = 420, 320
    parts = []
    parts.append(text(210, 28, "⁵⁶Fe³⁺ — protons, neutrons, electrons", 15, weight="bold"))
    # nucleus circle
    parts.append(f'<circle cx="140" cy="160" r="70" fill="#FFE8CC" stroke="{INK}" stroke-width="2"/>')
    parts.append(text(140, 145, "nucleus", 12, MUTED))
    parts.append(text(140, 168, "26 p⁺", 16, RED, weight="bold"))
    parts.append(text(140, 190, "30 n⁰", 16, BLUE, weight="bold"))
    # electrons cloud
    parts.append(f'<ellipse cx="300" cy="160" rx="90" ry="70" fill="none" stroke="{BLUE}" stroke-width="1.5" stroke-dasharray="4 3"/>')
    parts.append(text(300, 120, "electron cloud", 12, MUTED))
    parts.append(text(300, 155, "23 e⁻", 18, BLUE, weight="bold"))
    parts.append(text(300, 180, "(26 − 3 = 23)", 12, MUTED))
    # labels
    parts.append(text(140, 250, "Z = 26, A = 56", 13))
    parts.append(text(140, 270, "neutrons = A − Z = 30", 13))
    parts.append(text(300, 250, "charge = +3", 13))
    parts.append(text(300, 270, "e⁻ = Z − charge", 13))
    parts.append(text(210, 305, "For Fe-56: 26 protons + 30 neutrons; Fe³⁺ has lost 3 electrons.", 11, MUTED))
    save(sid, svg_wrap(w, h, "\n".join(parts), "Nuclear diagram of iron-56 Fe3+ ion"), w, h)
    return sid

# ───────────────────────── 2. H Bohr levels ─────────────────────────
def sketch_h_bohr_levels():
    sid = "h-bohr-levels"
    w, h = 420, 360
    parts = []
    parts.append(text(210, 26, "Hydrogen energy levels (Bohr)", 15, weight="bold"))
    # energy axis
    parts.append(f'<line x1="70" y1="50" x2="70" y2="320" stroke="{INK}" stroke-width="1.5"/>')
    parts.append(text(40, 50, "E", 14, weight="bold"))
    parts.append(f'<polygon points="70,42 66,52 74,52" fill="{INK}"/>')
    # levels: E = -13.6/n^2 ; place n=1 near bottom
    # n=1 at y=290, n=2 at y=180, n=3 at y=120, n=∞ at y=60
    levels = [(1, 290, "−13.60 eV"), (2, 180, "−3.40 eV"), (3, 120, "−1.51 eV")]
    for n, y, ev in levels:
        parts.append(f'<line x1="90" y1="{y}" x2="280" y2="{y}" stroke="{BLUE}" stroke-width="2.5"/>')
        parts.append(text(50, y + 5, f"n={n}", 13, weight="bold", anchor="end"))
        parts.append(text(295, y + 5, ev, 12, MUTED, anchor="start"))
    parts.append(f'<line x1="90" y1="60" x2="280" y2="60" stroke="{MUTED}" stroke-width="1.5" stroke-dasharray="4 3"/>')
    parts.append(text(50, 65, "n=∞", 12, MUTED, anchor="end"))
    parts.append(text(295, 65, "0 eV", 12, MUTED, anchor="start"))
    # photon arrow n=3 → n=2
    parts.append(f'<line x1="200" y1="120" x2="200" y2="180" stroke="{RED}" stroke-width="2.5"/>')
    parts.append(f'<polygon points="200,180 195,168 205,168" fill="{RED}"/>')
    parts.append(text(210, 155, "photon", 12, RED, anchor="start"))
    parts.append(text(210, 172, "656 nm (Balmer)", 12, RED, anchor="start"))
    parts.append(text(210, 340, "Eₙ = −13.6 eV / n²   ·   emission when electron falls to lower n", 12, MUTED))
    save(sid, svg_wrap(w, h, "\n".join(parts), "Bohr energy levels for hydrogen with Balmer n=3 to n=2"), w, h)
    return sid

# ───────────────────────── 3. Orbital shapes ─────────────────────────
def sketch_orbital_shapes():
    sid = "orbital-shapes-1s-2p-3d"
    w, h = 540, 320
    parts = []
    parts.append(text(270, 22, "Orbital shapes (schematic)", 15, weight="bold"))
    # 1s
    cx, cy = 90, 130
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="42" fill="#BBDEFB" stroke="{BLUE}" stroke-width="2"/>')
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="3" fill="{INK}"/>')
    parts.append(text(cx, 235, "1s", 16, weight="bold"))
    parts.append(text(cx, 255, "sphere", 12, MUTED))
    # 2p — clear gap at node (lobes do not overlap)
    cx = 250
    parts.append(f'<ellipse cx="{cx}" cy="{cy-34}" rx="24" ry="26" fill="#C8E6C9" stroke="{ACCENT}" stroke-width="2"/>')
    parts.append(f'<ellipse cx="{cx}" cy="{cy+34}" rx="24" ry="26" fill="#FFCDD2" stroke="{RED}" stroke-width="2"/>')
    parts.append(f'<line x1="{cx-10}" y1="{cy}" x2="{cx+10}" y2="{cy}" stroke="{INK}" stroke-width="1.5"/>')
    parts.append(text(cx + 40, cy - 34, "+", 14, ACCENT, weight="bold"))
    parts.append(text(cx + 40, cy + 38, "−", 14, RED, weight="bold"))
    parts.append(text(cx, 235, "2p", 16, weight="bold"))
    parts.append(text(cx, 255, "dumbbell", 12, MUTED))
    # 3d — lobes farther out; label well below
    cx = 430
    for dx, dy in [(-32, -32), (32, -32), (-32, 32), (32, 32)]:
        rot = 45 if dx * dy > 0 else -45
        parts.append(f'<ellipse cx="{cx+dx}" cy="{cy+dy}" rx="20" ry="13" transform="rotate({rot} {cx+dx} {cy+dy})" fill="#BBDEFB" stroke="{BLUE}" stroke-width="1.5"/>')
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="3" fill="{INK}"/>')
    parts.append(text(cx, 235, "3d", 16, weight="bold"))
    parts.append(text(cx, 255, "clover (e.g. dₓᵧ)", 12, MUTED))
    parts.append(text(270, 295, "Schematic phase/lobes only — not to scale.", 11, MUTED))
    save(sid, svg_wrap(w, h, "\n".join(parts), "Schematic shapes of 1s, 2p, and 3d orbitals"), w, h)
    return sid

def draw_boxes(ox, oy, labels_electrons, box=28, gap=6):
    """labels_electrons: list of (label, list of spins) where spin in ('up','down','empty') or paired.
    Actually: list of (subshell_label, [e1,e2,...]) where each e is 'u','d','' for empty.
    For p/d: multiple boxes. Return svg parts and width used.
    """
    parts = []
    x = ox
    for label, slots in labels_electrons:
        # slots is list of boxes; each box is tuple of 0-2 chars 'u'/'d'
        n = len(slots)
        # label above center of this group
        group_w = n * box + (n - 1) * gap
        parts.append(text(x + group_w / 2, oy - 8, label, 12, weight="bold"))
        for i, contents in enumerate(slots):
            bx = x + i * (box + gap)
            parts.append(f'<rect x="{bx}" y="{oy}" width="{box}" height="{box}" fill="#FAFAFA" stroke="{INK}" stroke-width="1.5"/>')
            # electrons
            if contents == "ud":
                # paired
                parts.append(f'<line x1="{bx+10}" y1="{oy+22}" x2="{bx+10}" y2="{oy+6}" stroke="{INK}" stroke-width="2"/>')
                parts.append(f'<polygon points="{bx+10},{oy+6} {bx+6},{oy+12} {bx+14},{oy+12}" fill="{INK}"/>')
                parts.append(f'<line x1="{bx+18}" y1="{oy+6}" x2="{bx+18}" y2="{oy+22}" stroke="{INK}" stroke-width="2"/>')
                parts.append(f'<polygon points="{bx+18},{oy+22} {bx+14},{oy+16} {bx+22},{oy+16}" fill="{INK}"/>')
            elif contents == "u":
                parts.append(f'<line x1="{bx+box/2}" y1="{oy+22}" x2="{bx+box/2}" y2="{oy+6}" stroke="{INK}" stroke-width="2"/>')
                parts.append(f'<polygon points="{bx+box/2},{oy+6} {bx+box/2-4},{oy+12} {bx+box/2+4},{oy+12}" fill="{INK}"/>')
            elif contents == "d":
                parts.append(f'<line x1="{bx+box/2}" y1="{oy+6}" x2="{bx+box/2}" y2="{oy+22}" stroke="{INK}" stroke-width="2"/>')
                parts.append(f'<polygon points="{bx+box/2},{oy+22} {bx+box/2-4},{oy+16} {bx+box/2+4},{oy+16}" fill="{INK}"/>')
            # empty: nothing
        x += group_w + 18
    return parts, x - ox - 18

def sketch_orbital_boxes_c_n():
    sid = "orbital-boxes-c-n"
    w, h = 520, 300
    parts = [text(260, 24, "Orbital box diagrams — Hund’s rule", 15, weight="bold")]
    # Carbon: 1s2 2s2 2p2
    parts.append(text(40, 60, "C (Z=6): 1s² 2s² 2p²", 14, weight="bold", anchor="start"))
    bp, _ = draw_boxes(40, 80, [
        ("1s", ["ud"]),
        ("2s", ["ud"]),
        ("2p", ["u", "u", ""]),
    ])
    parts.extend(bp)
    parts.append(text(40, 130, "2 unpaired e⁻ (Hund: separate before pairing)", 12, MUTED, anchor="start"))
    # Nitrogen
    parts.append(text(40, 170, "N (Z=7): 1s² 2s² 2p³", 14, weight="bold", anchor="start"))
    bp, _ = draw_boxes(40, 190, [
        ("1s", ["ud"]),
        ("2s", ["ud"]),
        ("2p", ["u", "u", "u"]),
    ])
    parts.extend(bp)
    parts.append(text(40, 240, "3 unpaired e⁻ — half-filled 2p (extra stability)", 12, MUTED, anchor="start"))
    parts.append(text(260, 280, "Each box = one orbital; arrows = electron spin (↑ / ↓).", 12, MUTED))
    save(sid, svg_wrap(w, h, "\n".join(parts), "Orbital box diagrams for carbon and nitrogen showing Hund rule"), w, h)
    return sid

def sketch_orbital_boxes_cr_fe3():
    sid = "orbital-boxes-cr-fe3"
    w, h = 560, 320
    parts = [text(280, 24, "Exceptions and ions — orbital boxes", 15, weight="bold")]
    parts.append(text(40, 58, "Cr (Z=24): [Ar] 3d⁵ 4s¹  (not 3d⁴ 4s²)", 14, weight="bold", anchor="start"))
    bp, _ = draw_boxes(40, 78, [
        ("3d", ["u", "u", "u", "u", "u"]),
        ("4s", ["u"]),
    ])
    parts.extend(bp)
    parts.append(text(40, 128, "Half-filled 3d + half-filled 4s preferred", 12, MUTED, anchor="start"))

    parts.append(text(40, 170, "Fe³⁺: Fe is [Ar] 3d⁶ 4s² → remove 4s then 3d → [Ar] 3d⁵", 14, weight="bold", anchor="start"))
    bp, _ = draw_boxes(40, 190, [
        ("3d", ["u", "u", "u", "u", "u"]),
        ("4s", [""]),
    ])
    parts.extend(bp)
    parts.append(text(40, 240, "4s empty; five unpaired 3d electrons (half-filled)", 12, MUTED, anchor="start"))
    parts.append(text(280, 290, "Transition-metal cations: remove s electrons before d electrons.", 12, MUTED))
    save(sid, svg_wrap(w, h, "\n".join(parts), "Orbital boxes for Cr exception and Fe3+ ion"), w, h)
    return sid

def sketch_unpaired_ca_zn_fe():
    sid = "unpaired-ca-zn2-fe2"
    w, h = 560, 360
    parts = [text(280, 24, "Unpaired electrons — paramagnetism", 15, weight="bold")]

    parts.append(text(40, 55, "Ca: [Ar] 4s²", 14, weight="bold", anchor="start"))
    bp, _ = draw_boxes(40, 72, [("4s", ["ud"])])
    parts.extend(bp)
    parts.append(text(200, 92, "0 unpaired → diamagnetic", 13, ACCENT, anchor="start"))

    parts.append(text(40, 140, "Zn²⁺: [Ar] 3d¹⁰  (Zn is [Ar] 3d¹⁰ 4s²; lose 4s²)", 14, weight="bold", anchor="start"))
    bp, _ = draw_boxes(40, 158, [("3d", ["ud", "ud", "ud", "ud", "ud"])])
    parts.extend(bp)
    parts.append(text(280, 178, "0 unpaired → diamagnetic", 13, ACCENT, anchor="start"))

    parts.append(text(40, 230, "Fe²⁺: [Ar] 3d⁶  (high-spin free ion)", 14, weight="bold", anchor="start"))
    bp, _ = draw_boxes(40, 248, [("3d", ["ud", "u", "u", "u", "u"])])
    parts.extend(bp)
    parts.append(text(280, 268, "4 unpaired → paramagnetic", 13, RED, anchor="start"))

    parts.append(text(280, 330, "Paramagnetic = has ≥1 unpaired electron; diamagnetic = all paired.", 12, MUTED))
    save(sid, svg_wrap(w, h, "\n".join(parts), "Orbital boxes for Ca Zn2+ Fe2+ unpaired electrons"), w, h)
    return sid

# ───────────────────────── Lewis structures ─────────────────────────
def lone_pair_dots(cx, cy, angle_deg, radius, color=INK, spread=4.0):
    """Two dots for one lone pair outside an atom. angle: 0=E, 90=S, -90=N (deg)."""
    a = math.radians(angle_deg)
    mx = cx + radius * math.cos(a)
    my = cy + radius * math.sin(a)
    px, py = -math.sin(a), math.cos(a)
    return (
        f'<circle cx="{mx + px*spread}" cy="{my + py*spread}" r="2.4" fill="{color}"/>'
        f'<circle cx="{mx - px*spread}" cy="{my - py*spread}" r="2.4" fill="{color}"/>'
    )

def edge_bond(x1, y1, r1, x2, y2, r2, stroke=INK, width=2.2, double=False):
    """Bond segment(s) that stop at each atom circle edge."""
    dx, dy = x2 - x1, y2 - y1
    dist = math.hypot(dx, dy) or 1.0
    ux, uy = dx / dist, dy / dist
    sx, sy = x1 + ux * r1, y1 + uy * r1
    ex, ey = x2 - ux * r2, y2 - uy * r2
    if not double:
        return f'<line x1="{sx}" y1="{sy}" x2="{ex}" y2="{ey}" stroke="{stroke}" stroke-width="{width}" stroke-linecap="round"/>'
    px, py = -uy, ux
    off = 3.5
    return (
        f'<line x1="{sx+px*off}" y1="{sy+py*off}" x2="{ex+px*off}" y2="{ey+py*off}" stroke="{stroke}" stroke-width="{width}" stroke-linecap="round"/>'
        f'<line x1="{sx-px*off}" y1="{sy-py*off}" x2="{ex-px*off}" y2="{ey-py*off}" stroke="{stroke}" stroke-width="{width}" stroke-linecap="round"/>'
    )

def atom_circle(cx, cy, r, fill, stroke, label, label_color=INK, label_size=15):
    return (
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
        + text(cx, cy + label_size * 0.35, label, label_size, label_color, weight="bold")
    )

def sketch_lewis_h2o_co2_sf4():
    sid = "lewis-h2o-co2-sf4"
    w, h = 700, 380
    parts = [text(350, 24, "Lewis structures (lone pairs shown)", 15, weight="bold")]

    # ── H2O ──
    ox, oy = 100, 145
    or_, hr = 18, 13
    h1, h2 = (ox - 52, oy + 48), (ox + 52, oy + 48)
    parts.append(edge_bond(ox, oy, or_, *h1, hr))
    parts.append(edge_bond(ox, oy, or_, *h2, hr))
    parts.append(atom_circle(ox, oy, or_, "#FFCDD2", RED, "O", RED, 16))
    parts.append(atom_circle(*h1, hr, "#EEEEEE", INK, "H", INK, 13))
    parts.append(atom_circle(*h2, hr, "#EEEEEE", INK, "H", INK, 13))
    parts.append(lone_pair_dots(ox, oy, -140, or_ + 16, RED, spread=5.0))
    parts.append(lone_pair_dots(ox, oy, -40, or_ + 16, RED, spread=5.0))
    parts.append(text(ox, 245, "H₂O", 14, weight="bold"))
    parts.append(text(ox, 263, "all FC = 0", 11, MUTED))
    parts.append(text(ox, 279, "2 LP on O", 11, MUTED))

    # ── CO2 ──
    cx, cy = 320, 145
    cr = or2 = 16
    oL, oR = (cx - 78, cy), (cx + 78, cy)
    parts.append(edge_bond(*oL, or2, cx, cy, cr, double=True))
    parts.append(edge_bond(cx, cy, cr, *oR, or2, double=True))
    parts.append(atom_circle(*oL, or2, "#FFCDD2", RED, "O", RED, 14))
    parts.append(atom_circle(cx, cy, cr, "#EEEEEE", INK, "C", INK, 14))
    parts.append(atom_circle(*oR, or2, "#FFCDD2", RED, "O", RED, 14))
    for ox_ in (oL[0], oR[0]):
        parts.append(lone_pair_dots(ox_, cy, -90, or2 + 14, RED, spread=5.0))
        parts.append(lone_pair_dots(ox_, cy, 90, or2 + 14, RED, spread=5.0))
    parts.append(text(cx, 245, "CO₂", 14, weight="bold"))
    parts.append(text(cx, 263, "all FC = 0", 11, MUTED))
    parts.append(text(cx, 279, "linear; 2 LP each O", 11, MUTED))

    # ── SF4 Lewis 2D — more gap from CO2; F arms shorter so LPs fit ──
    sx, sy = 560, 145
    sr, fr = 17, 13
    arm = 70
    fpos = [(sx, sy - arm), (sx + arm, sy), (sx, sy + arm), (sx - arm, sy)]
    for fx, fy in fpos:
        parts.append(edge_bond(sx, sy, sr, fx, fy, fr))
    parts.append(atom_circle(sx, sy, sr, "#FFF9C4", SYEL, "S", SYEL, 15))
    for fx, fy in fpos:
        parts.append(atom_circle(fx, fy, fr, "#E8F5E9", FGREEN, "F", FGREEN, 12))
        ang = math.degrees(math.atan2(sy - fy, sx - fx))
        for da in (90, 180, -90):
            parts.append(lone_pair_dots(fx, fy, ang + da, fr + 12, FGREEN, spread=3.6))
    parts.append(lone_pair_dots(sx, sy, -45, sr + 16, SYEL, spread=5.0))
    parts.append(text(sx + 32, sy - 46, "LP", 11, MUTED, weight="bold"))

    parts.append(text(sx, 265, "SF₄", 14, weight="bold"))
    parts.append(text(sx, 283, "all FC = 0", 11, MUTED))
    parts.append(text(sx, 299, "1 LP on S (10 e⁻)", 11, MUTED))

    parts.append(text(350, 340, "Formal charge = valence − nonbonding e⁻ − ½(bonding e⁻). All three: FC = 0.", 12, MUTED))
    parts.append(text(350, 360, "O red · S gold · F green. Bonds stop at atom edges; lone-pair dots sit outside circles.", 11, MUTED))
    save(sid, svg_wrap(w, h, "\n".join(parts), "Lewis structures of water carbon dioxide and sulfur tetrafluoride"), w, h)
    return sid

def sketch_vsepr_sf4_seesaw():
    sid = "vsepr-sf4-seesaw"
    w, h = 520, 390
    parts = [text(260, 24, "SF₄ — seesaw (VSEPR)", 15, weight="bold")]
    parts.append(text(240, 46, "5 domains → trigonal bipyramidal e⁻ geometry; LP equatorial → seesaw", 11, MUTED))

    sx, sy = 200, 195
    sr, fr = 20, 15
    fpos = [(sx, sy - 100), (sx, sy + 100), (sx - 110, sy + 28), (sx + 110, sy + 28)]
    # bonds stop short of circle (inset) so S label stays clear
    for fx, fy in fpos:
        parts.append(edge_bond(sx, sy, sr + 1, fx, fy, fr + 1, width=2.5))
    parts.append(atom_circle(sx, sy, sr, "#FFF9C4", SYEL, "S", SYEL, 16))
    for fx, fy in fpos:
        parts.append(atom_circle(fx, fy, fr, "#E8F5E9", FGREEN, "F", FGREEN, 13))
    # LP lobe equatorial upper-left, clear of axial/eq bonds
    parts.append(f'<ellipse cx="{sx-78}" cy="{sy-48}" rx="32" ry="18" fill="#FFF3E0" stroke="{MUTED}" stroke-width="1.5" transform="rotate(-40 {sx-78} {sy-48})"/>')
    parts.append(text(sx - 78, sy - 44, "LP", 12, MUTED, weight="bold"))

    # dipole OUTSIDE molecule on the right
    parts.append(f'<defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="{RED}"/></marker></defs>')
    parts.append(f'<line x1="400" y1="260" x2="400" y2="120" stroke="{RED}" stroke-width="2.5" marker-end="url(#arrowhead)"/>')
    parts.append(f'<line x1="392" y1="260" x2="408" y2="260" stroke="{RED}" stroke-width="2"/>')
    parts.append(text(420, 175, "net dipole", 12, RED, anchor="start"))
    parts.append(text(420, 193, "δ− toward LP", 12, RED, anchor="start"))
    parts.append(text(420, 211, "polar", 12, RED, anchor="start"))

    parts.append(text(240, 360, "Lone pair takes an equatorial site (90° contacts minimized).", 12, MUTED))
    save(sid, svg_wrap(w, h, "\n".join(parts), "VSEPR seesaw shape of SF4 with dipole"), w, h)
    return sid

def sketch_hybrid_ethene_ethyne():
    sid = "hybrid-ethene-ethyne"
    w, h = 560, 400
    parts = [text(280, 24, "Hybridization: ethene (sp²) and ethyne (sp)", 15, weight="bold")]

    # Ethene
    parts.append(text(150, 55, "ethene H₂C=CH₂ — sp²", 14, weight="bold"))
    y = 140
    c1, c2 = 105, 195
    cr, hr = 16, 11
    # bonds first (under atoms)
    parts.append(edge_bond(c1, y, cr, c2, y, cr, stroke=BLUE, width=3.0))
    for hx, hy in [(c1 - 42, y - 38), (c1 - 42, y + 38), (c2 + 42, y - 38), (c2 + 42, y + 38)]:
        cx0 = c1 if hx < 150 else c2
        parts.append(edge_bond(cx0, y, cr, hx, hy, hr))
    parts.append(f'<path d="M {c1+10},{y-24} Q {150},{y-44} {c2-10},{y-24}" fill="none" stroke="{RED}" stroke-width="2"/>')
    parts.append(f'<path d="M {c1+10},{y+24} Q {150},{y+44} {c2-10},{y+24}" fill="none" stroke="{RED}" stroke-width="2"/>')
    parts.append(atom_circle(c1, y, cr, "#EEEEEE", INK, "C", INK, 14))
    parts.append(atom_circle(c2, y, cr, "#EEEEEE", INK, "C", INK, 14))
    for hx, hy in [(c1 - 42, y - 38), (c1 - 42, y + 38), (c2 + 42, y - 38), (c2 + 42, y + 38)]:
        parts.append(atom_circle(hx, hy, hr, "#FAFAFA", INK, "H", INK, 11))
    parts.append(text(150, 215, "σ (blue) + π (red) = double bond", 12, MUTED))
    parts.append(text(150, 233, "each C: 3 sp² + 1 unhybridized p", 12, MUTED))

    # Ethyne
    parts.append(text(420, 55, "ethyne HC≡CH — sp", 14, weight="bold"))
    c1, c2 = 375, 465
    parts.append(edge_bond(c1, y, cr, c2, y, cr, stroke=BLUE, width=3.0))
    for hx, hy in [(c1 - 48, y), (c2 + 48, y)]:
        cx0 = c1 if hx < 420 else c2
        parts.append(edge_bond(cx0, y, cr, hx, hy, hr))
    parts.append(f'<path d="M {c1+10},{y-20} Q {420},{y-38} {c2-10},{y-20}" fill="none" stroke="{RED}" stroke-width="2"/>')
    parts.append(f'<path d="M {c1+10},{y+20} Q {420},{y+38} {c2-10},{y+20}" fill="none" stroke="{RED}" stroke-width="2"/>')
    # second π lobes above/below, clear of C labels
    parts.append(f'<ellipse cx="420" cy="{y-55}" rx="24" ry="13" fill="#FFCDD2" stroke="{RED}" stroke-width="1" opacity="0.75"/>')
    parts.append(f'<ellipse cx="420" cy="{y+55}" rx="24" ry="13" fill="#FFCDD2" stroke="{RED}" stroke-width="1" opacity="0.75"/>')
    parts.append(text(420, y - 52, "π", 11, RED, weight="bold"))
    parts.append(atom_circle(c1, y, cr, "#EEEEEE", INK, "C", INK, 14))
    parts.append(atom_circle(c2, y, cr, "#EEEEEE", INK, "C", INK, 14))
    for hx, hy in [(c1 - 48, y), (c2 + 48, y)]:
        parts.append(atom_circle(hx, hy, hr, "#FAFAFA", INK, "H", INK, 11))
    parts.append(text(420, 215, "σ + 2π = triple bond", 12, MUTED))
    parts.append(text(420, 233, "each C: 2 sp + 2 unhybridized p", 12, MUTED))

    parts.append(text(280, 275, "Legend", 13, weight="bold"))
    parts.append(f'<line x1="120" y1="295" x2="160" y2="295" stroke="{BLUE}" stroke-width="3"/>')
    parts.append(text(170, 300, "σ bond (end-on overlap of hybrids)", 12, anchor="start"))
    parts.append(f'<line x1="120" y1="320" x2="160" y2="320" stroke="{RED}" stroke-width="2"/>')
    parts.append(text(170, 325, "π bond (side-on overlap of p orbitals)", 12, anchor="start"))
    parts.append(text(280, 360, "Single = 1σ; double = 1σ+1π; triple = 1σ+2π.", 12, MUTED))
    save(sid, svg_wrap(w, h, "\n".join(parts), "Hybrid orbitals ethene sp2 and ethyne sp with sigma and pi"), w, h)
    return sid

def sketch_mo_o2():
    sid = "mo-o2"
    w, h = 620, 480
    parts = [text(310, 24, "MO diagram for O₂ (and O₂⁺, O₂⁻)", 15, weight="bold")]
    parts.append(text(310, 44, "O₂ ordering: σ₂p below π₂p  ·  2 unpaired in π*  ·  bond order 2  ·  paramagnetic", 11, MUTED))

    # columns for O2, O2+, O2-
    # Draw central MO ladder for O2, then small notes for ions
    # Levels from bottom (low E) to top:
    # σ2s, σ*2s, σ2p, π2p (degenerate), π*2p (degenerate), σ*2p
    levels = [
        ("σ*2p", 70, ""),
        ("π*2p", 120, "uu"),   # two unpaired for O2 - shown as two boxes
        ("π2p", 200, "udud"),
        ("σ2p", 260, "ud"),
        ("σ*2s", 320, "ud"),
        ("σ2s", 370, "ud"),
    ]
    # Simplified valence focus: show from σ2s up
    cx = 200
    parts.append(text(cx, 60, "O₂ (12 valence e⁻)", 13, weight="bold"))

    def mo_line(y, label, electrons, degenerate=False):
        ps = []
        ps.append(text(cx - 90, y + 5, label, 12, weight="bold", anchor="end"))
        if degenerate:
            # two parallel lines for π
            for dx in (-18, 18):
                ps.append(f'<line x1="{cx+dx-30}" y1="{y}" x2="{cx+dx+30}" y2="{y}" stroke="{BLUE}" stroke-width="2.5"/>')
            # electrons distributed
            # electrons string: for π* O2: one u in each
            if electrons == "uu":
                for i, dx in enumerate((-18, 18)):
                    bx = cx + dx
                    ps.append(f'<line x1="{bx}" y1="{y-12}" x2="{bx}" y2="{y-2}" stroke="{INK}" stroke-width="2"/>')
                    ps.append(f'<polygon points="{bx},{y-12} {bx-3.5},{y-6} {bx+3.5},{y-6}" fill="{INK}"/>')
            elif electrons == "udud":
                for dx in (-18, 18):
                    bx = cx + dx
                    ps.append(f'<line x1="{bx-5}" y1="{y-14}" x2="{bx-5}" y2="{y-2}" stroke="{INK}" stroke-width="1.8"/>')
                    ps.append(f'<polygon points="{bx-5},{y-14} {bx-8},{y-8} {bx-2},{y-8}" fill="{INK}"/>')
                    ps.append(f'<line x1="{bx+5}" y1="{y-2}" x2="{bx+5}" y2="{y-14}" stroke="{INK}" stroke-width="1.8"/>')
                    ps.append(f'<polygon points="{bx+5},{y-2} {bx+2},{y-8} {bx+8},{y-8}" fill="{INK}"/>')
            elif electrons == "u":  # O2+ one electron in one of π*
                bx = cx - 18
                ps.append(f'<line x1="{bx}" y1="{y-12}" x2="{bx}" y2="{y-2}" stroke="{INK}" stroke-width="2"/>')
                ps.append(f'<polygon points="{bx},{y-12} {bx-3.5},{y-6} {bx+3.5},{y-6}" fill="{INK}"/>')
            elif electrons == "udu":  # O2- three in π*
                for i, dx in enumerate((-18, 18)):
                    bx = cx + dx
                    if i == 0:
                        ps.append(f'<line x1="{bx-5}" y1="{y-14}" x2="{bx-5}" y2="{y-2}" stroke="{INK}" stroke-width="1.8"/>')
                        ps.append(f'<polygon points="{bx-5},{y-14} {bx-8},{y-8} {bx-2},{y-8}" fill="{INK}"/>')
                        ps.append(f'<line x1="{bx+5}" y1="{y-2}" x2="{bx+5}" y2="{y-14}" stroke="{INK}" stroke-width="1.8"/>')
                        ps.append(f'<polygon points="{bx+5},{y-2} {bx+2},{y-8} {bx+8},{y-8}" fill="{INK}"/>')
                    else:
                        ps.append(f'<line x1="{bx}" y1="{y-12}" x2="{bx}" y2="{y-2}" stroke="{INK}" stroke-width="2"/>')
                        ps.append(f'<polygon points="{bx},{y-12} {bx-3.5},{y-6} {bx+3.5},{y-6}" fill="{INK}"/>')
        else:
            ps.append(f'<line x1="{cx-35}" y1="{y}" x2="{cx+35}" y2="{y}" stroke="{BLUE}" stroke-width="2.5"/>')
            if electrons == "ud":
                bx = cx
                ps.append(f'<line x1="{bx-6}" y1="{y-14}" x2="{bx-6}" y2="{y-2}" stroke="{INK}" stroke-width="1.8"/>')
                ps.append(f'<polygon points="{bx-6},{y-14} {bx-9},{y-8} {bx-3},{y-8}" fill="{INK}"/>')
                ps.append(f'<line x1="{bx+6}" y1="{y-2}" x2="{bx+6}" y2="{y-14}" stroke="{INK}" stroke-width="1.8"/>')
                ps.append(f'<polygon points="{bx+6},{y-2} {bx+3},{y-8} {bx+9},{y-8}" fill="{INK}"/>')
            elif electrons == "":
                pass
        return ps

    # Draw O2 filling
    y_sigma_star = 100
    y_pi_star = 150
    y_pi = 230
    y_sigma_p = 290
    y_sigma_s_star = 350
    y_sigma_s = 400

    parts += mo_line(y_sigma_star, "σ*2p", "", False)
    parts += mo_line(y_pi_star, "π*2p", "uu", True)
    parts += mo_line(y_pi, "π2p", "udud", True)
    parts += mo_line(y_sigma_p, "σ2p", "ud", False)
    parts += mo_line(y_sigma_s_star, "σ*2s", "ud", False)
    parts += mo_line(y_sigma_s, "σ2s", "ud", False)

    parts.append(text(cx, 440, "BO = ½(8−4) = 2", 13, weight="bold"))
    parts.append(text(cx, 458, "paramagnetic", 12, RED))

    # Right panel: O2+ and O2-
    rx = 480
    parts.append(text(rx, 80, "Compare ions", 13, weight="bold"))
    parts.append(text(rx, 110, "O₂⁺: remove 1 e⁻ from π*", 12, anchor="middle"))
    parts.append(text(rx, 130, "→ 1 unpaired; BO = 2.5", 12, ACCENT))
    parts.append(text(rx, 170, "O₂⁻: add 1 e⁻ to π*", 12))
    parts.append(text(rx, 190, "→ 1 unpaired; BO = 1.5", 12, ACCENT))
    parts.append(text(rx, 240, "Bond length:", 12, weight="bold"))
    parts.append(text(rx, 260, "O₂⁺ < O₂ < O₂⁻", 13))
    parts.append(text(rx, 300, "Bonding MOs below;", 11, MUTED))
    parts.append(text(rx, 318, "antibonding (* ) above.", 11, MUTED))
    parts.append(text(rx, 350, "For O₂/F₂: σ2p < π2p", 12, weight="bold"))
    parts.append(text(rx, 370, "(unlike B₂/C₂/N₂).", 11, MUTED))

    # energy arrow
    parts.append(f'<line x1="40" y1="400" x2="40" y2="90" stroke="{INK}" stroke-width="1.5"/>')
    parts.append(f'<polygon points="40,82 36,92 44,92" fill="{INK}"/>')
    parts.append(text(28, 85, "E", 13, weight="bold", anchor="middle"))

    save(sid, svg_wrap(w, h, "\n".join(parts), "Molecular orbital diagram for O2 O2+ and O2-"), w, h)
    return sid

# ───────────────────────── pentane vs neopentane ─────────────────────────
def sketch_pentane_neopentane():
    sid = "pentane-neopentane"
    w, h = 560, 300
    parts = [text(280, 24, "Shape and dispersion: pentane vs neopentane", 15, weight="bold")]

    # Use chemsketch-like carbon skeleton in SVG
    # n-pentane zigzag
    parts.append(text(140, 55, "n-pentane (straight chain)", 13, weight="bold"))
    pts = [(40, 140), (80, 100), (120, 140), (160, 100), (200, 140)]
    for i in range(len(pts) - 1):
        x1, y1 = pts[i]; x2, y2 = pts[i + 1]
        parts.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>')
    for x, y in pts:
        parts.append(f'<circle cx="{x}" cy="{y}" r="5" fill="{INK}"/>')
    parts.append(text(120, 180, "more surface contact", 12, MUTED))
    parts.append(text(120, 198, "→ stronger London forces", 12, ACCENT))
    parts.append(text(120, 216, "→ higher boiling point", 12, ACCENT))

    # neopentane = 2,2-dimethylpropane: central C with 4 methyls
    parts.append(text(420, 55, "neopentane (branched)", 13, weight="bold"))
    cx, cy = 420, 130
    arms = [(420, 70), (420, 190), (360, 130), (480, 130)]
    for ax, ay in arms:
        parts.append(f'<line x1="{cx}" y1="{cy}" x2="{ax}" y2="{ay}" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>')
        parts.append(f'<circle cx="{ax}" cy="{ay}" r="5" fill="{INK}"/>')
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="5" fill="{INK}"/>')
    parts.append(text(420, 220, "compact / less surface", 12, MUTED))
    parts.append(text(420, 238, "→ weaker dispersion", 12, RED))
    parts.append(text(420, 256, "→ lower boiling point", 12, RED))

    parts.append(text(280, 285, "Same formula C₅H₁₂; branching lowers bp because of weaker London contacts.", 12, MUTED))
    save(sid, svg_wrap(w, h, "\n".join(parts), "Pentane chain versus compact neopentane"), w, h)
    return sid

# ───────────────────────── Zn + Cu2+ electron transfer ─────────────────────────
def sketch_zn_cu2_transfer():
    sid = "zn-cu2-electron-transfer"
    w, h = 520, 280
    parts = [text(260, 24, "Electron transfer: Zn + Cu²⁺ → Zn²⁺ + Cu", 15, weight="bold")]

    # Zn metal
    parts.append(f'<rect x="40" y="80" width="100" height="80" rx="8" fill="#B0BEC5" stroke="{INK}" stroke-width="2"/>')
    parts.append(text(90, 125, "Zn(s)", 16, weight="bold"))
    parts.append(text(90, 185, "reducing agent", 12, MUTED))
    parts.append(text(90, 202, "(oxidized)", 12, RED))

    # arrow e-
    parts.append(f'<defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="{BLUE}"/></marker></defs>')
    parts.append(f'<line x1="160" y1="110" x2="240" y2="110" stroke="{BLUE}" stroke-width="2.5" marker-end="url(#arr)"/>')
    parts.append(text(200, 100, "2 e⁻", 13, BLUE, weight="bold"))

    # Cu2+
    parts.append(f'<circle cx="300" cy="120" r="36" fill="#BBDEFB" stroke="{BLUE}" stroke-width="2"/>')
    parts.append(text(300, 115, "Cu²⁺", 16, BLUE, weight="bold"))
    parts.append(text(300, 135, "(aq)", 12, MUTED))
    parts.append(text(300, 185, "oxidizing agent", 12, MUTED))
    parts.append(text(300, 202, "(reduced)", 12, ACCENT))

    # products
    parts.append(text(260, 240, "Products: Zn²⁺(aq) + Cu(s)", 14, weight="bold"))
    parts.append(text(260, 262, "Oxidation: Zn → Zn²⁺ + 2 e⁻    Reduction: Cu²⁺ + 2 e⁻ → Cu", 12, MUTED))
    save(sid, svg_wrap(w, h, "\n".join(parts), "Electron transfer from zinc metal to copper(II) ions"), w, h)
    return sid

# ───────────────────────── Ag(NH3)2+ ─────────────────────────
def sketch_ag_nh3_2():
    sid = "ag-nh3-2-complex"
    w, h = 460, 280
    parts = [text(230, 24, "[Ag(NH₃)₂]⁺ — linear complex", 15, weight="bold")]

    ax, ay = 230, 130
    ar, nr, hr = 22, 18, 10
    nL, nR = (ax - 120, ay), (ax + 120, ay)
    # Ag–N bonds to edges
    parts.append(edge_bond(ax, ay, ar, *nL, nr, width=2.5))
    parts.append(edge_bond(ax, ay, ar, *nR, nr, width=2.5))
    # N–H bonds
    for nx, ny in (nL, nR):
        if nx < ax:
            hpos = [(nx - 30, ny - 24), (nx - 30, ny + 24), (nx - 40, ny)]
        else:
            hpos = [(nx + 30, ny - 24), (nx + 30, ny + 24), (nx + 40, ny)]
        for hx, hy in hpos:
            parts.append(edge_bond(nx, ny, nr, hx, hy, hr, width=1.5))
    parts.append(atom_circle(ax, ay, ar, "#F5F5F5", INK, "Ag", INK, 16))
    parts.append(text(ax + 30, ay - 22, "+", 16, RED, weight="bold"))
    for nx, ny in (nL, nR):
        parts.append(atom_circle(nx, ny, nr, "#BBDEFB", NBLUE, "N", NBLUE, 15))
        if nx < ax:
            hpos = [(nx - 30, ny - 24), (nx - 30, ny + 24), (nx - 40, ny)]
        else:
            hpos = [(nx + 30, ny - 24), (nx + 30, ny + 24), (nx + 40, ny)]
        for hx, hy in hpos:
            parts.append(atom_circle(hx, hy, hr, "#FAFAFA", INK, "H", INK, 10))

    parts.append(text(230, 205, "H₃N → Ag⁺ ← NH₃", 13, MUTED))
    parts.append(text(230, 228, "Coordination number 2; linear (sp hybridization on Ag⁺)", 12, MUTED))
    parts.append(text(230, 255, "N blue. Ligands donate lone pairs to Ag⁺ (coordinate covalent bonds).", 11, MUTED))
    save(sid, svg_wrap(w, h, "\n".join(parts), "Linear diamminesilver(I) complex ion"), w, h)
    return sid

def sketch_galvanic_zn_cu():
    sid = "galvanic-zn-cu"
    w, h = 620, 450
    parts = [text(310, 18, "Zn | Zn²⁺ || Cu²⁺ | Cu  galvanic cell", 15, weight="bold")]
    parts.append(text(310, 36, "E°_cell = 1.10 V   ·   anode = oxidation (Zn)   ·   cathode = reduction (Cu)", 11, MUTED))

    # beakers lower to leave headroom for wire
    parts.append(f'<rect x="50" y="160" width="170" height="170" rx="4" fill="#F5F5F5" stroke="{INK}" stroke-width="2"/>')
    parts.append(f'<rect x="400" y="160" width="170" height="170" rx="4" fill="#BBDEFB" stroke="{INK}" stroke-width="2"/>')
    parts.append(text(135, 310, "Zn²⁺(aq)", 13, MUTED))
    parts.append(text(485, 310, "Cu²⁺(aq)", 13, BLUE))

    parts.append(f'<rect x="115" y="140" width="20" height="150" fill="#90A4AE" stroke="{INK}" stroke-width="1.5"/>')
    parts.append(text(90, 152, "Zn", 13, weight="bold", anchor="end"))
    parts.append(f'<rect x="475" y="140" width="20" height="150" fill="#FF8A65" stroke="{INK}" stroke-width="1.5"/>')
    parts.append(text(520, 152, "Cu", 13, weight="bold", anchor="start"))

    # wire + voltmeter in clear band between subtitle and salt bridge
    parts.append(f'<path d="M 125 140 L 125 78 L 310 78 L 485 78 L 485 140" fill="none" stroke="{INK}" stroke-width="2"/>')
    parts.append(f'<circle cx="310" cy="78" r="16" fill="{BG}" stroke="{INK}" stroke-width="2"/>')
    parts.append(text(310, 83, "V", 13, weight="bold"))
    parts.append(f'<defs><marker id="earr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><polygon points="0 0, 7 3, 0 6" fill="{BLUE}"/></marker></defs>')
    # e- arrow BELOW the wire, clear of subtitle
    parts.append(f'<line x1="160" y1="98" x2="260" y2="98" stroke="{BLUE}" stroke-width="2" marker-end="url(#earr)"/>')
    parts.append(text(205, 92, "e⁻", 12, BLUE, weight="bold"))

    # salt bridge — ends inside beakers, label in gap above arch / below wire
    parts.append(f'<path d="M 220 210 C 255 210, 255 145, 310 145 C 365 145, 365 210, 400 210" fill="none" stroke="#8D6E63" stroke-width="14" stroke-linecap="round"/>')
    parts.append(f'<path d="M 220 210 C 255 210, 255 145, 310 145 C 365 145, 365 210, 400 210" fill="none" stroke="#D7CCC8" stroke-width="8" stroke-linecap="round"/>')
    parts.append(text(310, 132, "salt bridge", 11, MUTED))

    parts.append(text(135, 370, "ANODE (−)", 14, RED, weight="bold"))
    parts.append(text(135, 390, "Zn → Zn²⁺ + 2 e⁻", 12))
    parts.append(text(135, 408, "oxidation", 12, MUTED))

    parts.append(text(485, 370, "CATHODE (+)", 14, ACCENT, weight="bold"))
    parts.append(text(485, 390, "Cu²⁺ + 2 e⁻ → Cu", 12))
    parts.append(text(485, 408, "reduction", 12, MUTED))

    parts.append(text(310, 438, "E° = E°(Cu²⁺/Cu) − E°(Zn²⁺/Zn) = 0.34 − (−0.76) = +1.10 V", 12, weight="bold"))
    save(sid, svg_wrap(w, h, "\n".join(parts), "Zinc copper galvanic cell with salt bridge and electron flow"), w, h)
    return sid

def sketch_homo_lumo():
    sid = "homo-lumo-conjugation"
    w, h = 560, 360
    parts = [text(280, 24, "HOMO–LUMO gap shrinks with conjugation", 15, weight="bold")]

    molecules = [
        ("ethene", "H₂C=CH₂", 100, 80, 0.9),
        ("butadiene", "H₂C=CH−CH=CH₂", 280, 55, 0.55),
        ("hexatriene", "H₂C=CH−CH=CH−CH=CH₂", 460, 35, 0.35),
    ]
    base_y = 280
    for name, formula, x, gap_px, _ in molecules:
        # HOMO level
        homo_y = base_y
        lumo_y = base_y - gap_px - 40
        # Actually use gap_px as the visual gap
        gap = {"ethene": 140, "butadiene": 95, "hexatriene": 55}[name]
        homo_raise = {"ethene": 0, "butadiene": 18, "hexatriene": 32}[name]
        homo_y = 260 - homo_raise
        lumo_y = homo_y - gap
        parts.append(f'<line x1="{x-40}" y1="{homo_y}" x2="{x+40}" y2="{homo_y}" stroke="{BLUE}" stroke-width="3"/>')
        parts.append(f'<line x1="{x-40}" y1="{lumo_y}" x2="{x+40}" y2="{lumo_y}" stroke="{RED}" stroke-width="3"/>')
        # electrons in HOMO
        parts.append(f'<line x1="{x-8}" y1="{homo_y-16}" x2="{x-8}" y2="{homo_y-4}" stroke="{INK}" stroke-width="1.8"/>')
        parts.append(f'<polygon points="{x-8},{homo_y-16} {x-11},{homo_y-10} {x-5},{homo_y-10}" fill="{INK}"/>')
        parts.append(f'<line x1="{x+8}" y1="{homo_y-4}" x2="{x+8}" y2="{homo_y-16}" stroke="{INK}" stroke-width="1.8"/>')
        parts.append(f'<polygon points="{x+8},{homo_y-4} {x+5},{homo_y-10} {x+11},{homo_y-10}" fill="{INK}"/>')
        # gap arrow
        mid = (homo_y + lumo_y) / 2
        parts.append(f'<line x1="{x+50}" y1="{lumo_y}" x2="{x+50}" y2="{homo_y}" stroke="{MUTED}" stroke-width="1.5"/>')
        parts.append(text(x + 58, mid + 4, "ΔE", 11, MUTED, anchor="start"))
        parts.append(text(x, lumo_y - 12, "LUMO", 11, RED, weight="bold"))
        parts.append(text(x, homo_y + 18, "HOMO", 11, BLUE, weight="bold"))
        parts.append(text(x, 300, name, 13, weight="bold"))
        parts.append(text(x, 318, formula, 11, MUTED))

    # arrow showing trend
    parts.append(f'<defs><marker id="tr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="{ACCENT}"/></marker></defs>')
    parts.append(f'<line x1="140" y1="340" x2="420" y2="340" stroke="{ACCENT}" stroke-width="2" marker-end="url(#tr)"/>')
    parts.append(text(280, 355, "more conjugation → smaller gap → longer λ_max", 12, ACCENT))

    save(sid, svg_wrap(w, h, "\n".join(parts), "HOMO LUMO gap decreasing from ethene to hexatriene"), w, h)
    return sid


ALT = {
    "fe56-fe3-nucleus": "Diagram of an iron-56 Fe3+ ion: nucleus with 26 protons and 30 neutrons, and an electron cloud with 23 electrons after losing three.",
    "h-bohr-levels": "Bohr energy-level diagram for hydrogen showing n=1, 2, 3 and infinity, with a red emission arrow for the Balmer n=3 to n=2 photon at 656 nm.",
    "orbital-shapes-1s-2p-3d": "Schematic orbital shapes: spherical 1s, dumbbell 2p with plus and minus lobes, and a four-leaf 3d clover (dx2−y2 style).",
    "orbital-boxes-c-n": "Orbital box diagrams for carbon (1s2 2s2 2p2 with two unpaired 2p electrons) and nitrogen (1s2 2s2 2p3 with three unpaired 2p electrons) illustrating Hund’s rule.",
    "orbital-boxes-cr-fe3": "Orbital box diagrams for chromium as [Ar] 3d5 4s1 with six unpaired electrons, and for Fe3+ as [Ar] 3d5 with five unpaired 3d electrons.",
    "unpaired-ca-zn2-fe2": "Orbital boxes showing Ca ([Ar] 4s2) and Zn2+ ([Ar] 3d10) with zero unpaired electrons (diamagnetic), and Fe2+ ([Ar] 3d6) with four unpaired electrons (paramagnetic).",
    "lewis-h2o-co2-sf4": "Lewis structures of H2O (bent, two lone pairs on oxygen), CO2 (linear O=C=O), and SF4 (sulfur with four F bonds and one lone pair); all formal charges zero.",
    "vsepr-sf4-seesaw": "Three-dimensional seesaw shape of SF4 from trigonal bipyramidal electron geometry with an equatorial lone pair, and a net dipole arrow showing the molecule is polar.",
    "hybrid-ethene-ethyne": "Hybridization sketch of ethene (sp2 carbons, one sigma and one pi bond) beside ethyne (sp carbons, one sigma and two pi bonds), with sigma in blue and pi in red.",
    "mo-o2": "Molecular orbital energy diagram for O2 with sigma 2p below pi 2p, two unpaired electrons in pi-star, bond order 2 and paramagnetism; notes compare O2+ (BO 2.5) and O2− (BO 1.5).",
    "pentane-neopentane": "Side-by-side carbon skeletons of straight-chain n-pentane and compact neopentane (2,2-dimethylpropane), noting that more surface contact raises boiling point via stronger London forces.",
    "zn-cu2-electron-transfer": "Simple redox sketch: zinc metal donates two electrons to aqueous Cu2+, labeling Zn as the reducing agent (oxidized) and Cu2+ as the oxidizing agent (reduced).",
    "ag-nh3-2-complex": "Linear [Ag(NH3)2]+ complex with silver at the center and two ammine ligands, overall charge +1, coordination number 2.",
    "galvanic-zn-cu": "Galvanic cell Zn|Zn2+||Cu2+|Cu with zinc anode (oxidation), copper cathode (reduction), salt bridge, electron flow through the wire toward copper, and E° cell = 1.10 V.",
    "homo-lumo-conjugation": "Qualitative HOMO–LUMO gaps for ethene, butadiene, and hexatriene showing the gap shrinking as conjugation lengthens, which shifts absorption to longer wavelength.",
}

MANIFEST_ROWS = []

def main():
    builders = [
        sketch_fe56_fe3_nucleus,
        sketch_h_bohr_levels,
        sketch_orbital_shapes,
        sketch_orbital_boxes_c_n,
        sketch_orbital_boxes_cr_fe3,
        sketch_unpaired_ca_zn_fe,
        sketch_lewis_h2o_co2_sf4,
        sketch_vsepr_sf4_seesaw,
        sketch_hybrid_ethene_ethyne,
        sketch_mo_o2,
        sketch_pentane_neopentane,
        sketch_zn_cu2_transfer,
        sketch_ag_nh3_2,
        sketch_galvanic_zn_cu,
        sketch_homo_lumo,
    ]
    ids = []
    for fn in builders:
        sid = fn()
        ids.append(sid)

    (OUT / "alt.json").write_text(json.dumps(ALT, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    notes = {
        "fe56-fe3-nucleus": "Nuclear diagram of ⁵⁶Fe³⁺ (26 p, 30 n, 23 e⁻)",
        "h-bohr-levels": "H Bohr levels n=1,2,3 with Balmer n=3→2",
        "orbital-shapes-1s-2p-3d": "Schematic 1s, 2p, 3d orbital shapes",
        "orbital-boxes-c-n": "Orbital boxes for C and N (Hund’s rule)",
        "orbital-boxes-cr-fe3": "Orbital boxes for Cr ([Ar]3d⁵4s¹) and Fe³⁺ ([Ar]3d⁵)",
        "unpaired-ca-zn2-fe2": "Unpaired e⁻ for Ca (0), Zn²⁺ (0), Fe²⁺ (4)",
        "lewis-h2o-co2-sf4": "Lewis structures H₂O, CO₂, SF₄ with lone pairs",
        "vsepr-sf4-seesaw": "SF₄ seesaw VSEPR shape with dipole",
        "hybrid-ethene-ethyne": "Ethene sp² / ethyne sp with σ and π",
        "mo-o2": "O₂ MO diagram (σ2p below π2p); O₂⁺/O₂⁻ notes",
        "pentane-neopentane": "n-Pentane vs neopentane skeletons",
        "zn-cu2-electron-transfer": "Zn + Cu²⁺ electron transfer",
        "ag-nh3-2-complex": "Linear [Ag(NH₃)₂]⁺",
        "galvanic-zn-cu": "Zn|Zn²⁺||Cu²⁺|Cu cell, E° 1.10 V",
        "homo-lumo-conjugation": "HOMO–LUMO gap vs conjugation length",
    }
    lines = ["# Chem Practice art manifest\n", "Original educational sketches for pending-sketch reading figures.\n",
             "App Maker did not put `id` fields on figures in readings.json; these kebab-case ids map 1:1 to the 15 pending-sketch notes (in readings order).\n",
             "| id | files | shows |\n|---|---|---|\n"]
    for sid in ids:
        lines.append(f"| `{sid}` | `{sid}.svg`, `{sid}.png` | {notes[sid]} |\n")
    lines.append("\n## Mapping to readings.json pending-sketch notes\n")
    mapping = [
        ("fe56-fe3-nucleus", "Nuclear diagram of ⁵⁶Fe³⁺..."),
        ("h-bohr-levels", "Energy-level diagram for H..."),
        ("orbital-shapes-1s-2p-3d", "Shapes of 1s, 2p, and 3d orbitals..."),
        ("orbital-boxes-c-n", "Orbital box diagram for C and for N..."),
        ("orbital-boxes-cr-fe3", "Orbital box diagrams for Cr ... and Fe³⁺..."),
        ("unpaired-ca-zn2-fe2", "Orbital box diagrams for Ca, Zn²⁺, and Fe²⁺..."),
        ("lewis-h2o-co2-sf4", "Lewis structures for H₂O, CO₂, and SF₄..."),
        ("vsepr-sf4-seesaw", "VSEPR shape of SF₄ (seesaw)..."),
        ("hybrid-ethene-ethyne", "Hybridization sketch for ethene ... and ethyne..."),
        ("mo-o2", "MO energy diagram for O₂, O₂⁺, and O₂⁻..."),
        ("pentane-neopentane", "Side-by-side sketches of pentane ... vs neopentane..."),
        ("zn-cu2-electron-transfer", "Simple electron-transfer sketch: Zn metal and Cu²⁺..."),
        ("ag-nh3-2-complex", "Schematic of Ag(NH₃)₂⁺ complex"),
        ("galvanic-zn-cu", "Zn|Zn²⁺||Cu²⁺|Cu galvanic cell..."),
        ("homo-lumo-conjugation", "HOMO–LUMO gap sketch for short vs long conjugated chain"),
    ]
    for sid, note in mapping:
        lines.append(f"- `{sid}` ← {note}\n")
    (OUT / "manifest.md").write_text("".join(lines), encoding="utf-8")
    print("DONE", len(ids), "sketches")

if __name__ == "__main__":
    main()
