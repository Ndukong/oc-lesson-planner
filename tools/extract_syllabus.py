# -*- coding: utf-8 -*-
"""Extract MINESEC syllabus competency matrices from PDFs into structured JSON.

All coordinates are normalised to DISPLAY space (page.rotation_matrix applied),
so both portrait-pages-with-rotated-tables (Physics F1-2) and native landscape
pages (Physics F3-5) are handled uniformly:

  1. Scan text lines top-to-bottom tracking Form / Module headers.
  2. Detect matrix header bands (uppercase column-label vocabulary).
  3. Cluster header-label x positions into column anchors, walk the expected
     label sequence (families, examples, categories, actions, content,
     aptitude, attitudes, other) skipping super-headers.
  4. Bucket content words below each band into columns; group into lines; join.

Usage: python extract_syllabus.py <pdf> <subject-id> <out.json>
"""
import json
import re
import sys

import fitz

VOCAB = {
    "FAMILIES", "EXAMPLES", "CATEGORIES", "ACTIONS", "ESSENTIAL", "KNOWLEDGE",
    "CONTENT", "APTITUDE", "APTITUDES", "ATTITUDES", "OTHER", "RESOURCES",
    "SITUATIONS", "CONTEXTUAL", "FRAMEWORK", "COMPETENCIES", "CORE",
}
# expected anchor sequence: (column key, acceptable first-words)
EXPECTED = [
    ("families", {"FAMILIES", "FAMILY"}),
    ("examples", {"EXAMPLES"}),
    ("categories", {"CATEGORIES", "CATEGORY"}),
    ("actions", {"EXAMPLES", "ACTIONS"}),
    ("content", {"ESSENTIAL", "CONTENT", "CORE", "KNOWLEDGE"}),
    ("aptitudes", {"APTITUDE", "APTITUDES"}),
    ("attitudes", {"ATTITUDES"}),
    ("other", {"OTHER", "RESOURCES"}),
]
SKIP_LABELS = {"CONTEXTUAL", "FRAMEWORK", "COMPETENCIES", "RESOURCES", "CORE"}

MODULE_A_RE = re.compile(r"^\s*MODULE\s*([0-9IVX]+)\s*[:.\-\u2013]\s*(\S.*)$", re.I)
MODULE_B_RE = re.compile(r"^\s*Module\s+([0-9IVX]+)\s*:?\s*$", re.I)
FORM_RE = re.compile(
    r"^\s*(?:[A-Z][A-Za-z ]+\s*[-\u2013]\s*)?FORM\s+(ONE|TWO|THREE|FOUR|FIVE|[1-5]|I{1,3}|IV|V)\b",
    re.I,
)
FORM_WORDS = {"ONE": 1, "TWO": 2, "THREE": 3, "FOUR": 4, "FIVE": 5,
              "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5}
ROMAN = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6,
         "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6,
         "ONE": 1, "TWO": 2, "THREE": 3, "FOUR": 4, "FIVE": 5, "SIX": 6}

BULLET = "\u2022"


def clean(s: str) -> str:
    s = s.replace("\u00c6", "'").replace("\u00e6", "'")
    s = s.replace("\uf0b7", BULLET).replace("\uf0e0", BULLET).replace("\uf0a7", BULLET)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def display_words(page):
    """Words in display space: [(x0, y0, x1, y1, text)]."""
    words = page.get_text("words")
    if page.rotation:
        m = page.rotation_matrix
        out = []
        for x0, y0, x1, y1, t, *_ in words:
            r = fitz.Rect(x0, y0, x1, y1) * m
            out.append((r.x0, r.y0, r.x1, r.y1, t))
        return out
    return [(w[0], w[1], w[2], w[3], w[4]) for w in words]


def display_lines(page):
    """Text lines in display space: [(y0, x0, x1, text)] reading order."""
    m = page.rotation_matrix if page.rotation else None
    lines = []
    d = page.get_text("dict")
    for b in d["blocks"]:
        for l in b.get("lines", []):
            spans = [s for s in l["spans"] if s["text"].strip()]
            if not spans:
                continue
            text = clean(" ".join(s["text"] for s in spans))
            bbox = fitz.Rect(spans[0]["bbox"])
            for s in spans[1:]:
                bbox |= fitz.Rect(s["bbox"])
            if m:
                bbox = bbox * m
            lines.append((round(bbox.y0, 1), round(bbox.x0, 1), round(bbox.x1, 1), text))
    lines.sort(key=lambda t: (t[0], t[1]))
    return lines


