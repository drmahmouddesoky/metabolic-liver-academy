"""Checks for the Publication Radar parser (no internet needed).
Run: python3 tests/test_radar.py
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "scripts"))
import radar_fetch as R  # noqa: E402

with open(os.path.join(HERE, "radar_sample.xml"), "rb") as f:
    items = R.parse_xml(f.read())

a, b = items
assert a["p"] == "11111111"
assert a["t"] == "Semaglutide for MASH with fibrosis: a randomized trial", a["t"]
assert a["j"] == "J Hepatol"
assert a["a"] == "Hassan MA et al."
assert a["k"] == "rct"
assert a["d"] == "2026-10-02"
assert a["doi"] == "10.1000/test.1"
assert a["c"] == ["Saudi Arabia", "Egypt"], a["c"]
assert a.get("m") == 1
assert "masld" in a["g"] and "drugs" in a["g"] and "fibrosis" in a["g"]

assert b["k"] == "meta"
assert b["j"] == "Hepatology"
assert b["a"] == "Woman A"
assert b["c"] == ["USA"], b["c"]          # "Women's" must not match "Oman"
assert "m" not in b
assert "fibrosis" in b["g"] and "doi" not in b

print("Radar parser: all checks passed")

# Every author's country is tagged, in author order (a real multi-country paper)
AFFS = ["Kansas City, MO, United States.", "Osmania Medical College, Hyderabad, India.",
        "Nishtar Medical University, Multan, Pakistan.", "Ain Shams University, Cairo, Egypt.",
        "Hadhramout University, Hadhramout, Yemen.", "Keele University, Stoke-on-Trent, United Kingdom.",
        "University of Sydney, Sydney, New South Wales, Australia.",
        "Dartmouth-Hitchcock Medical Center, Lebanon, NH, United States."]
authors = "".join("<Author><LastName>A%d</LastName><Initials>B</Initials><AffiliationInfo>"
                  "<Affiliation>%s</Affiliation></AffiliationInfo></Author>" % (i, x) for i, x in enumerate(AFFS))
xml = ("<PubmedArticleSet><PubmedArticle><MedlineCitation><PMID>33333333</PMID><Article>"
       "<Journal><Title>Test</Title></Journal><ArticleTitle>Obesity and MASLD</ArticleTitle>"
       "<AuthorList>" + authors + "</AuthorList></Article></MedlineCitation>"
       "<PubmedData></PubmedData></PubmedArticle></PubmedArticleSet>").encode()
c = R.parse_xml(xml)[0]
assert c["c"] == ["USA", "India", "Pakistan", "Egypt", "Yemen", "UK", "Australia"], c["c"]
assert c.get("m") == 1
print("Radar countries: all checks passed")

# Real addresses from the Radar audit (October 2026) that used to give a wrong or no country
for addr, want in [
    ("Selçuk University Faculty of Medicine, Konya, Turkey.", ["Türkiye"]),          # not UK
    ("School of Medicine, Royal College of Surgeons in Ireland, Busaiteen, Bahrain.", ["Bahrain"]),
    ("Medical Research Group of Egypt (MRGE), Arlington, Massachusetts, USA.", ["USA"]),
    ("Institute of Digestive Disease, Hong Kong SAR, China.", ["Hong Kong"]),
    ("China Medical University, Taichung, 40402, Taiwan", ["Taiwan"]),
    ("Prince of Wales Hospital, Sydney, New South Wales, Australia.", ["Australia"]),
    ("Erasmus MC, Rotterdam, The Netherlands. c.ghossein-doha@erasmusmc.nl.", ["Netherlands"]),  # not Qatar
    ("Coventry University, Jordan Well, Coventry, CV1 5RW, UK.", ["UK"]),            # not Jordan
    ("Georgetown University Medical Center, Washington, DC.", ["USA"]),
    ("NYU Grossman School of Medicine, New York, NY 10016.", ["USA"]),
    ("College of Medicine, Taibah University, Medina, SAU.", ["Saudi Arabia"]),
    ("Charles University, Prague, Czech Republic", ["Czech Republic"]),
    ("Ilia State University, Tbilisi, Georgia.", ["Georgia"]),
    ("Emory University, Atlanta, Georgia.", ["USA"]),
    ("University of Aleppo, Aleppo, Syrian Arab Republic.", ["Syria"]),
    ("Queen's University Belfast, Belfast, Northern Ireland.", ["UK"]),
    ("Turkey Creek Medical Center, Tennova Healthcare, Knoxville, TN.", ["USA"]),   # not Türkiye
    ("Geisel School of Medicine, Dartmouth College, Lebanon, New Hampshire.", ["USA"]),  # not Lebanon
    ("University College London, London, U.K.", ["UK"]),
    ("Kazakh National Medical University, Almaty, KAZ.", ["Kazakhstan"]),
]:
    assert R.address_countries(addr) == want, (addr, R.address_countries(addr))
print("Radar address rules: all checks passed")

# MENA list needs PubMed's MENA match AND a MENA author (or an unplaced address)
L = R.mark_lists([
    {"p": "1", "c": ["USA"]},                       # PubMed matched "Lebanon, New Hampshire": out
    {"p": "2", "c": ["USA", "Egypt"], "m": 1},      # real MENA author: in
    {"p": "3", "c": ["USA"], "_u": 1},              # an address with no country: kept, to be safe
    {"p": "4", "c": ["USA"]},                       # in the Global list only
], g_set={"4"}, m_set={"1", "2", "3"})
assert [(x["p"], x.get("m"), x.get("w")) for x in L] == [("2", 1, None), ("3", 1, None), ("4", None, 1)], L
assert all("_u" not in x for x in L)
print("Radar lists: all checks passed")

# The small "recent" file keeps only recent papers but the full tab totals
from datetime import datetime, timezone  # noqa: E402
payload = {"updated": "2026-10-17T07:00Z", "items": [
    {"p": "1", "d": "2026-10-10", "w": 1}, {"p": "2", "d": "2026-08-01", "w": 1, "m": 1}, {"p": "3", "d": "2026-09-20", "m": 1}]}
small = R.recent_payload(payload, datetime(2026, 10, 17, tzinfo=timezone.utc))
assert [x["p"] for x in small["items"]] == ["1", "3"], small["items"]
assert small["counts"] == {"global": 2, "mena": 2}, small["counts"]
assert len(payload["items"]) == 3   # the full list is not changed
print("Radar recent file: all checks passed")
