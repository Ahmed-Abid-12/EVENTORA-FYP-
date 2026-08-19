#!/usr/bin/env python3
"""Eventora frontend verification — architecture, consistency, content honesty."""
import re, glob, sys, os, json
from html.parser import HTMLParser

os.chdir(os.path.dirname(os.path.abspath(__file__)))
ok, bad, note = [], [], []
def check(c, m): (ok if c else bad).append(m)

pages = sorted(glob.glob("*.html") + glob.glob("pages/*.html") + glob.glob("client/*.html") + glob.glob("vendor/*.html") + glob.glob("admin/*.html") + glob.glob("ai/*.html") + glob.glob("payment/*.html"))
css = open("assets/css/style.css").read() + open("assets/css/responsive.css").read()
js = open("assets/js/main.js").read()

# 1 ---- architecture: no inline style/script, LF endings ---------------------
for p in pages:
    s = open(p, newline="").read()
    check("<style" not in s, f"{p}: no inline <style>")
    # data blocks (type="application/json") are allowed — they are the stand-in
    # for a server-side query, not executable code. Inline JS logic is not.
    inline = [t for t in re.findall(r"<script(?![^>]*\bsrc=)[^>]*>", s)
              if 'type="application/json"' not in t]
    check(not inline, f"{p}: no executable inline <script> ({inline[:1]})")
    check("\r" not in s, f"{p}: LF line endings")
    n = s.count('style="')
    if p.startswith(("client/","vendor/")) or p in ("index.html","pages/contact.html","pages/about.html"):
        check(n == 0, f"{p}: no inline style= attributes")
    else:
        note.append(f"{p}: {n} inline style= (pre-existing, out of scope)")

# 2 ---- one shared validator -------------------------------------------------
code = re.sub(r"/\*.*?\*/|//.*", "", js, flags=re.S)
check(js.count("function validateField") == 1, "main.js: one validateField()")
check(js.count("[^\\s@]+@[^\\s@]+") == 1, "main.js: email regex defined once")
check("style.cssText" not in code, "main.js: no generated inline styles")
for f in ["initMobileNav","initScrollReveal","initNavbarScrollState","initPlannerForm",
          "initPageTransitions","initPasswordToggles","initPasswordStrength",
          "initAuthForms","initContactForm"]:
    check(f"function {f}" in js and f"  {f}();" in js, f"main.js: {f} defined + registered")

# 3 ---- shared navbar / footer are byte-identical across inner pages ---------
def block(p, s, e):
    t = open(p).read()
    return t[t.index(s):t.index(e) + len(e)] if s in t else ""
norm = lambda t: re.sub(r"\s+", " ", t.replace(' class="is-active"', "")).strip()
ref_nav = norm(block("pages/contact.html", '<header class="eventora-navbar">', "</header>"))
ref_ft  = norm(block("pages/contact.html", '<footer class="eventora-footer">', "</footer>"))
for p in ["pages/about.html", "pages/faq.html", "pages/vendors.html"]:
    nav = norm(block(p, '<header class="eventora-navbar">', "</header>"))
    if nav:
        check(nav == ref_nav, f"{p}: navbar identical to the shared one")
    ft = norm(block(p, '<footer class="eventora-footer">', "</footer>"))
    if ft:
        check(ft == ref_ft, f"{p}: footer identical to the shared one")

# 4 ---- every class used has a CSS rule -------------------------------------
BOOT = re.compile(r"^(container|row|col|g-|m[btxysel]?-|p[btxysel]?-|d-|flex-|justify-|"
                  r"align-|text-|bi$|bi-|h-100|w-100|fs-|fw-|gap-|order-|position-|ms-|me-|"
                  r"accordion|collapse$|show$|visually-hidden|btn-close)")
HOOKS = {"hero-visual", "ai-showcase-copy", "ai-showcase-preview"}
class C(HTMLParser):
    def __init__(self): super().__init__(); self.c = set()
    def handle_starttag(self, t, a):
        for k, v in a:
            if k == "class" and v: self.c.update(v.split())
defined = set(re.findall(r"\.([a-zA-Z][\w-]*)", css))
missing = {}
for p in pages:
    col = C(); col.feed(open(p).read())
    for cl in col.c:
        if cl in HOOKS or BOOT.match(cl) or cl in defined: continue
        missing.setdefault(cl, []).append(p)
check(not missing, f"all HTML classes have CSS rules (undefined: {sorted(missing)[:6]})")

