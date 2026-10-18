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
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "radar.js")
# A small file with only recent papers loads first, so the Radar page opens fast.
# The full list (data/radar.js) loads only when a visitor asks for older papers.
OUT_RECENT = os.path.join(ROOT, "data", "radar-recent.js")
RECENT_DAYS = 32   # the page opens on "30 days"
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
    ("Syria", ["syria", "syrian arab republic", "damascus", "aleppo"]),
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

# Other countries, so every author's country can be tagged
OTHER = [
    ("USA", ["usa", "united states", "u.s.a"]), ("UK", ["united kingdom", "uk", "great britain", "england", "scotland", "wales"]),
    ("China", ["china", "p.r. china", "prc"]), ("Hong Kong", ["hong kong"]), ("Taiwan", ["taiwan"]),
    ("Japan", ["japan"]), ("South Korea", ["korea"]), ("India", ["india"]), ("Pakistan", ["pakistan"]),
    ("Italy", ["italy"]), ("Spain", ["spain"]), ("France", ["france"]), ("Germany", ["germany"]),
    ("Netherlands", ["netherlands"]), ("Belgium", ["belgium"]), ("Switzerland", ["switzerland"]),
    ("Austria", ["austria"]), ("Sweden", ["sweden"]), ("Denmark", ["denmark"]), ("Norway", ["norway"]),
    ("Finland", ["finland"]), ("Poland", ["poland"]), ("Greece", ["greece"]), ("Portugal", ["portugal"]),
    ("Romania", ["romania"]), ("Russia", ["russia"]), ("Canada", ["canada"]),
    ("Mexico", ["mexico"]), ("Brazil", ["brazil"]), ("Argentina", ["argentina"]), ("Chile", ["chile"]),
    ("Australia", ["australia"]), ("New Zealand", ["new zealand"]), ("Singapore", ["singapore"]),
    ("Malaysia", ["malaysia"]), ("Thailand", ["thailand"]), ("Vietnam", ["vietnam", "viet nam"]),
    ("Indonesia", ["indonesia"]), ("Philippines", ["philippines"]), ("Bangladesh", ["bangladesh"]),
    ("Nigeria", ["nigeria"]), ("South Africa", ["south africa"]), ("Ireland", ["ireland"]),
    ("Czech Republic", ["czech republic", "czechia"]), ("Slovakia", ["slovakia", "szlovákia"]),
    ("Hungary", ["hungary"]), ("Serbia", ["serbia"]), ("Croatia", ["croatia"]), ("Slovenia", ["slovenia"]),
    ("Bosnia and Herzegovina", ["bosnia and herzegovina", "bosnia"]), ("Montenegro", ["montenegro"]),
    ("North Macedonia", ["north macedonia", "macedonia"]), ("Albania", ["albania"]), ("Kosovo", ["kosovo"]),
    ("Bulgaria", ["bulgaria"]), ("Moldova", ["moldova"]), ("Ukraine", ["ukraine"]), ("Belarus", ["belarus"]),
    ("Lithuania", ["lithuania"]), ("Latvia", ["latvia"]), ("Estonia", ["estonia"]), ("Iceland", ["iceland"]),
    ("Luxembourg", ["luxembourg"]), ("Malta", ["malta"]), ("Cyprus", ["cyprus"]),
    ("Georgia", ["sakartvelo"]), ("Armenia", ["armenia"]), ("Azerbaijan", ["azerbaijan"]),
    ("Kazakhstan", ["kazakhstan"]), ("Uzbekistan", ["uzbekistan"]), ("Kyrgyzstan", ["kyrgyzstan"]),
    ("Tajikistan", ["tajikistan"]), ("Turkmenistan", ["turkmenistan"]), ("Mongolia", ["mongolia"]),
    ("Afghanistan", ["afghanistan"]), ("Nepal", ["nepal"]), ("Sri Lanka", ["sri lanka"]), ("Bhutan", ["bhutan"]),
    ("Maldives", ["maldives"]), ("Myanmar", ["myanmar"]), ("Cambodia", ["cambodia"]), ("Laos", ["laos", "lao pdr"]),
    ("Brunei", ["brunei"]), ("Macau", ["macau", "macao"]),
    ("Colombia", ["colombia"]), ("Peru", ["peru"]), ("Ecuador", ["ecuador"]), ("Venezuela", ["venezuela"]),
    ("Bolivia", ["bolivia"]), ("Paraguay", ["paraguay"]), ("Uruguay", ["uruguay"]), ("Cuba", ["cuba"]),
    ("Costa Rica", ["costa rica"]), ("Panama", ["panama"]), ("Guatemala", ["guatemala"]),
    ("Honduras", ["honduras"]), ("El Salvador", ["el salvador"]), ("Nicaragua", ["nicaragua"]),
    ("Dominican Republic", ["dominican republic"]), ("Jamaica", ["jamaica"]), ("Puerto Rico", ["puerto rico"]),
    ("Trinidad and Tobago", ["trinidad"]),
    ("Ethiopia", ["ethiopia"]), ("Kenya", ["kenya"]), ("Uganda", ["uganda"]), ("Tanzania", ["tanzania"]),
    ("Rwanda", ["rwanda"]), ("Somalia", ["somalia"]), ("Eritrea", ["eritrea"]), ("Djibouti", ["djibouti"]),
    ("Ghana", ["ghana"]), ("Senegal", ["senegal"]), ("Burkina Faso", ["burkina faso"]), ("Mali", ["mali"]),
    ("Niger", ["niger"]), ("Benin", ["benin"]), ("Togo", ["togo"]), ("Gambia", ["gambia"]),
    ("Côte d'Ivoire", ["côte d'ivoire", "cote d'ivoire", "ivory coast"]), ("Guinea", ["guinea"]),
    ("Sierra Leone", ["sierra leone"]), ("Liberia", ["liberia"]), ("Cameroon", ["cameroon"]),
    ("Gabon", ["gabon"]), ("DR Congo", ["drcongo"]), ("Congo", ["congo"]),
    ("Central African Republic", ["central african republic"]), ("Angola", ["angola"]),
    ("Zambia", ["zambia"]), ("Zimbabwe", ["zimbabwe"]), ("Malawi", ["malawi"]), ("Mozambique", ["mozambique"]),
    ("Botswana", ["botswana"]), ("Namibia", ["namibia"]), ("Madagascar", ["madagascar"]),
    ("Mauritius", ["mauritius"]), ("Mauritania", ["mauritania"]), ("South Sudan", ["southsudan"]),
    ("Papua New Guinea", ["papuanewguinea"]), ("Fiji", ["fiji"]), ("Grenada", ["grenada"]),
    ("Monaco", ["monaco"]),
]

