#!/usr/bin/env python3
"""
Publication Radar: collect new papers from PubMed and save them for the site.

Runs once a day on GitHub (see .github/workflows/radar.yml). Uses only
Python's standard library and the free PubMed E-utilities service.

Output: data/radar.js  (window.MLA_RADAR = {...})

  Global: MASLD / MASH (and obesity or GLP-1 drugs with the liver),
          added to PubMed in the last 90 days.
  MENA:   MASLD / MASH or obesity papers with at least one author in a
          Middle East and North Africa country, last 180 days.

Visitors' browsers never contact PubMed: the site only reads data/radar.js.

Run by hand:  python3 scripts/radar_fetch.py
Test offline: python3 scripts/radar_fetch.py --from-xml sample.xml
"""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "radar.js")
EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
TOOL = "MetabolicLiverAcademyRadar"
API_KEY = os.environ.get("NCBI_API_KEY", "")  # optional, allows faster requests

GLOBAL_DAYS = 90
MENA_DAYS = 180
GLOBAL_MAX = 1500
MENA_MAX = 1000

# ---------------------------------------------------------------- search terms
LIVER = ('("MASLD"[tiab] OR "MASH"[tiab] OR "NAFLD"[tiab] OR "NASH"[tiab] OR "MAFLD"[tiab] '
         'OR "steatotic liver"[tiab] OR "fatty liver"[tiab] OR "steatohepatitis"[tiab] '
         'OR "metabolic dysfunction-associated"[tiab] OR "hepatic steatosis"[tiab] OR resmetirom[tiab])')
OBESITY_LIVER = ('((obesity[tiab] OR obese[tiab] OR bariatric[tiab] OR "GLP-1"[tiab] OR semaglutide[tiab] '
                 'OR tirzepatide[tiab] OR incretin[tiab]) AND (liver[tiab] OR hepatic[tiab]))')
OBESITY = ('(obesity[tiab] OR obese[tiab] OR "anti-obesity"[tiab] OR bariatric[tiab] OR "weight loss"[tiab] '
           'OR semaglutide[tiab] OR tirzepatide[tiab] OR "GLP-1 receptor agonist"[tiab])')
EXCLUDE = (' NOT (case reports[pt] OR comment[pt] OR letter[pt] OR erratum[pt] OR editorial[pt] '
           'OR "published erratum"[pt] OR "retracted publication"[pt] OR preprint[pt]) '
           'NOT (animals[mh] NOT humans[mh])')

# Middle East and North Africa: names as they appear in author addresses
MENA = [
    ("Saudi Arabia", ["saudi arabia", "ksa", "riyadh", "jeddah", "dammam", "makkah", "madinah"]),
    ("Egypt", ["egypt", "cairo", "giza", "mansoura", "assiut", "minia"]),
    ("UAE", ["united arab emirates", "u.a.e", "uae", "dubai", "abu dhabi", "sharjah"]),
    ("Qatar", ["qatar", "doha"]),
    ("Kuwait", ["kuwait"]),
    ("Bahrain", ["bahrain", "manama"]),
    ("Oman", ["oman", "muscat"]),
    ("Jordan", ["jordan", "amman"]),
    ("Lebanon", ["lebanon", "beirut"]),
    ("Iraq", ["iraq", "baghdad"]),
    ("Syria", ["syria", "damascus"]),
    ("Palestine", ["palestine", "gaza", "west bank"]),
    ("Yemen", ["yemen", "sana'a", "sanaa"]),
    ("Iran", ["iran", "tehran"]),
    ("Türkiye", ["turkey", "türkiye", "turkiye", "istanbul", "ankara", "izmir"]),
    ("Morocco", ["morocco", "rabat", "casablanca"]),
    ("Algeria", ["algeria", "algiers"]),
    ("Tunisia", ["tunisia", "tunis"]),
    ("Libya", ["libya", "benghazi"]),
    ("Sudan", ["sudan", "khartoum"]),
]
MENA_QUERY = "(" + " OR ".join('"%s"[ad]' % w for _, words in MENA for w in words if w != "u.a.e") + ")"

