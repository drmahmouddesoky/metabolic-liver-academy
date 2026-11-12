"""Drawings for the Obesity Medicine course (presentation attributes only, so they pass the CSP)."""
from bowel_figs import _Svg, INK


def _diagnosis():
    s = _Svg()
    s.out.append('<rect x="0" y="0" width="1000" height="600" fill="#fff"/>')
    # step 1
    s.rect(150, 14, 700, 86, "#E3EEF8", "#0F5FA8")
    s.circle(186, 57, 20, "#0F5FA8", "1")
    s.text(220, 40, "Screen with BMI, and waist in people with BMI below 35", 13.5, "700", "#0F5FA8")
    s.text(220, 62, "Obesity: BMI ≥30 kg/m², or ≥27.5 kg/m² for people of Middle Eastern, South Asian,", 12)
    s.text(220, 82, "other Asian or Black ancestry (NICE). Waist-to-height ratio ≥0.5 = central adiposity.", 12)
    s.arrow("M500 100 V122")
    # step 2
    s.rect(150, 124, 700, 92, "#FBF1D9", "#E0B43C")
    s.circle(186, 170, 20, "#B8860B", "2")
    s.text(220, 150, "Confirm excess adiposity (BMI alone can mislead)", 13.5, "700", "#7A5A00")
    s.text(220, 172, "At least one more measure: waist circumference, waist-to-hip or waist-to-height ratio,", 12)
    s.text(220, 192, "or direct fat measurement (DEXA, bioimpedance). Can be assumed when BMI is very high.", 12)
    s.arrow("M500 216 V238")
    # step 3
    s.rect(150, 240, 700, 70, "#EFE9F7", "#7A5BB5")
    s.circle(186, 275, 20, "#7A5BB5", "3")
    s.text(220, 268, "Assess organ and tissue function and daily activities", 13.5, "700", "#5B3E96")
    s.text(220, 290, "Look for obesity-related organ dysfunction and limits on daily living (18 adult criteria).", 12)
    s.arrow("M380 310 V350")
    s.arrow("M620 310 V350")
    # outcomes
    s.rect(60, 352, 420, 150, "#E2F2EB", "#3E9C7B")
    s.text(270, 380, "PRECLINICAL OBESITY", 13.5, "700", "#2E7A5E", "middle")
    s.text(270, 406, "Excess adiposity; organs and daily", 12, anchor="middle")
    s.text(270, 426, "function preserved; higher future risk", 12, anchor="middle")
    s.text(270, 460, "Aim: reduce risk", 12.5, "700", anchor="middle")
    s.text(270, 482, "Health advice, monitoring, treatment if risk is high", 11.5, fill="#3D5556", anchor="middle")
    s.rect(520, 352, 420, 150, "#F6E3E2", "#A3423E")
    s.text(730, 380, "CLINICAL OBESITY", 13.5, "700", "#7A2420", "middle")
    s.text(730, 406, "Excess adiposity causing organ dysfunction", 12, anchor="middle")
    s.text(730, 426, "or limits on daily activities: a disease", 12, anchor="middle")
    s.text(730, 460, "Aim: treat", 12.5, "700", anchor="middle")
    s.text(730, 482, "Improve or reverse the dysfunction, as for any chronic illness", 11.5, fill="#3D5556", anchor="middle")
    s.text(500, 540, "Not confirmed in step 2 (for example high muscle mass): not obesity, whatever the BMI.", 12, fill="#3D5556", anchor="middle")
    s.text(500, 566, "Sources: Lancet Diabetes & Endocrinology Commission 2025; NICE NG246.", 11, fill="#5A6B6C", anchor="middle")
    return "\n".join(s.out)


OBESITY_DIAGNOSIS = (
    '<svg class="fig-svg" viewBox="0 0 1000 600" role="img" aria-labelledby="ob-title ob-desc">'
    '<title id="ob-title">Diagnosing obesity in three steps: clinical and preclinical obesity</title>'
    '<desc id="ob-desc">Step 1: screen with BMI (30 or more, or 27.5 or more for people of Middle Eastern, South Asian, other Asian or Black ancestry) '
    'and waist-to-height ratio. Step 2: confirm excess adiposity with another body measurement or direct fat measurement. Step 3: assess organ '
    'function and daily activities. Preclinical obesity means excess adiposity with preserved function, managed to reduce risk; clinical obesity '
    'means excess adiposity causing organ dysfunction or limits on daily activities, managed as a disease.</desc>'
    '<defs><marker id="bw-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
    '<path d="M0,0 L10,5 L0,10 z" fill="%s"/></marker></defs>' % INK + _diagnosis() + "</svg>"
)