# Words that point to a country when an address has no country name
US_STATES = ["alabama", "alaska", "arizona", "arkansas", "california", "calif", "colorado", "connecticut",
             "delaware", "florida", "georgia", "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas",
             "kentucky", "louisiana", "maine", "maryland", "massachusetts", "michigan", "minnesota",
             "mississippi", "missouri", "montana", "nebraska", "nevada", "new hampshire", "new jersey",
             "new york", "north carolina", "north dakota", "ohio", "oklahoma", "oregon", "pennsylvania",
             "rhode island", "south carolina", "south dakota", "tennessee", "texas", "utah", "vermont",
             "virginia", "washington", "west virginia", "wisconsin", "wyoming"]
CITY_HINTS = [
    ("USA", US_STATES + ["boston", "chicago", "los angeles", "san francisco", "philadelphia", "baltimore",
                         "houston", "seattle", "mayo clinic", "kansas city", "minneapolis", "new haven",
                         "brooklyn", "atlanta"]),
    ("China", ["beijing", "shanghai", "guangzhou", "shenzhen", "wuhan", "chengdu", "hangzhou", "nanjing",
               "tianjin", "chongqing", "zhejiang", "jilin", "fudan", "anhui", "wenzhou", "sichuan"]),
    ("Japan", ["tokyo", "osaka", "kyoto", "hokkaido", "nagoya"]),
    ("South Korea", ["seoul", "busan"]),
    ("Canada", ["ontario", "quebec", "québec", "british columbia", "alberta", "toronto", "montreal", "vancouver"]),
    ("Australia", ["nsw", "queensland", "sydney", "melbourne"]),
    ("Romania", ["bucharest", "iasi", "cluj"]), ("Austria", ["graz", "vienna"]),
    ("Germany", ["deutschland", "frankfurt", "muenster", "münster"]), ("Brazil", ["brasil"]),
    ("Italy", ["bologna", "milan", "naples"]), ("Iran", ["mazandaran", "isfahan", "shiraz", "mashhad"]),
]
# Short codes allowed only as the last word of an address (US states, 3-letter country codes)
CODES = {c: "USA" for c in ("al ak az ar ca co ct dc de fl ga hi id il in ia ks ky la me md ma mi mn ms mo mt "
                            "ne nv nh nj nm ny nc nd oh ok or pa ri sc sd tn tx ut vt va wa wv wi wy us u.s "
                            "u.s.a usa").split()}