# Other countries, for the country tag on global papers (first author)
OTHER = [
    ("USA", ["usa", "united states", "u.s.a"]), ("UK", ["united kingdom", "uk", "england", "scotland", "wales"]),
    ("China", ["china", "p.r. china", "prc"]), ("Hong Kong", ["hong kong"]), ("Taiwan", ["taiwan"]),
    ("Japan", ["japan"]), ("South Korea", ["korea"]), ("India", ["india"]), ("Pakistan", ["pakistan"]),
    ("Italy", ["italy"]), ("Spain", ["spain"]), ("France", ["france"]), ("Germany", ["germany"]),
    ("Netherlands", ["netherlands"]), ("Belgium", ["belgium"]), ("Switzerland", ["switzerland"]),
    ("Austria", ["austria"]), ("Sweden", ["sweden"]), ("Denmark", ["denmark"]), ("Norway", ["norway"]),
    ("Finland", ["finland"]), ("Poland", ["poland"]), ("Greece", ["greece"]), ("Portugal", ["portugal"]),
    ("Romania", ["romania"]), ("Russia", ["russia"]), ("Israel", ["israel"]), ("Canada", ["canada"]),
    ("Mexico", ["mexico"]), ("Brazil", ["brazil"]), ("Argentina", ["argentina"]), ("Chile", ["chile"]),
    ("Australia", ["australia"]), ("New Zealand", ["new zealand"]), ("Singapore", ["singapore"]),
    ("Malaysia", ["malaysia"]), ("Thailand", ["thailand"]), ("Vietnam", ["vietnam", "viet nam"]),
    ("Indonesia", ["indonesia"]), ("Philippines", ["philippines"]), ("Bangladesh", ["bangladesh"]),
    ("Nigeria", ["nigeria"]), ("South Africa", ["south africa"]), ("Ireland", ["ireland"]),
]

# ---------------------------------------------------------------- tagging
TYPE_ORDER = [  # first match wins
    ("guideline", {"practice guideline", "guideline", "consensus development conference"}),
    ("meta", {"meta-analysis", "systematic review"}),
    ("rct", {"randomized controlled trial"}),
    ("trial", {"clinical trial", "clinical trial, phase i", "clinical trial, phase ii",
               "clinical trial, phase iii", "clinical trial, phase iv", "controlled clinical trial"}),
    ("review", {"review", "scoping review"}),
    ("obs", {"observational study", "multicenter study", "comparative study"}),
]
TOPICS = [
    ("masld", r"\b(masld|mash|nafld|nash|mafld|steatotic|steatohepatitis|steatosis|fatty liver|metabolic dysfunction)"),
    ("obesity", r"\b(obes|weight loss|weight-loss|bariatric|adipos|body mass|overweight)"),
    ("drugs", r"\b(glp-1|glp1|semaglutide|tirzepatide|retatrutide|survodutide|cagrilintide|orforglipron|resmetirom|"
              r"lanifibranor|efruxifermin|pegozafermin|incretin|sglt2|sglt-2|pioglitazone|fgf21|metformin|statin|agonist)"),
    ("fibrosis", r"\b(fib-4|fib4|elastograph|fibroscan|vcte|transient elastography|enhanced liver fibrosis|"
                 r"non-invasive|noninvasive|fibrosis|stiffness|agile)"),
    ("cancer", r"\b(hepatocellular|hcc|cirrhosis|liver cancer)"),
    ("heart", r"\b(cardiovascular|cardiac|heart|atherosclero|coronary)"),
    ("children", r"\b(child|children|pediatric|paediatric|adolescen|youth)"),
    ("ai", r"\b(artificial intelligence|machine learning|deep learning|large language model|neural network)"),
]
TOPICS = [(k, re.compile(p, re.I)) for k, p in TOPICS]


def text(el):
    return re.sub(r"\s+", " ", "".join(el.itertext())).strip() if el is not None else ""


def find_countries(aff_text, table):
    found = []
    low = " " + aff_text.lower() + " "
    for name, words in table:
        for w in words:
            if re.search(r"(?<![a-z])" + re.escape(w) + r"(?![a-z])", low):
                found.append(name)
                break
    return found


def parse_article(art):
    """One <PubmedArticle> -> dict, or None."""
    mc = art.find("MedlineCitation")
    if mc is None:
        return None
    pmid = text(mc.find("PMID"))
    a = mc.find("Article")
    if a is None or not pmid:
        return None
    title = text(a.find("ArticleTitle")).rstrip(".")
    if not title:
        return None
    jr = a.find("Journal")
    journal = text(jr.find("ISOAbbreviation")) or text(jr.find("Title")) if jr is not None else ""

    # first author
    first = ""
    authors = a.findall("AuthorList/Author")
    if authors:
        x = authors[0]
        first = text(x.find("LastName"))
        ini = text(x.find("Initials"))
        if first and ini:
            first += " " + ini
        if not first:
            first = text(x.find("CollectiveName"))
        if first and len(authors) > 1:
            first += " et al."

    # affiliations: first author, then everyone
    def affs(au):
        return " ; ".join(text(f) for f in au.findall("AffiliationInfo/Affiliation"))
    first_aff = affs(authors[0]) if authors else ""
    all_aff = " ; ".join(affs(x) for x in authors)
    mena = find_countries(all_aff, MENA)
    first_country = (find_countries(first_aff, MENA) or find_countries(first_aff, OTHER) or [""])[0]

    # publication type
    pts = {text(p).lower() for p in a.findall("PublicationTypeList/PublicationType")}
    kind = "research"
    for key, names in TYPE_ORDER:
        if pts & names:
            kind = key
            break

    # date added to PubMed
    date = ""
    pd = art.find("PubmedData/History")
    if pd is not None:
        for status in ("pubmed", "entrez"):
            h = pd.find("PubMedPubDate[@PubStatus='%s']" % status)
            if h is not None:
                try:
                    date = "%04d-%02d-%02d" % (int(text(h.find("Year"))), int(text(h.find("Month"))), int(text(h.find("Day"))))
                except ValueError:
                    pass
                break

    doi = ""
    for aid in art.findall("PubmedData/ArticleIdList/ArticleId"):
        if aid.get("IdType") == "doi":
            doi = text(aid)
            break

    kw = " ".join(text(k) for k in mc.findall("KeywordList/Keyword"))
    mesh = " ".join(text(m) for m in mc.findall("MeshHeadingList/MeshHeading/DescriptorName"))
    hay = " ".join((title, kw, mesh))
    topics = [k for k, rx in TOPICS if rx.search(hay)]

    item = {"p": pmid, "d": date, "t": title, "j": journal, "a": first, "k": kind, "g": topics}
    if doi:
        item["doi"] = doi
    countries = []
    if first_country:
        countries.append(first_country)
    for c in mena:
        if c not in countries:
            countries.append(c)
    if countries:
        item["c"] = countries[:3]
    if mena:
        item["m"] = 1
    return item