NOISE_LINE_RE = re.compile(
    r"^(Page\s*\|?\s*\d+|(CONTEXTUAL|FRAMEWORK|COMPETENCIES|RESOURCES)(\s+(OF|OF|FRAMEWORK|COMPETENCIES|RESOURCES))*|"
    r"MODULE\s+[0-9IVX]+.*|Form\s+\w+.*|PHYSICS.*FORM.*|PHYSICS TEACHING.*)$",
    re.I,
)


def is_noise_line(text):
    t = text.strip()
    if not t or len(t) > 90:
        return len(t) > 90
    if NOISE_LINE_RE.match(t):
        return True
    words = [w for w in re.split(r"\s+", t) if w]
    vocab_hits = sum(1 for w in words if w.upper().strip("().:,-") in VOCAB)
    return len(words) >= 2 and vocab_hits == len(words)


def lines_to_columns(lines, bounds, y_top, y_bottom):
    """Assign display lines to the 8 matrix columns; returns {col: text}."""
    cols = {k: [] for k, _ in EXPECTED}
    for y0, x0, x1, text in lines:
        if not (y_top <= y0 < y_bottom) or is_noise_line(text):
            continue
        key = EXPECTED[column_of((x0 + x1) / 2, bounds)][0]
        cols[key].append((y0, x0, text))
    out = {}
    for key, items in cols.items():
        items.sort(key=lambda t: (t[0], t[1]))
        out[key] = clean(" ".join(t for _, _, t in items))
    return out


def infer_bounds_from_lines(lines, y_top, y_bottom):
    """Infer 8 column boundaries from the x-clusters of content lines."""
    xs = []
    for y0, x0, x1, text in lines:
        if y_top <= y0 < y_bottom and not is_noise_line(text) and len(text) > 2:
            xs.append((x0 + x1) / 2)
    if len(xs) < 8:
        return None
    xs.sort()
    clusters = [[xs[0], xs[0]]]
    for x in xs[1:]:
        if x - clusters[-1][1] <= 30:
            clusters[-1][1] = max(clusters[-1][1], x)
        else:
            clusters.append([x, x])
    # merge: use cluster start positions; need exactly 8 clusters
    if len(clusters) != 8:
        return None
    starts = [c[0] for c in clusters]
    bounds = []
    for a, b in zip(starts, starts[1:]):
        bounds.append((a + b) / 2)
    bounds.append(bounds[-1] + 300)
    return bounds


def header_anchors(page):
    """Find matrix header bands. Returns list of (band_y0, band_y1, boundaries)."""
    words = display_words(page)
    heads = [
        w for w in words
        if w[4].upper().strip("().:,-") in VOCAB
        # column headers are uppercase or Title Case; body text is sentence case
        and (w[4].isupper() or w[4][:1].isupper())
    ]
    if len(heads) < 6:
        return []
    # cluster header words into bands by y
    heads.sort(key=lambda w: w[1])
    bands = []
    for w in heads:
        if bands and w[1] - bands[-1][2] <= 24:
            bands[-1][1].append(w)
            bands[-1][2] = max(bands[-1][2], w[3])
        else:
            bands.append([w[1], [w], w[3]])
    results = []
    for y0, ws, y1 in bands:
        # keep only the densest 1-2 lines of the band (column labels)
        by_line = {}
        for w in ws:
            by_line.setdefault(round(w[1], 0), []).append(w)
        # pick lines that contain a families/aptitude/other label
        anchor_words = {"FAMILIES", "APTITUDE", "APTITUDES", "OTHER", "ATTITUDES", "ESSENTIAL", "CONTENT"}
        anchor_lines = [
            line for y, line in sorted(by_line.items())
            if any(w[4].upper().strip("().:,-") in anchor_words for w in line)
        ]
        if not anchor_lines:
            continue
        flat = [w for line in anchor_lines for w in line]
        flat.sort(key=lambda w: w[0])
        clusters = []
        for w in flat:
            if clusters and w[0] - clusters[-1][0] <= 24:
                clusters[-1][1].append(w[4])
                clusters[-1][2] = max(clusters[-1][2], w[2])
            else:
                clusters.append([w[0], [w[4]], w[2]])
        # walk expected sequence, tolerating missing columns (some documents
        # merge or omit column headers) and skipping super-header clusters
        anchors = []
        anchored = set()
        ci = 0
        for x0, labels, x1 in clusters:
            first = labels[0].upper().strip("().:,-")
            matched = None
            for j in range(ci, len(EXPECTED)):
                if first in EXPECTED[j][1]:
                    matched = j
                    break
            if matched is None:
                continue
            anchored.add(matched)
            anchors.append((x0, x1, matched))
            ci = matched + 1
        # accept a band when the anchor set is trustworthy: at least 4
        # anchors, at least one of attitudes/other, and either the content
        # anchor or a majority of columns anchored
        if (
            len(anchored) < 4
            or not (anchored & {6, 7})
            or not (4 in anchored or len(anchored) >= 5)
        ):
            continue
        missing = [i for i in range(len(EXPECTED)) if i not in anchored]
        # interpolate missing anchors at midpoints
        fixed = []
        for ci_expected in range(len(EXPECTED)):
            if ci_expected not in missing:
                a = next(a for a in anchors if a[2] == ci_expected)
                fixed.append(a)
            else:
                prev = fixed[-1][1] if fixed else 40
                nxt = next((a[0] for a in anchors if a[2] > ci_expected), prev + 200)
                fixed.append(((prev + nxt) / 2, (prev + nxt) / 2))
        anchors = fixed
        bounds = []
        for a, b in zip(anchors, anchors[1:]):
            bounds.append((a[0] + b[0]) / 2)
        bounds.append(bounds[-1] + 300)
        results.append((y0, y1 + 4, bounds))
    return results


