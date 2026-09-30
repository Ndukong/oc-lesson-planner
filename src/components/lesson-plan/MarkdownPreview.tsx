import { type ReactNode } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const INLINE_MATH_RE = /\$(?:\\\(|\$)?([^$\n]+?)(?:\\\)|\$)?\$/g;
const DISPLAY_MATH_RE = /^\$\$\s*([\s\S]*?)\$\s*$/;
const DISPLAY_MATH_BRACKET_RE = /^\\\[\s*([\s\S]*?)\\\]\s*$/;
const PAREN_MATH_RE = /\\\(([^)\\]+)\\\)/g;

function MathTex({ tex, display }: { tex: string; display: boolean }) {
  let html = "";
  try {
    html = katex.renderToString(tex, {
      throwOnError: false,
      displayMode: display
    });
  } catch {
    html = `<span>${tex}</span>`;
  }
  const el = <span dangerouslySetInnerHTML={{ __html: html }} />;
  return display ? <div className="my-2 overflow-x-auto">{el}</div> : <span className="mx-0.5">{el}</span>;
}

function extractMathLike(chunk: string): string | null {
  if (chunk.startsWith("$") && chunk.endsWith("$") && chunk.length > 2) {
    const m = INLINE_MATH_RE.exec(chunk);
    INLINE_MATH_RE.lastIndex = 0;
    return m ? m[1].trim() : null;
  }
  if (chunk.startsWith("\\(") && chunk.endsWith("\\)")) {
    const m = PAREN_MATH_RE.exec(chunk);
    PAREN_MATH_RE.lastIndex = 0;
    return m ? m[1].trim() : null;
  }
  return null;
}

function extractDisplayMath(line: string): string | null {
  // Check for $$...$$ display math
  let m = DISPLAY_MATH_RE.exec(line);
  if (m) return m[1].trim();
  // Check for \[...\] display math
  m = DISPLAY_MATH_BRACKET_RE.exec(line);
  if (m) return m[1].trim();
  return null;
}

/** Render inline text supporting **bold**, *italic*, `code` and $math$ / \(math\). */
function renderInline(text: string, keyBase = 0): ReactNode[] {
  const nodes: ReactNode[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\$[^$\n]+\$|\\\([^)\\]+\\\))/g);
  let k = 0;
  parts.forEach((chunk) => {
    if (!chunk) return;
    if (chunk.startsWith("**") && chunk.endsWith("**") && chunk.length > 4) {
      nodes.push(<strong key={`${keyBase}-${k++}`} className="font-semibold text-slate-900 dark:text-slate-100">{chunk.slice(2, -2)}</strong>);
    } else {
      const tex = extractMathLike(chunk);
      if (tex != null) {
        nodes.push(<MathTex key={`${keyBase}-${k++}`} tex={tex} display={false} />);
      } else if (chunk.startsWith("`") && chunk.endsWith("`")) {
        nodes.push(<code key={`${keyBase}-${k++}`} className="rounded bg-slate-100 px-1 text-[0.9em] text-slate-800 dark:bg-slate-800 dark:text-slate-200">{chunk.slice(1, -1)}</code>);
      } else {
        nodes.push(<span key={`${keyBase}-${k++}`}>{chunk}</span>);
      }
    }
  });
  return nodes;
}

export function MarkdownPreview({ text }: { text: string }) {
  if (!text.trim()) {
    return <p className="text-sm italic text-slate-400">No content yet.</p>;
  }

  const lines = text.split("\n");
  const elements: ReactNode[] = [];
  let list: ReactNode[] = [];

  const flushList = (key: string) => {
    if (list.length) {
      elements.push(
        <ul key={key} className="my-1 list-disc space-y-0.5 pl-5">
          {list}
        </ul>
      );
      list = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      flushList(`h-${i}`);
      elements.push(
        <h4 key={i} className="mt-3 mb-1 text-sm font-bold text-slate-900 dark:text-slate-100">
          {renderInline(trimmed.slice(3).trim(), i)}
        </h4>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      list.push(
        <li key={i} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {renderInline(trimmed.slice(2), i)}
        </li>
      );
    } else if (/^\[(Draw|Diagram|Figure)/i.test(trimmed)) {
      flushList(`d-${i}`);
      elements.push(
        <div
          key={i}
          className="my-2 flex min-h-[64px] items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-xs italic text-slate-500 dark:border-slate-600 dark:bg-slate-800"
        >
          {trimmed.replace(/^\[|\]$/g, "")}
        </div>
      );
    } else if (trimmed === "") {
      flushList(`e-${i}`);
    } else if (/^\$\$/.test(trimmed) || /^\\\[/.test(trimmed)) {
      flushList(`m-${i}`);
      const tex = extractDisplayMath(trimmed);
      if (tex) {
        elements.push(<MathTex key={i} tex={tex} display />);
      } else {
        elements.push(<p key={i} className="my-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{renderInline(trimmed, i)}</p>);
      }
    } else if (/^\d+\.\s/.test(trimmed)) {
      flushList(`n-${i}`);
      elements.push(
        <p key={i} className="my-0.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {renderInline(trimmed, i)}
        </p>
      );
    } else {
      flushList(`p-${i}`);
      elements.push(
        <p key={i} className="my-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {renderInline(trimmed, i)}
        </p>
      );
    }
  });
  flushList("final");

  return <div>{elements}</div>;
}