# 5 ---- links resolve --------------------------------------------------------
PENDING = {  # not yet built
    # Phase 4 client module — sidebar links ahead of the pages
 "client/budget-planner.html",
}
existing = {os.path.normpath(p) for p in pages}
broken = set()
for p in pages:
    s = open(p).read()
    # pages/vendors.html is now canonical (frozen). The legacy name is
    # vendor-list.html, and only the data-vendor-list JS hook may keep it.
    stale = re.findall(r"(?<!data-)vendor-list\.html", s)
    check(not stale, f"{p}: no legacy vendor-list.html links ({stale[:1]})")
    for h in re.findall(r'href="([^"#?]+\.html)[^"]*"', s):
        b = os.path.normpath(os.path.join(os.path.dirname(p), h))
        if b not in existing and b not in PENDING: broken.add((p, b))
check(not broken, f"no unexpected broken links ({sorted(broken)})")

# 5b --- FAQ reachable from the footer, navbar untouched -----------------------
for p in ["index.html", "pages/about.html", "pages/contact.html", "pages/faq.html"]:
    s_ = open(p).read()
    head_end = s_.index("</header>")
    check(s_[:head_end].count("faq.html") == 0, f"{p}: navbar not modified")
    check(s_[head_end:].count("faq.html") == 1, f"{p}: FAQ linked once from the footer")

# 5c --- demo dataset must not contradict itself ------------------------------
# Booking amounts must equal the vendor's listed service price, and committed
# budget must exclude rejected/cancelled bookings. Both drifted once already.
try:
    _vd = json.loads(re.search(r'id="demo-vendor-data">(.*?)</script>',
                               open("pages/vendor-detail.html").read(), re.S).group(1))
    _price = {(v["business_name"], sv["title"]): sv["base_price"]
              for v in _vd["vendors"] for sv in v["services"]}
    _bd = json.loads(re.search(r'id="demo-booking-data">(.*?)</script>',
                               open("client/booking-detail.html").read(), re.S).group(1))
    _bad = [b["ref"] for b in _bd["bookings"]
            if _price.get((b["vendor"], b["service"])) != b["amount"]]
    check(not _bad, f"booking amounts match the vendor's listed service price ({_bad})")

    _COUNTS = {"pending", "accepted", "completed"}
    _committed = {}
    for b in _bd["bookings"]:
        if b["status"] in _COUNTS:
            _committed[b["event_name"]] = _committed.get(b["event_name"], 0) + b["amount"]
    _me = open("client/my-events.html").read()
    _shown = {n: int(c.replace(",", "")) for n, c, _b in
              re.findall(r'data-name="([^"]+)"[\s\S]*?Rs\. ([\d,]+) of Rs\. ([\d,]+)', _me)}
    _drift = [n for n, v in _shown.items() if _committed.get(n, 0) != v]
    check(not _drift, f"committed budget excludes rejected/cancelled ({_drift})")
except (AttributeError, FileNotFoundError):
    pass

# 5d --- vendor commission + review rules -------------------------------------
try:
    _pay = open("vendor/payments.html").read()
    _rows = re.findall(
        r'<td class="num cell-strong">Rs\. ([\d,]+)</td>\s*<td class="num">([\d.]+)%</td>'
        r'\s*<td class="num commission">&minus; Rs\. ([\d,]+)</td>'
        r'\s*<td class="num net">Rs\. ([\d,]+)</td>', _pay)
    _bad = []
    for _g, _p, _c, _n in _rows:
        G, C, N = (int(x.replace(",", "")) for x in (_g, _c, _n))
        if C != round(G * 0.10) or N != G - C or float(_p) != 10.0:
            _bad.append(_g)
    check(_rows and not _bad, f"every commission = gross x 10% and net = gross - commission ({_bad[:3]})")

    _rv = open("vendor/reviews.html").read()
    _ids = re.findall(r'class="vr-card glass-card"\s*\n\s*data-booking-id="(\d+)"', _rv)
    check(_ids and len(_ids) == len(set(_ids)), "one review per booking (UNIQUE booking_id)")

    _cal = json.loads(re.search(r'id="demo-calendar-data">(.*?)</script>', _pay if False else
                                open("vendor/calendar.html").read(), re.S).group(1))
    _st = {e["status"] for e in _cal["entries"]}
    check(not ({"rejected", "cancelled"} & _st),
          f"calendar excludes rejected/cancelled bookings ({sorted(_st)})")