CODES.update({"gbr": "UK", "ind": "India", "pak": "Pakistan", "sau": "Saudi Arabia", "pol": "Poland",
              "irl": "Ireland", "jor": "Jordan", "egy": "Egypt", "chn": "China", "are": "UAE", "tur": "Türkiye",
              "bra": "Brazil", "can": "Canada", "aus": "Australia", "deu": "Germany", "fra": "France",
              "ita": "Italy", "esp": "Spain", "jpn": "Japan", "kor": "South Korea", "nld": "Netherlands",
              "che": "Switzerland", "swe": "Sweden", "mex": "Mexico", "nga": "Nigeria", "bgd": "Bangladesh",
              "npl": "Nepal", "lka": "Sri Lanka", "irn": "Iran", "irq": "Iraq", "kwt": "Kuwait", "qat": "Qatar",
              "omn": "Oman", "bhr": "Bahrain", "lbn": "Lebanon", "syr": "Syria", "yem": "Yemen",
              "mar": "Morocco", "dza": "Algeria", "tun": "Tunisia", "lby": "Libya", "sdn": "Sudan",
              "grc": "Greece", "prt": "Portugal", "rou": "Romania",
              "mys": "Malaysia", "sgp": "Singapore", "tha": "Thailand", "vnm": "Vietnam", "idn": "Indonesia",
              "phl": "Philippines", "zaf": "South Africa", "ken": "Kenya", "eth": "Ethiopia", "col": "Colombia",
              "per": "Peru", "arg": "Argentina", "chl": "Chile", "twn": "Taiwan", "hkg": "Hong Kong",
              "geo": "Georgia", "uga": "Uganda", "kaz": "Kazakhstan", "kgz": "Kyrgyzstan", "uzb": "Uzbekistan",
              "uk": "UK", "u.k": "UK"})

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


# Place names that contain another country's name (checked first)
NOT_COUNTRY = [
    ("new south wales", "nsw, australia"), ("new mexico", "usa"), ("new england", "newengland"),
    ("prince of wales", "princeofwales"), ("northern ireland", "uk"),
    ("lebanon, nh", "usa"), ("lebanon, new hampshire", "usa"), ("hong kong sar, china", "hong kong"),
    ("hong kong, china", "hong kong"), ("hong kong sar, prc", "hong kong"), ("macau sar, china", "macau"),
    ("macao sar, china", "macau"), ("taiwan, roc", "taiwan"), ("taiwan, republic of china", "taiwan"),
    ("republic of china (taiwan)", "taiwan"), ("democratic republic of the congo", "drcongo"),
    ("dr congo", "drcongo"), ("south sudan", "southsudan"), ("papua new guinea", "papuanewguinea"),
    ("equatorial guinea", "equatorialguinea"), ("guinea-bissau", "guineabissau"),
]
WORD = r"(?<![^\W\d_])%s(?![^\W\d_])"   # whole word: not inside a longer word


def _clean(aff):
    low = " " + aff.lower() + " "
    low = re.sub(r"electronic address:.*", " ", low)
    low = re.sub(r"\S+@\S+", " ", low)                  # e-mail addresses say nothing reliable
    low = re.sub(r"(tbilisi|batumi|kutaisi)(.*?)georgia", r"\1\2sakartvelo", low)  # the country Georgia
    for place, repl in NOT_COUNTRY:
        low = low.replace(place, repl)
    return low


def _names(s, tables):
    found = []
    for table in tables:
        for name, words in table:
            if name not in found and any(re.search(WORD % re.escape(w), s) for w in words):
                found.append(name)
    return found


def address_countries(aff):
    """Countries of one address. The country is normally the last part,
    so that part decides; the whole address is searched only when the end
    names no country (this avoids 'Royal College of Surgeons in Ireland,
    Bahrain' giving Ireland, or 'Jordan Well, Coventry, UK' giving Jordan)."""
    found = []
    for part in aff.split(";"):
        low = _clean(part)
        segs = [s.strip(" .") for s in low.split(",") if s.strip(" .")]
        hit = []
        for seg in segs[-1:] + segs[-2:-1]:          # last part, then the one before it
            hit = _names(seg, [MENA, OTHER])
            if not hit:
                words = re.sub(r"\d+", " ", seg).replace(".", " ").split()
                squashed = re.sub(r"[\s.]", "", seg)          # "U.K." -> "uk", "U.S.A." -> "usa"
                if words and len(words) <= 3 and words[-1] in CODES:
                    hit = [CODES[words[-1]]]
                elif squashed in CODES:
                    hit = [CODES[squashed]]
            if not hit:
                hit = _names(seg, [CITY_HINTS])
            if hit:
                break
        if not hit:
            hit = _names(low, [MENA, OTHER]) or _names(low, [CITY_HINTS])
        for c in hit:
            if c not in found:
                found.append(c)
    return found