def column_of(x, bounds):
    for i, b in enumerate(bounds):
        if x < b:
            return i
    return len(bounds) - 1


def bucket_words(words, bounds, y_top, y_bottom):
    cols = {k: [] for k, _ in EXPECTED}
    for x0, y0, x1, y1, t in words:
        if not (y_top <= y0 < y_bottom):
            continue
        key = EXPECTED[column_of((x0 + x1) / 2, bounds)][0]
        cols[key].append((round(y0 / 4), round(x0, 1), t))
    out = {}
    for key, ws in cols.items():
        ws.sort()
        # group into visual lines by (y-band), join words by x
        lines = {}
        for yb, x, t in ws:
            lines.setdefault(yb, []).append((x, t))
        text = " ".join(t for _, ts in sorted(lines.items()) for _, t in sorted(ts))
        out[key] = clean(text)
    return out


def split_items(text, kind):
    if not text:
        return []
    t = text.replace(BULLET, " " + BULLET + " ")
    if kind in ("families", "examples", "categories", "actions", "aptitudes", "attitudes", "other"):
        parts = re.split(r"\s(?=\-\s?(?=[A-Z(])|\s+" + re.escape(BULLET) + r"\s*)", t)
    else:  # content: numbered items "1.2 ...", "Topic 1: ..."
        parts = re.split(r"(?=\bTopic\s+\d+\s*:)|(?=\s\d{1,2}\.\d{1,2}\s)|(?<=\s)(?=\d{1,2}\.\s+[A-Z])", t)
    items = []
    for p in parts:
        p = clean(p).lstrip("-").strip()
        p = p.lstrip(BULLET).strip()
        if len(p) > 1:
            items.append(p)
    return items or ([t] if t else [])


def superheader_present(words):
    ups = {w[4].upper().strip("().:,-") for w in words}
    return len(ups & {"CONTEXTUAL", "FRAMEWORK", "COMPETENCIES", "RESOURCES"}) >= 2


def page_height(doc, pno):
    return doc[pno].rect.height


def last_bounds_before(page_info, pno):
    for j in range(pno - 1, -1, -1):
        if page_info[j]["bands"]:
            return page_info[j]["bands"][-1][2]
    return None


