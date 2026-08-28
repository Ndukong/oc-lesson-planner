# -*- coding: utf-8 -*-
"""Batch-extract all MINESEC syllabus PDFs and merge per subject."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_syllabus import extract  # noqa: E402

SAMPLES = r"C:\Users\SHALOM\Documents\MyOpenCodeProjects\oc-lesson-planner2\samples"
OUT = r"C:\Users\SHALOM\AppData\Local\Temp\opencode\syllabus"

# (subject_id, [(pdf filename, label for debug)])
BATCH = [
    ("physics", [("Physics Syllabus Forms 1 & 2.pdf", "f12"),
                 ("Physics Syllabus Form 3-5.pdf", "f35")]),
    ("biology", [("Biology Syllabus - F1 and F2.pdf", "f12"),
                 ("Biology Syllabus - F3 to F5.pdf", "f35")]),
    ("chemistry", [("Chemistry Syllabus - F3 to F5.pdf", "f35")]),
    ("computer-science", [("Computer Science Syllabus - F1 and F2.pdf", "f12"),
                          ("Computer Science Syllabus F3_4_5.pdf", "f35")]),
    ("human-biology", [("Human Biiology Syllabus (F4 and F5).pdf", "f45")]),
    ("mathematics", [("Mathematics Syllabus - F1 and F2.pdf", "f12"),
                     ("Math syllabus for forma 3 to 5.pdf", "f35")]),
    ("economics", [("Economics Syllabus - F3 to F5.pdf", "f35")]),
    ("geography", [("Geography Syllabus - F3 to F5.pdf", "f35")]),
    ("geology", [("Geology Syllabus - F3 to F5.pdf", "f35")]),
    ("history", [("History syllabus - F3 to F5.pdf", "f35")]),
    ("citizenship-education", [("Citizenship Education Syllabus - F3 to F5.pdf", "f35")]),
    ("literature-in-english", [("LITERATURE IN ENGLISH 2024 FORM ONE.pdf", "f1"),
                               ("LITERATURE IN ENGLISH 2024 FORM TWO.pdf", "f2"),
                               ("LITERATURE IN ENGLISH 2024 FORM THREE.pdf", "f3")]),
]

merged_all = {}
for subject_id, pdfs in BATCH:
    merged = {}
    for fname, label in pdfs:
        path = os.path.join(SAMPLES, fname)
        if not os.path.exists(path):
            print(f"[{subject_id}] MISSING: {fname}")
            continue
        try:
            res = extract(path, subject_id)
        except Exception as e:  # noqa: BLE001
            print(f"[{subject_id}] ERROR in {fname}: {e}")
            continue
        for form, modules in res["forms"].items():
            target = merged.setdefault(form, {})
            for name, cols in modules.items():
                if name in target:
                    # merge columns from duplicate module keys
                    for k, v in cols.items():
                        if v and not target[name].get(k):
                            target[name][k] = v
                else:
                    target[name] = cols
        counts = {f: len(m) for f, m in res["forms"].items()}
        print(f"[{subject_id}] {label}: forms {counts}")
    merged_all[subject_id] = merged

with open(os.path.join(OUT, "all-matrices.json"), "w", encoding="utf-8") as f:
    json.dump(merged_all, f, ensure_ascii=False, indent=1)

print("\n=== SUMMARY (forms -> module count) ===")
for subject_id, forms in merged_all.items():
    print(f"{subject_id:22s} { {f: len(m) for f, m in sorted(forms.items())} }")