MENA_NAMES = {name for name, _ in MENA}


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

    # every author's country, in author order (first author's first)
    countries = []
    unplaced = False      # an address with no recognisable country
    for au in authors:
        for f in au.findall("AffiliationInfo/Affiliation"):
            found = address_countries(text(f))
            unplaced = unplaced or not found
            for c in found:
                if c not in countries:
                    countries.append(c)
    if not countries:
        unplaced = True   # no addresses to check (e.g. a group author list)
    mena = [c for c in countries if c in MENA_NAMES]

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
    if countries:
        item["c"] = countries
    if mena:
        item["m"] = 1
    if unplaced:
        item["_u"] = 1    # used by main(), not saved
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
def write_js(path, payload):
    body = ("/* Publication Radar data. Written automatically every day by scripts/radar_fetch.py.\n"
            "   Do not edit by hand: your changes would be replaced on the next update. */\n"
            "window.MLA_RADAR = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n")
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(body)
    os.replace(tmp, path)
    return len(body.encode()) // 1024


def recent_payload(payload, now=None):
    """The same data, keeping only papers from the last RECENT_DAYS days.
    'counts' keeps the full totals for the Global and MENA tabs."""
    now = now or datetime.now(timezone.utc)
    cut = (now - timedelta(days=RECENT_DAYS)).strftime("%Y-%m-%d")
    items = payload["items"]
    small = dict(payload)
    small["items"] = [x for x in items if x.get("d", "") >= cut]
    small["recentDays"] = RECENT_DAYS
    small["counts"] = {"global": sum(1 for x in items if x.get("w")), "mena": sum(1 for x in items if x.get("m"))}
    return small


def save(items):
    items.sort(key=lambda x: (x.get("d", ""), x["p"]), reverse=True)
    payload = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"),
        "globalDays": GLOBAL_DAYS, "menaDays": MENA_DAYS,
        "items": items,
    }
    kb = write_js(OUT, payload)
    small = recent_payload(payload)
    kb_small = write_js(OUT_RECENT, small)
    print("Saved %d papers (%d MENA) to data/radar.js, %d KB; %d recent papers to data/radar-recent.js, %d KB"
          % (len(items), sum(1 for x in items if x.get("m")), kb, len(small["items"]), kb_small))


def mark_lists(items, g_set, m_set):
    """Mark which list each paper belongs to; drop papers in neither."""
    for it in items:
        if it["p"] in g_set:
            it["w"] = 1  # belongs to the Global (worldwide) list
        # MENA list: PubMed's MENA address search, confirmed by our tagger.
        # PubMed's search also matches words such as "Lebanon, New Hampshire"
        # or "Turkey Creek Medical Center", so a paper stays only if an author
        # is placed in a MENA country, or some address could not be placed.
        if it["p"] in m_set and (it.get("m") or it.get("_u")):
            it["m"] = 1
        else:
            it.pop("m", None)
        it.pop("_u", None)
    return [it for it in items if it.get("w") or it.get("m")]


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--from-xml":
        with open(sys.argv[2], "rb") as f:
            items = parse_xml(f.read())
        for it in items:
            it["w"] = 1
            it.pop("_u", None)
        save(items)
        return

    print("Global search (last %d days)" % GLOBAL_DAYS)
    g_ids = search("(" + LIVER + " OR " + OBESITY_LIVER + ")" + EXCLUDE, GLOBAL_DAYS, GLOBAL_MAX)
    print("MENA search (last %d days)" % MENA_DAYS)
    m_ids = search("(" + LIVER + " OR " + OBESITY + ") AND " + MENA_QUERY + EXCLUDE, MENA_DAYS, MENA_MAX)

    ids = list(dict.fromkeys(g_ids + m_ids))
    items = fetch(ids)
    items = mark_lists(items, set(g_ids), set(m_ids))
    if len(items) < 20:
        raise SystemExit("Too few papers (%d). Keeping yesterday's list." % len(items))
    save(items)


if __name__ == "__main__":
    main()