def parse_xml(xml_bytes):
    root = ET.fromstring(xml_bytes)
    out = []
    for art in root.findall("PubmedArticle"):
        it = parse_article(art)
        if it:
            out.append(it)
    return out


# ---------------------------------------------------------------- PubMed calls
def call(endpoint, params):
    params = dict(params, tool=TOOL)
    if API_KEY:
        params["api_key"] = API_KEY
    data = urllib.parse.urlencode(params).encode()
    for attempt in range(4):
        try:
            req = urllib.request.Request(EUTILS + endpoint, data=data, headers={"User-Agent": TOOL})
            with urllib.request.urlopen(req, timeout=60) as r:
                body = r.read()
            time.sleep(0.12 if API_KEY else 0.4)  # stay under PubMed's rate limit
            return body
        except Exception as e:  # network hiccup: wait and retry
            print("  retry %d after error: %s" % (attempt + 1, e), file=sys.stderr)
            time.sleep(3 * (attempt + 1))
    raise RuntimeError("PubMed did not answer: " + endpoint)


def search(term, days, cap):
    r = json.loads(call("esearch.fcgi", {
        "db": "pubmed", "term": term, "reldate": days, "datetype": "edat",
        "retmax": cap, "retmode": "json", "sort": "pub_date"}))
    ids = r["esearchresult"].get("idlist", [])
    print("  found %s, using %d" % (r["esearchresult"].get("count"), len(ids)))
    return ids


def fetch(ids):
    items = []
    for i in range(0, len(ids), 200):
        chunk = ids[i:i + 200]
        items.extend(parse_xml(call("efetch.fcgi", {"db": "pubmed", "id": ",".join(chunk), "retmode": "xml"})))
    return items


# ---------------------------------------------------------------- main
def save(items):
    items.sort(key=lambda x: (x.get("d", ""), x["p"]), reverse=True)
    payload = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"),
        "globalDays": GLOBAL_DAYS, "menaDays": MENA_DAYS,
        "items": items,
    }
    body = ("/* Publication Radar data. Written automatically every day by scripts/radar_fetch.py.\n"
            "   Do not edit by hand: your changes would be replaced on the next update. */\n"
            "window.MLA_RADAR = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n")
    tmp = OUT + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(body)
    os.replace(tmp, OUT)
    print("Saved %d papers (%d MENA) to data/radar.js, %d KB"
          % (len(items), sum(1 for x in items if x.get("m")), len(body.encode()) // 1024))


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--from-xml":
        with open(sys.argv[2], "rb") as f:
            items = parse_xml(f.read())
        for it in items:
            it["w"] = 1
        save(items)
        return

    print("Global search (last %d days)" % GLOBAL_DAYS)
    g_ids = search("(" + LIVER + " OR " + OBESITY_LIVER + ")" + EXCLUDE, GLOBAL_DAYS, GLOBAL_MAX)
    print("MENA search (last %d days)" % MENA_DAYS)
    m_ids = search("(" + LIVER + " OR " + OBESITY + ") AND " + MENA_QUERY + EXCLUDE, MENA_DAYS, MENA_MAX)

    ids = list(dict.fromkeys(g_ids + m_ids))
    items = fetch(ids)
    m_set, g_set = set(m_ids), set(g_ids)
    for it in items:
        if it["p"] in g_set:
            it["w"] = 1  # belongs to the Global (worldwide) list
        if it["p"] in m_set:
            it["m"] = 1  # PubMed matched a MENA address even if our tagger missed it
        else:
            it.pop("m", None)  # MENA list = PubMed's MENA search only
    if len(items) < 20:
        raise SystemExit("Too few papers (%d). Keeping yesterday's list." % len(items))
    save(items)


if __name__ == "__main__":
    main()
