import {
  HeadingLevel,
  Math as MathEquation,
  MathFraction,
  MathRadical,
  MathRun,
  MathSubScript,
  MathSuperScript,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { MathComponent, ParagraphChild } from "docx";

/* ------------------------------------------------------------------ */
/* AST                                                                */
/* ------------------------------------------------------------------ */

export type InlineNode =
  | { type: "text"; text: string }
  | { type: "bold"; children: InlineNode[] }
  | { type: "italic"; children: InlineNode[] }
  | { type: "code"; text: string }
  | { type: "math"; tex: string };

export type ListItemNode = { blocks: BlockNode[] };

export type BlockNode =
  | { type: "heading"; level: number; children: InlineNode[] }
  | { type: "paragraph"; children: InlineNode[] }
  | { type: "bulletedList"; items: ListItemNode[] }
  | { type: "numberedList"; items: ListItemNode[] }
  | { type: "table"; rows: InlineNode[][][] }
  | { type: "mathblock"; tex: string }
  | { type: "hr" }
  | { type: "quote"; children: BlockNode[] };

/* ------------------------------------------------------------------ */
/* Markdown parsing                                                    */
/* ------------------------------------------------------------------ */

export function parseInline(text: string): InlineNode[] {
  const INLINE_RE =
    /\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*\n]+)\*|___([^_]+)___|__([^_]+)__|_([^_\n]+)_|`([^`\n]+)`|\$([^$\n]+)\$|\\\(([^)]+)\\\)/g;
  const nodes: InlineNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(...inlineText(text.slice(last, m.index)));
    const [, b3, b2, i1, u3, u2, i2, code, math, parenMath] = m;
    if (b3 != null) nodes.push({ type: "bold", children: parseInline(b3) });
    else if (b2 != null) nodes.push({ type: "bold", children: parseInline(b2) });
    else if (u3 != null) nodes.push({ type: "bold", children: parseInline(u3) });
    else if (u2 != null) nodes.push({ type: "bold", children: parseInline(u2) });
    else if (i1 != null) nodes.push({ type: "italic", children: parseInline(i1) });
    else if (i2 != null) nodes.push({ type: "italic", children: parseInline(i2) });
    else if (code != null) nodes.push({ type: "code", text: code });
    else if (math != null || parenMath != null)
      nodes.push({ type: "math", tex: (math ?? parenMath ?? "").trim() });
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(...inlineText(text.slice(last)));
  return nodes;
}

const TEXT_COMMANDS = new Set([
  "\\text",
  "\\textbf",
  "\\textit",
  "\\mathrm",
  "\\operatorname",
  "\\mbox",
  "\\normal",
]);

function inlineText(text: string): InlineNode[] {
  const out: InlineNode[] = [];
  let buf = "";
  let i = 0;
  const flush = () => {
    if (buf.length > 0) {
      out.push({ type: "text", text: buf });
      buf = "";
    }
  };
  while (i < text.length) {
    const c = text[i];

    if (c === "\\") {
      const next = text.slice(i);
      const frac = FRAC_COMMANDS.exec(next);
      if (frac) {
        const num = readBalanced(text, i + frac[0].length);
        const den = num ? readBalanced(text, num.next) : null;
        if (num && den) {
          flush();
          out.push({ type: "math", tex: text.slice(i, den.next) });
          i = den.next;
          continue;
        }
      }
      if (next.startsWith("\\sqrt")) {
        let j = i + 5;
        let ok = true;
        if (text[j] === "[") {
          const k = text.indexOf("]", j);
          if (k < 0) ok = false;
          else j = k + 1;
        }
        if (ok && text[j] === "{") {
          const body = readBalanced(text, j);
          if (body) {
            flush();
            out.push({ type: "math", tex: text.slice(i, body.next) });
            i = body.next;
            continue;
          }
        }
      }
      const cmdMatch = /^\\[a-zA-Z]+/.exec(next);
      if (cmdMatch) {
        const cmd = cmdMatch[0];
        if (TEX_SYMBOLS[cmd] !== undefined) {
          flush();
          out.push({ type: "math", tex: cmd });
          i += cmd.length;
          continue;
        }
        if (cmd === "\\left" || cmd === "\\right" || cmd === "\\middle") {
          i += cmd.length;
          continue;
        }
        if (TEXT_COMMANDS.has(cmd) && text[i + cmd.length] === "{") {
          const g = readBalanced(text, i + cmd.length);
          if (g) {
            buf += g.inner;
            i = g.next;
            continue;
          }
        }
        buf += cmd.slice(1);
        i += cmd.length;
        continue;
      }
      const esc = /^\\(.)/.exec(next);
      if (esc) {
        buf += esc[1];
        i += 2;
        continue;
      }
      buf += c;
      i++;
      continue;
    }

    if ((c === "^" || c === "_") && i > 0 && /[A-Za-z0-9)\]}]/.test(text[i - 1])) {
      const j = i + 1;
      const nextIsGroup = text[j] === "{";
      const nextIsAtomic = j < text.length && /[\d(-]/.test(text[j]);
      if (buf.length > 0 && (nextIsGroup || nextIsAtomic)) {
        const frag = readBareMathTail(text, i);
        if (frag) {
          buf = buf.slice(0, -1);
          flush();
          out.push({ type: "math", tex: frag });
          i = i + frag.length - 1;
          continue;
        }
      }
    }

    buf += c;
    i++;
  }
  flush();
  return out;
}

function readBareMathTail(text: string, i: number): string | null {
  let frag = text[i - 1] + text[i];
  let j = i + 1;
  if (text[j] === "{") {
    const g = readBalanced(text, j);
    if (!g) return null;
    frag += `{${g.inner}}`;
    j = g.next;
  } else if (j < text.length && text[j] === "-") {
    frag += "-";
    j++;
    if (j < text.length && /\d/.test(text[j])) {
      frag += text[j];
      j++;
    }
  } else if (j < text.length && /[\d(]/.test(text[j])) {
    frag += text[j];
    j++;
  } else {
    return null;
  }
  while (j < text.length && (text[j] === "^" || text[j] === "_")) {
    const op = text[j];
    let jj = j + 1;
    if (text[jj] === "{") {
      const g = readBalanced(text, jj);
      if (!g) break;
      frag += op + `{${g.inner}}`;
      j = g.next;
    } else if (jj < text.length && /[\d(-]/.test(text[jj])) {
      frag += op + text[jj];
      j = jj + 1;
    } else {
      break;
    }
  }
  return frag;
}

function headingLevel(trimmed: string): number | null {
  const m = /^(#{1,6})\s*(.*)$/.exec(trimmed);
  if (!m) return null;
  if (m[2].trim() === "") return null;
  return m[1].length;
}

function indentWidth(line: string): number {
  const match = /^[ \t]*/.exec(line);
  return match ? match[0].length : 0;
}

function listKind(trimmed: string): "bulleted" | "numbered" {
  return /^[-*+•]\s/.test(trimmed) ? "bulleted" : "numbered";
}

function isListLine(trimmed: string): boolean {
  return /^[-*+•]\s/.test(trimmed) || /^\d+\s*[.)]\s/.test(trimmed);
}

function stripListMarker(trimmed: string): string {
  return trimmed.replace(/^[-*+•]\s+/, "").replace(/^\d+\s*[.)]\s+/, "");
}

function isTableStart(lines: string[], i: number): boolean {
  if (i + 1 >= lines.length) return false;
  if (!lines[i].includes("|")) return false;
  const sep = lines[i + 1].trim();
  if (!sep.includes("|") || !sep.includes("-")) return false;
  return /^[\s|:\\-]+$/.test(sep);
}

function consumeTable(lines: string[], i: number): { table: BlockNode; next: number } {
  const splitRow = (line: string): string[] => {
    const t = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    return t.split("|").map((c) => c.trim());
  };
  const header = splitRow(lines[i]);
  const rows: InlineNode[][][] = [header.map((c) => parseInline(c))];
  let j = i + 2;
  while (j < lines.length && lines[j].includes("|")) {
    rows.push(splitRow(lines[j]).map((c) => parseInline(c)));
    j++;
  }
  return { table: { type: "table", rows }, next: j };
}

function parseList(lines: string[], i: number): { items: ListItemNode[]; next: number } {
  const rootIndent = indentWidth(lines[i]);
  const items: ListItemNode[] = [];
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === "") {
      let j = i;
      while (j < lines.length && lines[j].trim() === "") j++;
      if (j >= lines.length) break;
      const nind = indentWidth(lines[j]);
      if (isListLine(lines[j].trim()) && nind >= rootIndent) {
        i = j;
        continue;
      }
      if (!isListLine(lines[j].trim()) && nind > rootIndent) {
        i = j;
        continue;
      }
      break;
    }
    const nind = indentWidth(line);
    if (!isListLine(trimmed)) {
      if (nind > rootIndent && items.length > 0) {
        items[items.length - 1].blocks.push({
          type: "paragraph",
          children: parseInline(trimmed),
        });
        i++;
        continue;
      }
      break;
    }
    if (nind < rootIndent) break;
    if (nind > rootIndent) {
      const nested = parseList(lines, i);
      const parent = items[items.length - 1];
      if (parent) {
        const kind = listKind(lines[i].trim());
        parent.blocks.push(
          kind === "numbered"
            ? { type: "numberedList", items: nested.items }
            : { type: "bulletedList", items: nested.items },
        );
      }
      i = nested.next;
      continue;
    }
    items.push({
      blocks: [
        {
          type: "paragraph",
          children: parseInline(stripListMarker(trimmed)),
        },
      ],
    });
    i++;
  }
  return { items, next: i };
}

export function parseMarkdown(md: string): BlockNode[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: BlockNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    const hl = headingLevel(trimmed);
    if (hl !== null) {
      blocks.push({
        type: "heading",
        level: hl,
        children: parseInline(trimmed.replace(/^#{1,6}\s*/, "")),
      });
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    if (trimmed.startsWith("$$")) {
      let buf = trimmed.slice(2);
      let j = i + 1;
      let closed = false;
      while (j < lines.length && !closed) {
        const idx = lines[j].indexOf("$$");
        if (idx >= 0) {
          buf += "\n" + lines[j].slice(0, idx);
          closed = true;
        } else {
          buf += "\n" + lines[j];
          j++;
        }
        if (!closed) j++;
      }
      blocks.push({ type: "mathblock", tex: buf.trim() });
      i = closed ? j + 1 : lines.length;
      continue;
    }

    if (trimmed === "\\[") {
      let buf = "";
      let j = i + 1;
      let closed = false;
      while (j < lines.length && !closed) {
        if (lines[j].trim() === "\\]") {
          closed = true;
          break;
        }
        buf += lines[j] + "\n";
        j++;
      }
      blocks.push({ type: "mathblock", tex: buf.trim() });
      i = closed ? j + 1 : lines.length;
      continue;
    }

    if (isTableStart(lines, i)) {
      const res = consumeTable(lines, i);
      blocks.push(res.table);
      i = res.next;
      continue;
    }

    if (isListLine(trimmed)) {
      const res = parseList(lines, i);
      const kind = listKind(lines[i].trim());
      blocks.push(
        kind === "numbered"
          ? { type: "numberedList", items: res.items }
          : { type: "bulletedList", items: res.items },
      );
      i = res.next;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const buf: string[] = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith(">")) {
        buf.push(lines[j].trim().replace(/^>\s?/, ""));
        j++;
      }
      blocks.push({ type: "quote", children: parseMarkdown(buf.join("\n")) });
      i = j;
      continue;
    }

    {
      const buf: string[] = [trimmed];
      let j = i + 1;
      while (j < lines.length) {
        const t = lines[j].trim();
        if (t === "") break;
        if (headingLevel(t) !== null) break;
        if (isListLine(t)) break;
        if (t.startsWith(">")) break;
        if (t.startsWith("$$") || t === "\\[") break;
        if (isTableStart(lines, j)) break;
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) break;
        buf.push(t);
        j++;
      }
      blocks.push({ type: "paragraph", children: parseInline(buf.join("\n")) });
      i = j;
    }
  }

  return blocks;
}

/* ------------------------------------------------------------------ */
/* LaTeX -> math                                                       */
/* ------------------------------------------------------------------ */

const TEX_SYMBOLS: Record<string, string> = {
  "\\times": "×", "\\div": "÷", "\\cdot": "·", "\\pm": "±", "\\mp": "∓",
  "\\infty": "∞", "\\neq": "≠", "\\ne": "≠", "\\leq": "≤", "\\le": "≤",
  "\\geq": "≥", "\\ge": "≥", "\\approx": "≈", "\\equiv": "≡",
  "\\rightarrow": "→", "\\to": "→", "\\Rightarrow": "⇒", "\\leftarrow": "←",
  "\\leftrightarrow": "↔", "\\propto": "∝", "\\in": "∈", "\\notin": "∉",
  "\\subset": "⊂", "\\supset": "⊃", "\\subseteq": "⊆", "\\supseteq": "⊇",
  "\\cup": "∪", "\\cap": "∩", "\\forall": "∀", "\\exists": "∃",
  "\\partial": "∂", "\\nabla": "∇", "\\ldots": "…", "\\dots": "…", "\\cdots": "⋯",
  "\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\delta": "δ",
  "\\epsilon": "ε", "\\varepsilon": "ε", "\\zeta": "ζ", "\\eta": "η",
  "\\theta": "θ", "\\vartheta": "ϑ", "\\iota": "ι", "\\kappa": "κ",
  "\\lambda": "λ", "\\mu": "μ", "\\nu": "ν", "\\xi": "ξ", "\\pi": "π",
  "\\rho": "ρ", "\\sigma": "σ", "\\tau": "τ", "\\upsilon": "υ", "\\phi": "φ",
  "\\varphi": "φ", "\\chi": "χ", "\\psi": "ψ", "\\omega": "ω",
  "\\Gamma": "Γ", "\\Delta": "Δ", "\\Theta": "Θ", "\\Lambda": "Λ", "\\Xi": "Ξ",
  "\\Pi": "Π", "\\Sigma": "Σ", "\\Upsilon": "Υ", "\\Phi": "Φ", "\\Psi": "Ψ",
  "\\Omega": "Ω", "\\%": "%", "\\ast": "*", "\\circ": "∘", "\\degree": "°",
  "\\parallel": "∥", "\\perp": "⊥", "\\angle": "∠", "\\hbar": "ħ",
  "\\because": "∵", "\\therefore": "∴", "\\cdotp": "·",
  "\\sin": "sin ", "\\cos": "cos ", "\\tan": "tan ", "\\cot": "cot ",
  "\\sec": "sec ", "\\csc": "csc ", "\\arcsin": "arcsin ", "\\arccos": "arccos ",
  "\\arctan": "arctan ", "\\sinh": "sinh ", "\\cosh": "cosh ", "\\tanh": "tanh ",
  "\\log": "log ", "\\ln": "ln ", "\\exp": "exp ", "\\max": "max ", "\\min": "min ",
  "\\lim": "lim ", "\\det": "det ", "\\mod": "mod ", "\\bmod": " mod ",
  "\\,": "", "\\ ": "", "\\!": "", "\\quad": "  ", "\\qquad": "    ",
};

const FRAC_COMMANDS = /^\\(?:frac|dfrac|tfrac|cfrac)\b/;

function readBalanced(tex: string, i: number): { inner: string; next: number } {
  let depth = 0;
  for (let j = i; j < tex.length; j++) {
    if (tex[j] === "{") depth++;
    else if (tex[j] === "}") {
      depth--;
      if (depth === 0) return { inner: tex.slice(i + 1, j), next: j + 1 };
    }
  }
  return { inner: tex.slice(i + 1), next: tex.length };
}

function parseTexExpr(tex: string): MathComponent[] {
  const out: MathComponent[] = [];
  let run = "";
  let i = 0;

  const flush = () => {
    if (run.length > 0) {
      out.push(new MathRun(run));
      run = "";
    }
  };

  while (i < tex.length) {
    const c = tex[i];
    const next = tex.slice(i);

    if (c === "}" || c === " ") {
      i++;
      continue;
    }
    if (c === "{") {
      flush();
      i++;
      continue;
    }

    if (c === "\\") {
      const frac = FRAC_COMMANDS.exec(next);
      if (frac) {
        flush();
        const num = readBalanced(tex, i + frac[0].length);
        if (num) {
          const den = readBalanced(tex, num.next);
          if (den) {
            out.push(
              new MathFraction({
                numerator: parseTexExpr(num.inner),
                denominator: parseTexExpr(den.inner),
              }),
            );
            i = den.next;
            continue;
          }
        }
        i++;
        continue;
      }
      if (next.startsWith("\\sqrt")) {
        flush();
        let j = i + 5;
        let degree = "";
        if (tex[j] === "[") {
          const k = tex.indexOf("]", j);
          degree = tex.slice(j + 1, k >= 0 ? k : j + 1);
          j = k >= 0 ? k + 1 : j + 1;
        }
        const body = readBalanced(tex, j);
        if (body) {
          out.push(
            new MathRadical({
              children: parseTexExpr(body.inner),
              degree: degree ? parseTexExpr(degree) : undefined,
            }),
          );
          i = body.next;
          continue;
        }
        i += 5;
        continue;
      }
      if (next.startsWith("\\left") || next.startsWith("\\right") || next.startsWith("\\middle")) {
        i += 6;
        continue;
      }
      const word = /^[a-zA-Z]+/.exec(next.slice(1));
      const cmd = word ? "\\" + word[0] : "\\";
      flush();
      const sym = TEX_SYMBOLS[cmd];
      if (sym !== undefined) {
        if (sym.length > 0) out.push(new MathRun(sym));
        i += 1 + (word ? word[0].length : 1);
      } else if (word) {
        out.push(new MathRun(word[0]));
        i += 1 + word[0].length;
      } else {
        i++;
      }
      continue;
    }

    if (c === "^") {
      flush();
      const base = out.pop() ?? new MathRun("");
      const sup = readAtom(tex, i + 1);
      if (sup) {
        out.push(new MathSuperScript({ children: [base], superScript: sup.nodes }));
        i = sup.next;
        continue;
      }
      out.push(base);
      i++;
      continue;
    }
    if (c === "_") {
      flush();
      const base = out.pop() ?? new MathRun("");
      const sub = readAtom(tex, i + 1);
      if (sub) {
        out.push(new MathSubScript({ children: [base], subScript: sub.nodes }));
        i = sub.next;
        continue;
      }
      out.push(base);
      i++;
      continue;
    }

    const wordStrip = /^[A-Za-z0-9.,:;=+\-/*()|\u00B0\u00B2\u00B3]+/.exec(next);
    if (wordStrip) {
      run += wordStrip[0];
      i += wordStrip[0].length;
      continue;
    }
    run += c;
    i++;
  }

  flush();
  return out;
}

function readAtom(
  tex: string,
  i: number,
): { nodes: MathComponent[]; next: number } | null {
  if (i >= tex.length) return null;
  if (tex[i] === "{") {
    const g = readBalanced(tex, i);
    return { nodes: parseTexExpr(g.inner), next: g.next };
  }
  if (tex[i] === "\\") {
    const next = tex.slice(i);
    const frac = FRAC_COMMANDS.exec(next);
    if (frac) {
      const num = readBalanced(tex, i + frac[0].length);
      const den = num ? readBalanced(tex, num.next) : null;
      if (num && den) {
        return {
          nodes: [
            new MathFraction({
              numerator: parseTexExpr(num.inner),
              denominator: parseTexExpr(den.inner),
            }),
          ],
          next: den.next,
        };
      }
    }
    const word = /^[a-zA-Z]+/.exec(next.slice(1));
    const cmd = word ? "\\" + word[0] : "\\";
    const sym = TEX_SYMBOLS[cmd];
    if (sym !== undefined) {
      return {
        nodes: sym.length > 0 ? [new MathRun(sym)] : [],
        next: i + 1 + (word ? word[0].length : 1),
      };
    }
    if (word) {
      return { nodes: [new MathRun(word[0])], next: i + 1 + word[0].length };
    }
    return { nodes: [new MathRun("\\")], next: i + 1 };
  }
  if (/[\d.]/.test(tex[i])) {
    const m = /^[\d.]+/.exec(tex.slice(i));
    if (m) return { nodes: [new MathRun(m[0])], next: i + m[0].length };
  }
  return { nodes: [new MathRun(tex[i])], next: i + 1 };
}

/* ------------------------------------------------------------------ */
/* docx rendering                                                      */
/* ------------------------------------------------------------------ */

const HEADING_LEVEL: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
};

function textToRuns(text: string, bold: boolean, italics: boolean): TextRun[] {
  const parts = text.split("\n");
  const runs: TextRun[] = [];
  parts.forEach((part, idx) => {
    runs.push(new TextRun({ text: part, bold, italics }));
    if (idx < parts.length - 1) runs.push(new TextRun({ break: 1 }));
  });
  return runs;
}

function inlineToChildren(
  nodes: InlineNode[],
  bold: boolean,
  italics: boolean,
): ParagraphChild[] {
  const out: ParagraphChild[] = [];
  for (const node of nodes) {
    switch (node.type) {
      case "text":
        out.push(...textToRuns(node.text, bold, italics));
        break;
      case "code":
        out.push(
          new TextRun({
            text: node.text,
            bold,
            font: "Consolas",
            color: "1F2937",
            shading: { fill: "F3F4F6", type: ShadingType.CLEAR, color: "auto" },
          }),
        );
        break;
      case "bold":
        out.push(...inlineToChildren(node.children, true, italics));
        break;
      case "italic":
        out.push(...inlineToChildren(node.children, bold, true));
        break;
      case "math":
        out.push(new MathEquation({ children: parseTexExpr(node.tex) }));
        break;
    }
  }
  return out;
}

export function mdToDocxElements(md: string, baseLevel = 0): (Paragraph | Table)[] {
  return blocksToDocx(parseMarkdown(md), Math.max(0, baseLevel));
}

export function blocksToDocx(
  blocks: BlockNode[],
  level: number,
): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case "heading": {
        const mapped = HEADING_LEVEL[Math.min(6, Math.max(1, block.level))];
        out.push(new Paragraph({ heading: mapped, children: inlineToChildren(block.children, false, false) }));
        break;
      }
      case "paragraph":
        out.push(new Paragraph({ children: inlineToChildren(block.children, false, false), spacing: { after: 120 } }));
        break;
      case "bulletedList":
        renderList(block.items, "lp-bullet", level, out);
        break;
      case "numberedList":
        renderList(block.items, "lp-number", level, out);
        break;
      case "mathblock":
        out.push(new Paragraph({ children: [new MathEquation({ children: parseTexExpr(block.tex) })] }));
        break;
      case "quote": {
        for (const inner of block.children) {
          if (inner.type === "paragraph") {
            out.push(
              new Paragraph({
                indent: { left: 720, right: 360 },
                border: {
                  left: {
                    style: "single" as const,
                    size: 12,
                    color: "9CA3AF",
                    space: 4,
                  },
                },
                spacing: { after: 120 },
                children: inlineToChildren(inner.children, false, true),
              }),
            );
          } else if (inner.type === "heading") {
            const mapped = HEADING_LEVEL[Math.min(6, Math.max(1, inner.level))];
            out.push(
              new Paragraph({
                heading: mapped,
                indent: { left: 720 },
                children: inlineToChildren(inner.children, false, false),
              }),
            );
          } else {
            out.push(...blocksToDocx([inner], level));
          }
        }
        break;
      }
      case "hr":
        out.push(
          new Paragraph({
            border: {
              bottom: { style: "single" as const, size: 6, color: "9CA3AF", space: 1 },
            },
            spacing: { after: 200 },
          }),
        );
        break;
      case "table":
        out.push(renderTableBlock(block.rows));
        break;
    }
  }
  return out;
}

function renderList(
  items: ListItemNode[],
  reference: "lp-bullet" | "lp-number",
  level: number,
  out: (Paragraph | Table)[],
): void {
  for (const item of items) {
    item.blocks.forEach((blk, index) => {
      if (blk.type === "paragraph") {
        out.push(
          new Paragraph({
            numbering:
              index === 0
                ? { reference, level: Math.min(4, Math.max(0, level)) }
                : undefined,
            indent: index === 0 ? undefined : { left: (level + 1) * 360 },
            spacing: { after: 60 },
            children: inlineToChildren(blk.children, false, false),
          }),
        );
      } else if (blk.type === "bulletedList") {
        renderList(blk.items, "lp-bullet", level + 1, out);
      } else if (blk.type === "numberedList") {
        renderList(blk.items, "lp-number", level + 1, out);
      } else {
        out.push(...blocksToDocx([blk], level + 1));
      }
    });
  }
}

function renderTableBlock(rows: InlineNode[][][]): Table {
  const border = {
    style: "single" as const,
    size: 4,
    color: "6B7280",
  };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: border,
      bottom: border,
      left: border,
      right: border,
      insideHorizontal: border,
      insideVertical: border,
    },
    rows: rows.map((row, rowIndex) =>
      new TableRow({
        tableHeader: rowIndex === 0,
        children: row.map((cell) =>
          new TableCell({
            shading:
              rowIndex === 0
                ? { fill: "EEF2FF", color: "auto", type: ShadingType.CLEAR }
                : undefined,
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({
                spacing: { after: 0 },
                children: inlineToChildren(cell, rowIndex === 0, false),
              }),
            ],
          }),
        ),
      }),
    ),
  });
}

/* ------------------------------------------------------------------ */
/* HTML rendering (for PDF via print)                                  */
/* ------------------------------------------------------------------ */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inlineToHtml(nodes: InlineNode[]): string {
  let html = "";
  for (const node of nodes) {
    switch (node.type) {
      case "text":
        html += escapeHtml(node.text);
        break;
      case "code":
        html += `<code class="mi">${escapeHtml(node.text)}</code>`;
        break;
      case "bold":
        html += `<strong>${inlineToHtml(node.children)}</strong>`;
        break;
      case "italic":
        html += `<em>${inlineToHtml(node.children)}</em>`;
        break;
      case "math":
        html += `<span class="mq">${texToHtml(node.tex)}</span>`;
        break;
    }
  }
  return html;
}

function itemToHtml(item: ListItemNode): string {
  const content = item.blocks
    .map((blk) => {
      switch (blk.type) {
        case "paragraph":
          return inlineToHtml(blk.children);
        case "bulletedList":
          return `<ul>${blk.items.map(itemToHtml).join("")}</ul>`;
        case "numberedList":
          return `<ol>${blk.items.map(itemToHtml).join("")}</ol>`;
        default:
          return blockToHtml(blk);
      }
    })
    .join("");
  return `<li>${content}</li>`;
}

function blockToHtml(block: BlockNode): string {
  switch (block.type) {
    case "heading": {
      const tag = Math.min(6, Math.max(1, block.level));
      return `<h${tag}>${inlineToHtml(block.children)}</h${tag}>`;
    }
    case "paragraph":
      return `<p>${inlineToHtml(block.children)}</p>`;
    case "bulletedList":
      return `<ul>${block.items.map(itemToHtml).join("")}</ul>`;
    case "numberedList":
      return `<ol>${block.items.map(itemToHtml).join("")}</ol>`;
    case "mathblock":
      return `<div class="mq eq">${texToHtml(block.tex)}</div>`;
    case "hr":
      return "<hr>";
    case "quote":
      return `<blockquote>${block.children.map(blockToHtml).join("")}</blockquote>`;
    case "table": {
      const [first, ...rest] = block.rows;
      const renderCell = (cell: InlineNode[], tag: "th" | "td") =>
        `<${tag}>${inlineToHtml(cell)}</${tag}>`;
      const thead = first
        ? `<thead><tr>${first.map((c) => renderCell(c, "th")).join("")}</tr></thead>`
        : "";
      const tbody = rest.length
        ? `<tbody>${rest
            .map((row) => `<tr>${row.map((c) => renderCell(c, "td")).join("")}</tr>`)
            .join("")}</tbody>`
        : "";
      return `<table>${thead}${tbody}</table>`;
    }
  }
}

export function mdToHtml(md: string): string {
  return parseMarkdown(md)
    .map(blockToHtml)
    .join("");
}

function texToHtml(tex: string): string {
  let html = "";
  let i = 0;
  while (i < tex.length) {
    const c = tex[i];
    const next = tex.slice(i);
    if (c === "{" || c === "}") {
      i++;
      continue;
    }
    if (c === " ") {
      i++;
      continue;
    }
    if (c === "\\") {
      const frac = FRAC_COMMANDS.exec(next);
      if (frac) {
        const num = readBalanced(tex, i + frac[0].length);
        const den = num ? readBalanced(tex, num.next) : null;
        if (num && den) {
          html += `<span class="frac"><span class="num">${texToHtml(num.inner)}</span><span class="den">${texToHtml(den.inner)}</span></span>`;
          i = den.next;
          continue;
        }
        i++;
        continue;
      }
      if (next.startsWith("\\sqrt")) {
        let j = i + 5;
        let degree = "";
        if (tex[j] === "[") {
          const k = tex.indexOf("]", j);
          degree = tex.slice(j + 1, k >= 0 ? k : j + 1);
          j = k >= 0 ? k + 1 : j + 1;
        }
        const body = readBalanced(tex, j);
        if (body) {
          html += `<span class="sqrt"><sup class="rdeg">${escapeHtml(degree)}</sup><span class="root">√</span><span class="rad">${texToHtml(body.inner)}</span></span>`;
          i = body.next;
          continue;
        }
        i += 5;
        continue;
      }
      if (next.startsWith("\\left") || next.startsWith("\\right") || next.startsWith("\\middle")) {
        i += 6;
        continue;
      }
      const word = /^[a-zA-Z]+/.exec(next.slice(1));
      const cmd = word ? "\\" + word[0] : "\\";
      const sym = TEX_SYMBOLS[cmd];
      if (sym !== undefined) {
        html += escapeHtml(sym);
        i += 1 + (word ? word[0].length : 1);
      } else if (word) {
        html += escapeHtml(word[0]);
        i += 1 + word[0].length;
      } else {
        i++;
      }
      continue;
    }
    if (c === "^") {
      const atom = readHtmlAtom(tex, i + 1);
      html += `<sup>${atom.html}</sup>`;
      i = atom.next;
      continue;
    }
    if (c === "_") {
      const atom = readHtmlAtom(tex, i + 1);
      html += `<sub>${atom.html}</sub>`;
      i = atom.next;
      continue;
    }
    // math chars typically rendered in italic serif, so map common letters only:
    const chunk = /^[A-Za-z0-9.,:;=+\-*/()|\u00B0\u00B2\u00B3]+/.exec(next);
    if (chunk) {
      html += escapeHtml(chunk[0]);
      i += chunk[0].length;
      continue;
    }
    html += escapeHtml(c);
    i++;
  }
  return html;
}

function readHtmlAtom(tex: string, i: number): { html: string; next: number } {
  if (i >= tex.length) return { html: "", next: i };
  if (tex[i] === "{") {
    const g = readBalanced(tex, i);
    return { html: texToHtml(g.inner), next: g.next };
  }
  if (tex[i] === "\\") {
    const frac = FRAC_COMMANDS.exec(tex.slice(i));
    if (frac) {
      const num = readBalanced(tex, i + frac[0].length);
      const den = num ? readBalanced(tex, num.next) : null;
      if (num && den) {
        return {
          html: `<span class="frac"><span class="num">${texToHtml(num.inner)}</span><span class="den">${texToHtml(den.inner)}</span></span>`,
          next: den.next,
        };
      }
    }
    const word = /^[a-zA-Z]+/.exec(tex.slice(i + 1));
    const cmd = word ? "\\" + word[0] : "\\";
    const sym = TEX_SYMBOLS[cmd];
    if (sym !== undefined) {
      return {
        html: escapeHtml(sym),
        next: i + 1 + (word ? word[0].length : 1),
      };
    }
    if (word) return { html: escapeHtml(word[0]), next: i + 1 + word[0].length };
    return { html: "\\", next: i + 1 };
  }
  if (/[\d.]/.test(tex[i])) {
    const m = /^[\d.]+/.exec(tex.slice(i));
    if (m) return { html: escapeHtml(m[0]), next: i + m[0].length };
  }
  return { html: escapeHtml(tex[i]), next: i + 1 };
}