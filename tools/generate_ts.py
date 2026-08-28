# -*- coding: utf-8 -*-
"""Generate src/db/syllabus-matrix.generated.ts from all-matrices.json."""
import json
import re

SRC = r"C:\Users\SHALOM\AppData\Local\Temp\opencode\syllabus\all-matrices.json"
OUT = r"C:\Users\SHALOM\Documents\MyOpenCodeProjects\oc-lesson-planner2\src\db\syllabus-matrix.generated.ts"

MAX_COL = 1600  # per-column character cap

JUNK_KEY_RE = re.compile(r"^\s*(NUMBER OF|PERIODS|TITLE OF MODULE\s*$)", re.I)


def clean(s):
    if not s:
        return ""
    # private-use glyphs: apostrophes and bullets embedded by the PDF fonts
    s = re.sub(r"[\ue000-\uf8ff]", "'", s)
    s = re.sub(r"''+", "'", s)
    s = re.sub(r"\s+", " ", s).strip()
    # drop consecutive duplicate fragments (headers repeated per row band)
    frags = re.split(r"(\s(?:-\s?|\u2022\s?|\*\s?))", s)
    items = []
    for frag in frags:
        if not frag:
            continue
        if re.fullmatch(r"\s(?:-\s?|\u2022\s?|\*\s?)", frag):
            if items:
                items.append(frag)
            continue
        if items and items[-1] and items[-1][-1] not in "-*•" and items[-1].strip() == frag.strip():
            continue
        items.append(frag)
    text = ""
    for it in items:
        text += it if it.startswith((" ", "-", "\u2022", "*")) else (" " + it if text else it)
    # collapse exact repeated sentences
    sentences = re.split(r"(?<=[.;])\s+", text.strip())
    deduped = []
    for sent in sentences:
        if deduped and deduped[-1].strip().lower() == sent.strip().lower():
            continue
        deduped.append(sent)
    return " ".join(deduped)[:MAX_COL].strip()


def ts_str(s):
    return json.dumps(s, ensure_ascii=False)


def main():
    data = json.load(open(SRC, encoding="utf-8"))
    lines = []
    lines.append("// AUTO-GENERATED from the official MINESEC syllabus PDFs in samples/")
    lines.append("// by tools/extract-syllabus.py. Do not edit by hand.")
    lines.append("")
    lines.append("export interface MatrixModuleData {")
    for col in ["families", "examples", "categories", "actions", "content", "aptitudes", "attitudes", "other"]:
        lines.append(f"  {col}?: string;")
    lines.append("}")
    lines.append("")
    lines.append('/** Form level ("1".."5") -> module key -> matrix columns. */')
    lines.append("export type MatrixForm = Record<string, Record<string, MatrixModuleData>>;")
    lines.append("")
    lines.append("export const SYLLABUS_MATRIX: Record<string, MatrixForm> = {")

    total_modules = 0
    for subject in sorted(data.keys()):
        forms = data[subject]
        if not forms:
            continue
        lines.append(f"  {json.dumps(subject)}: {{")
        for form in sorted(forms, key=lambda f: (len(f), f)):
            modules = forms[form]
            kept = {}
            for name, cols in modules.items():
                nm = name.strip()
                if not nm or JUNK_KEY_RE.match(nm):
                    continue
                cleaned = {}
                for col, val in cols.items():
                    v = clean(val)
                    if v:
                        cleaned[col] = v
                if cleaned:
                    kept[nm] = cleaned
            if not kept:
                continue
            lines.append(f"    {json.dumps(form)}: {{")
            for nm, cols in kept.items():
                total_modules += 1
                lines.append(f"      {json.dumps(nm)}: {{")
                for col, val in cols.items():
                    lines.append(f"        {col}: {ts_str(val)},")
                lines.append("      },")
            lines.append("    },")
        lines.append("  },")
    lines.append("};")
    lines.append("")

    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines))
    print(f"wrote {OUT}: {total_modules} module entries")


if __name__ == "__main__":
    main()