def extract(pdf_path, subject_id, debug=False):
    doc = fitz.open(pdf_path)
    result = {"subject": subject_id, "forms": {}}
    state = {"form": None, "module": None, "name": "", "acc": None}

    def new_acc():
        return {k: [] for k, _ in EXPECTED}

    def flush():
        if state["acc"] and state["form"]:
            has_content = any(" ".join(c).strip() for c in state["acc"].values())
            if not has_content:
                state["acc"] = new_acc()
                return
            forms = result["forms"].setdefault(str(state["form"]), {})
            if state["module"]:
                key = state["name"] or f"Module {state['module']}"
            else:
                # some documents do not re-announce modules inside a form's
                # matrix; content is pooled per form
                key = "_unsorted"
            entry = forms.get(key, {})
            for k, chunks in state["acc"].items():
                joined = " ".join(c for c in chunks if c)
                if joined:
                    entry[k] = joined
            forms[key] = entry
        state["acc"] = new_acc()

    state["acc"] = new_acc()

    # ---- pass 1: per-page bands, super-headers, line stats ----
    page_info = []
    for pno in range(len(doc)):
        page = doc[pno]
        words = display_words(page)
        ph = page.rect.height
        words = [w for w in words if 26 < w[1] and w[3] < ph - 18]
        lines = display_lines(page)
        page_info.append({
            "bands": header_anchors(page),
            "super": superheader_present(words),
            "maxline": max((len(t) for _, _, _, t in lines), default=0),
            "words": words,
        })
    fallback_bounds = None
    for info in page_info:
        if info["bands"]:
            fallback_bounds = info["bands"][0][2]
            break

    # ---- pass 2: walk pages, track form/module, bucket matrix content ----
    for pno in range(len(doc)):
        info = page_info[pno]
        page = doc[pno]
        lines = display_lines(page)
        if not lines:
            continue

        events = []
        for y0, y1, bounds in info["bands"]:
            events.append((y0, "band", (y0, y1, bounds)))
        for idx, (ly, lx, _lx1, text) in enumerate(lines):
            if len(text) > 60:
                continue
            if re.match(r"^Page\s*\|?\s*\d+$", text):
                continue
            fm = FORM_RE.match(text)
            if fm:
                tok = fm.group(1).upper()
                events.append((ly, "form", FORM_WORDS.get(tok, int(tok) if tok.isdigit() else None)))
                continue
            ma = MODULE_A_RE.match(text)
            if ma and "CONTENT" not in text.upper():
                events.append((ly, "module", (ROMAN.get(ma.group(1).upper()), clean(ma.group(2).strip(" .:-\u2013")))))
                continue
            mb = MODULE_B_RE.match(text)
            if mb:
                # name may be on the next 1-2 lines (any casing)
                name = ""
                for j in range(idx + 1, min(idx + 3, len(lines))):
                    nxt = lines[j][3]
                    if nxt and 3 < len(nxt) < 60 and not FORM_RE.match(nxt) and not MODULE_A_RE.match(nxt):
                        name = nxt.strip(" .:-\u2013")
                        break
                events.append((ly, "module", (ROMAN.get(mb.group(1).upper()), clean(name))))
        events.sort(key=lambda e: e[0])
        if debug:
            dbg = [(round(yv), k, (v if k == "form" else (v[0], (v[1] or "")[:24]))) for yv, k, v in events if k != "band"]
            print(f"  p{pno+1}: bands={len(info['bands'])} events={dbg}")

        # continuation page: matrix rows spilled from a previous page's band
        is_continuation = (
            not info["bands"]
            and info["maxline"] < 110
            and state["form"] is not None
            and fallback_bounds is not None
        )
        if is_continuation:
            ph = page.rect.height
            first_event_y = next(
                (yv for yv, k, _ in events if k in ("module", "form")), ph - 20
            )
            bounds = infer_bounds_from_lines(lines, 0, first_event_y)
            if bounds is None:
                bounds = last_bounds_before(page_info, pno) or fallback_bounds
            coltext = lines_to_columns(lines, bounds, 0, first_event_y)
            for k, text in coltext.items():
                if text:
                    state["acc"][k].append(text)

        for i, (y, kind, payload) in enumerate(events):
            if kind == "form":
                flush()
                state["form"] = payload
                state["module"] = None
                state["name"] = ""
            elif kind == "module":
                flush()
                state["module"], state["name"] = payload
            elif kind == "band":
                band_y0, band_y1, bounds = payload
                # find next event y below this band
                next_y = page_height(doc, pno)
                for y2, k2, p2 in events[i + 1:]:
                    if k2 == "band":
                        next_y = p2[0]
                        break
                    if k2 in ("module", "form"):
                        next_y = y2
                        break
                coltext = lines_to_columns(lines, bounds, band_y1, next_y)
                for k, text in coltext.items():
                    if text:
                        state["acc"][k].append(text)
    flush()
    return result


def main():
    pdf_path, subject_id = sys.argv[1], sys.argv[2]
    out_path = sys.argv[3] if len(sys.argv) > 3 else f"{subject_id}-matrix.json"
    result = extract(pdf_path, subject_id)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    for form, modules in result["forms"].items():
        print(f"Form {form}: {len(modules)} modules")
        for name, cols in modules.items():
            counts = {k: len(split_items(v, k)) for k, v in cols.items()}
            print(f"  {name[:46]:48s} {counts}")


if __name__ == "__main__":
    main()