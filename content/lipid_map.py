"""The master map of lipid metabolism for the Mastering Hyperlipidemia Management course.

Drawn with plain SVG presentation attributes (no inline style) so it passes the site's
Content Security Policy. Magenta pills mark where a drug acts.
"""
from html import escape as _e

INK, PILL, PILL_LINE = "#0F2B2C", "#FCE4EC", "#C2185B"
_out = []


def _rect(x, y, w, h, fill="#fff", stroke=INK, rx=6, dash=None):
    d = ' stroke-dasharray="%s"' % dash if dash else ""
    _out.append('<rect x="%g" y="%g" width="%g" height="%g" rx="%g" fill="%s" stroke="%s" stroke-width="1.4"%s/>' % (x, y, w, h, rx, fill, stroke, d))


def _text(x, y, s, size=11.5, weight="400", fill=INK, anchor="middle"):
    _out.append('<text x="%g" y="%g" font-size="%g" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, size, weight, fill, anchor, _e(s)))


def _node(x, y, w, s, h=28, fill="#fff", stroke=INK):
    _rect(x, y, w, h, fill, stroke)
    _text(x + w / 2, y + h / 2 + 4, s)


def _drug(x, y, w, s, h=26):
    _rect(x, y, w, h, PILL, PILL_LINE, rx=13)
    _text(x + w / 2, y + h / 2 + 4, s, size=11, weight="600", fill="#8E0F43")


def _arrow(d, label=None, lx=0, ly=0):
    _out.append('<path d="%s" fill="none" stroke="%s" stroke-width="1.5" marker-end="url(#lm-arr)"/>' % (d, INK))
    if label:
        _text(lx, ly, label, size=10.5, fill="#3D5556")


def _build():
    _out.append('<rect x="0" y="0" width="1000" height="700" fill="#fff"/>')
    # legend
    _drug(20, 12, 70, "Drug")
    _text(98, 29, "= where a medicine acts. Arrows follow cholesterol and triglyceride.", size=11, anchor="start")
    # small intestine
    _rect(20, 50, 300, 260, "#E2F2EB", "#3E9C7B", rx=10)
    _text(170, 72, "SMALL INTESTINE (enterocyte)", 12, "700")
    _node(36, 86, 176, "Diet + bile cholesterol")
    _node(36, 128, 176, "NPC1L1 takes it up")
    _drug(222, 129, 88, "Ezetimibe")
    _node(36, 170, 176, "MTP adds ApoB-48")
    _drug(222, 171, 88, "Lomitapide")
    _node(36, 212, 176, "Chylomicron (TG-rich)")
    _node(36, 262, 176, "Bile acids lost in stool")
    _drug(222, 263, 88, "Resins")
    for y in (114, 156, 198):
        _arrow("M124 %d V%d" % (y, y + 12))
    # blood
    _text(490, 72, "BLOOD (capillary wall)", 12, "700")
    _arrow("M212 226 H348", "via lymph", 266, 244)
    _rect(350, 196, 280, 60, "#FBF1D9", "#E0B43C")
    _text(490, 219, "Lipoprotein lipase (LPL)", 12.5, "700")
    _text(490, 240, "ApoC-II switches it on · ApoC-III, ANGPTL3 slow it", 11)
    _text(490, 276, "Fatty acids → muscle, fat, heart", 11, fill="#3D5556")
    _drug(350, 290, 135, "Fibrates (PPAR-α)")
    _drug(492, 290, 138, "Evinacumab (ANGPTL3)")
    _drug(350, 324, 280, "Olezarsen · Plozasiran (APOC3)")
    _arrow("M490 196 V130 H656", "Chylomicron remnant", 575, 122)
    # liver
    _rect(660, 50, 320, 400, "#E3EEF8", "#0F5FA8", rx=10)
    _text(820, 72, "LIVER (hepatocyte)", 12, "700")
    _node(676, 86, 182, "Citrate → acetyl-CoA (ACL)")
    _drug(866, 87, 104, "Bempedoic acid")
    _node(676, 128, 182, "HMG-CoA → mevalonate")
    _drug(866, 129, 104, "Statins")
    _node(676, 170, 182, "Cholesterol pool (SREBP-2)")
    _node(676, 212, 182, "MTP + ApoB-100 → VLDL")
    _drug(866, 213, 104, "Lomitapide")
    _node(676, 254, 182, "LDL receptor (LDLR)")
    _node(676, 296, 182, "PCSK9 destroys LDLR", fill="#F6E3E2", stroke="#A3423E")
    _drug(676, 338, 294, "PCSK9 antibodies: alirocumab, evolocumab")
    _drug(676, 372, 294, "Inclisiran (siRNA) · Enlicitide (oral)")
    _text(820, 420, "Most LDL-lowering drugs end by raising LDLR", 10.5, fill="#3D5556")
    for y in (114, 156, 198):
        _arrow("M767 %d V%d" % (y, y + 12))
    _arrow("M767 296 V284")
    # VLDL → IDL → LDL
    _arrow("M740 450 V500")
    _node(690, 502, 100, "VLDL", h=32, fill="#FBF1D9", stroke="#E0B43C")
    _arrow("M690 518 H592", "LPL", 641, 510)
    _node(490, 502, 100, "IDL", h=32, fill="#FBF1D9", stroke="#E0B43C")
    _arrow("M490 518 H392", "hepatic lipase", 441, 510)
    _node(290, 502, 100, "LDL", h=32, fill="#F6E3E2", stroke="#A3423E")
    _arrow("M340 502 V410 H645 V268 H674", "LDL cleared by LDLR", 500, 402)
    # artery
    _arrow("M290 518 H180 V572")
    _rect(30, 574, 300, 56, "#F6E3E2", "#A3423E")
    _text(180, 597, "ARTERY WALL", 12, "700")
    _text(180, 616, "ApoB particles trapped → plaque", 11)
    # Lp(a)
    _node(380, 582, 220, "Lp(a) = LDL-like particle + apo(a)", h=30)
    _arrow("M380 597 H332")
    _drug(350, 624, 280, "Pelacarsen · Olpasiran · Lepodisiran")
    _drug(350, 656, 280, "Muvalaplin (oral, apo(a) assembly)")
    # HDL
    _node(680, 582, 300, "HDL (ApoA-I): carries cholesterol back", h=30, fill="#E2F2EB", stroke="#3E9C7B")
    _arrow("M900 582 V452")
    _text(830, 636, "CETP swaps HDL cholesteryl ester for TG", 10.5, fill="#3D5556")
    _drug(756, 650, 150, "Obicetrapib (CETP)")


_build()
LIPID_MAP = (
    '<svg class="fig-svg" viewBox="0 0 1000 700" role="img" aria-labelledby="lm-title lm-desc">'
    '<title id="lm-title">Master map of lipid metabolism and drug action</title>'
    '<desc id="lm-desc">Dietary cholesterol enters the enterocyte through NPC1L1 (blocked by ezetimibe) and leaves in chylomicrons made with MTP and ApoB-48. '
    'Lipoprotein lipase in capillaries releases fatty acids; ApoC-III and ANGPTL3 slow it (targets of olezarsen, plozasiran and evinacumab; fibrates act through PPAR-alpha). '
    'Remnants return to the liver, which makes cholesterol (ACL blocked by bempedoic acid, HMG-CoA reductase by statins) and secretes VLDL, which becomes IDL and LDL. '
    'LDL is cleared by the LDL receptor, which PCSK9 destroys (antibodies, inclisiran, enlicitide). ApoB particles and Lp(a) enter the artery wall; HDL returns cholesterol and CETP (obicetrapib) exchanges lipids.</desc>'
    '<defs><marker id="lm-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="%s"/></marker></defs>'
    % INK + "\n".join(_out) + "</svg>"
)
del _out
