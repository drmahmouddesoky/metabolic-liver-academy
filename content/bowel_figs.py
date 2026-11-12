"""Drawings for the Bowel Health series (presentation attributes only, so they pass the CSP)."""
from html import escape as _e

INK = "#0F2B2C"


class _Svg:
    def __init__(self):
        self.out = []

    def rect(self, x, y, w, h, fill="#fff", stroke=INK, rx=8):
        self.out.append('<rect x="%g" y="%g" width="%g" height="%g" rx="%g" fill="%s" stroke="%s" stroke-width="1.4"/>' % (x, y, w, h, rx, fill, stroke))

    def text(self, x, y, s, size=12, weight="400", fill=INK, anchor="start"):
        self.out.append('<text x="%g" y="%g" font-size="%g" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, size, weight, fill, anchor, _e(s)))

    def circle(self, x, y, r, fill, label):
        self.out.append('<circle cx="%g" cy="%g" r="%g" fill="%s"/>' % (x, y, r, fill))
        self.text(x, y + 5, label, 14, "700", "#fff", "middle")

    def arrow(self, d):
        self.out.append('<path d="%s" fill="none" stroke="%s" stroke-width="1.5" marker-end="url(#bw-arr)"/>' % (d, INK))


def _ladder():
    s = _Svg()
    s.out.append('<rect x="0" y="0" width="1000" height="660" fill="#fff"/>')
    # entry
    s.rect(30, 16, 600, 54, "#E3EEF8", "#0F5FA8")
    s.text(330, 39, "Constipation for 3 months or more (Rome IV: onset at least 6 months ago)", 13, "700", anchor="middle")
    s.text(330, 59, "History · Bristol stool scale · red flags · medication review · digital rectal examination", 11.5, anchor="middle")
    s.arrow("M330 70 V92")
    # branches
    s.rect(660, 16, 310, 74, "#F6E3E2", "#A3423E")
    s.text(815, 38, "RED FLAGS", 12, "700", "#7A2420", "middle")
    s.text(815, 57, "Blood, anaemia, weight loss, new change after 50,", 11, anchor="middle")
    s.text(815, 74, "family history of colorectal cancer → investigate", 11, anchor="middle")
    s.arrow("M630 43 H656")
    s.rect(660, 106, 310, 74, "#FBF1D9", "#E0B43C")
    s.text(815, 128, "EVACUATION PROBLEM?", 12, "700", "#7A5A00", "middle")
    s.text(815, 147, "Prolonged straining, digital help, abnormal rectal", 11, anchor="middle")
    s.text(815, 164, "exam → anorectal manometry + balloon expulsion", 11, anchor="middle")
    s.arrow("M630 143 H656")
    steps = [
        ("1", "#3E9C7B", "#E2F2EB", "Diet and habits",
         "Psyllium >10 g/day · kiwifruit · prunes · rye bread · high-mineral water",
         "Regular toilet time after meals, feet on a stool; extra fluid alone does not help"),
        ("2", "#0F5FA8", "#E3EEF8", "Osmotic laxatives",
         "Polyethylene glycol (strong) · magnesium oxide (conditional; avoid in severe CKD)",
         "Lactulose if others fail (conditional; bloating)"),
        ("3", "#7A5BB5", "#EFE9F7", "Stimulant laxatives",
         "Bisacodyl or sodium picosulfate, short term or rescue (strong)",
         "Senna (conditional)"),
        ("4", "#C2185B", "#FCE4EC", "Prescription drugs",
         "Linaclotide · plecanatide · prucalopride (strong)",
         "Lubiprostone (conditional); elobixibat where licensed"),
        ("5", "#5A6B6C", "#EEF1F1", "Refractory: refer",
         "Re-check adherence and diagnosis; anorectal testing; colonic transit study",
         "Biofeedback for dyssynergia; specialist care (Course 3)"),
    ]
    y = 96
    for n, dark, light, title, l1, l2 in steps:
        s.rect(30, y, 600, 92, light, dark)
        s.circle(66, y + 46, 22, dark, n)
        s.text(102, y + 28, title, 14, "700", dark)
        s.text(102, y + 52, l1, 12)
        s.text(102, y + 74, l2, 12, fill="#3D5556")
        if n != "5":
            s.arrow("M330 %g V%g" % (y + 92, y + 108))
        y += 110
    s.text(660, 230, "Move up a step when the current one fails after", 11.5, fill="#3D5556")
    s.text(660, 248, "about 4 weeks at an adequate dose, or combine", 11.5, fill="#3D5556")
    s.text(660, 266, "steps (for example PEG plus a rescue stimulant).", 11.5, fill="#3D5556")
    s.text(660, 302, "Strength of recommendation: AGA–ACG 2023.", 11.5, fill="#3D5556")
    s.text(660, 320, "Foods and drinks: British Dietetic Association 2025.", 11.5, fill="#3D5556")
    return "\n".join(s.out)


CARE_LADDER = (
    '<svg class="fig-svg" viewBox="0 0 1000 660" role="img" aria-labelledby="bw-title bw-desc">'
    '<title id="bw-title">A stepwise pathway for chronic constipation in adults</title>'
    '<desc id="bw-desc">Assess first: history, stool form, red flags, medicines and a rectal examination. Red flags lead to investigation; '
    'symptoms of an evacuation problem lead to anorectal testing. Treatment then steps up: diet and habits; osmotic laxatives '
    '(polyethylene glycol, magnesium oxide, lactulose); stimulant laxatives (bisacodyl, sodium picosulfate, senna); prescription '
    'drugs (linaclotide, plecanatide, prucalopride, lubiprostone); and referral for refractory constipation.</desc>'
    '<defs><marker id="bw-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
    '<path d="M0,0 L10,5 L0,10 z" fill="%s"/></marker></defs>' % INK + _ladder() + "</svg>"
)