except (AttributeError, FileNotFoundError):
    pass

# 5e --- favicon coverage ------------------------------------------------------
# Every page must reference the official favicon, and the relative path must
# resolve from that page's own directory — root pages and sub-folder pages
# need different prefixes.
_fav_missing, _fav_broken = [], []
for _p in pages:
    _s = open(_p).read()
    _refs = re.findall(r'<link rel="(?:icon|apple-touch-icon)"[^>]*href="([^"]+)"', _s)
    _names = [os.path.basename(r) for r in _refs]
    for _need in ("favicon.ico", "favicon-32x32.png", "favicon-16x16.png", "apple-touch-icon.png"):
        if _need not in _names:
            _fav_missing.append(f"{_p}:{_need}")
    for _r in _refs:
        if not os.path.exists(os.path.normpath(os.path.join(os.path.dirname(_p), _r))):
            _fav_broken.append(f"{_p}:{_r}")
check(not _fav_missing, f"every page references the official favicon ({_fav_missing[:3]})")
check(not _fav_broken, f"every favicon path resolves from its own directory ({_fav_broken[:3]})")

# 6 ---- content honesty ------------------------------------------------------
i = open("index.html").read()
a = open("pages/about.html").read()
c = open("pages/contact.html").read()
for n in ["Sana Nasir", "Hamza Khaskheli", "Rabia Dahri"]:
    check(n not in i, f"index.html: invented name '{n}' removed")
check("Verified Vendors" not in i, "index.html: vendor count relabelled as demo")
check("Find Vendors</button>" in i, "index.html: hero CTA is 'Find Vendors' (D10)")
check("Message sent!" not in c, "contact.html: no false send confirmation")
# personal contact details of real students must not be published
for pii in ["muhammadahmedabid26", "fawadsoomro56", "mariashiqhussain786",
            "mehranmemon2004", "0312-3049617", "0316-0327739", "0305-9182238", "0310-3036562"]:
    check(pii not in a, f"about.html: no published personal detail ({pii[:14]})")
# about page must not invent usage statistics
check(not re.search(r"\b\d[\d,]*\+?\s*(happy|satisfied|events? (completed|planned)|customers|clients served)", a, re.I),
      "about.html: no invented usage statistics")
check("Ahmed Abid" in a and "Dr. Mumtaz Qabulio" in a, "about.html: real team + supervisor named")
check("SU|FET|IT|FYP|2026" in a, "about.html: cites the real project ID")

# 7b --- CSS base-rule collision audit ----------------------------------------
# A collision is the same BASE rule (`.class {`) declared in two numbered
# sections — that is what broke .booking-card (§23 vs §30). A modifier
# (.class.is-x) or descendant (.class td) in a later section is a legitimate
# extension and must NOT be flagged.
_style = open("assets/css/style.css").read()
_secs = re.split(r"\n/\* -+\n   (\d+)\. ([^\n]+)", _style)
_base = {}
_i = 1
while _i < len(_secs) - 1:
    _num, _body = _secs[_i], _secs[_i + 2]
    for _m in re.finditer(r"^(\.[a-zA-Z][\w-]*)([^{,\n]*)\{", _body, re.M):
        if _m.group(2).strip() == "":
            _base.setdefault(_m.group(1)[1:], set()).add(_num)
    _i += 3
_dupes = sorted(k for k, v in _base.items() if len(v) > 1)
check(not _dupes, f"no CSS base-rule collisions ({_dupes[:4]})")

# 7 ---- design system preserved ---------------------------------------------
check(css.count("--color-primary:") == 1, "style.css: single token block")
check("#9d6bff" in css and "#f2b93d" in css, "style.css: palette unchanged")
new = open("assets/css/style.css").read().split("17. INNER PAGE SHELL")[1]
check("var(--" in new and not re.search(r"--color-[\w-]+\s*:", new),
      "style.css: new sections consume tokens, define no new colours")
check(len(glob.glob("assets/css/*.css")) == 2, "no extra CSS files created")
check(len(glob.glob("assets/js/*.js")) == 1, "no extra JS files created")

print("=" * 64)
print("EVENTORA FRONTEND VERIFICATION")
print("=" * 64)
for m in ok: print("  PASS  ", m)
for m in note: print("  NOTE  ", m)
for m in bad: print("  FAIL  ", m)
print(f"\n{len(ok)} passed, {len(bad)} failed")
sys.exit(1 if bad else 0)
