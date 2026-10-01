import { type ReactNode, Fragment } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const INLINE_MATH_RE = /\$(?:\\\(|\$)?([^$\n]+?)(?:\\\)|\$)?\$/g;
const PAREN_MATH_RE = /\\\(([^\)\\]+)\\\)/g;

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

/** Render inline text supporting **bold**, *italic*, `code` and $math$ / \(math\). */
function renderInline(text: string, keyBase = 0): ReactNode[] {
  const nodes: ReactNode[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\$[^$\n]+\$|\\\([^\)\\]+\\\))/g);
  let k = 0;
  parts.forEach((chunk) => {
    if (!chunk) return;
    if (chunk.startsWith("**") && chunk.endsWith("**") && chunk.length > 4) {
      nodes.push(<strong key={`${keyBase}-${k++}`} className="font-semibold text-slate-900 dark:text-slate-100">{chunk.slice(2, -2)}</strong>);
    } else if (chunk.startsWith("*") && chunk.endsWith("*") && chunk.length > 2 && !chunk.startsWith("**")) {
      nodes.push(<em key={`${keyBase}-${k++}`} className="italic text-slate-900 dark:text-slate-100">{chunk.slice(1, -1)}</em>);
    } else if (chunk.startsWith("`") && chunk.endsWith("`")) {
      nodes.push(<code key={`${keyBase}-${k++}`} className="rounded bg-slate-100 px-1 text-[0.9em] text-slate-800 dark:bg-slate-800 dark:text-slate-200">{chunk.slice(1, -1)}</code>);
    } else {
      const tex = extractMathLike(chunk);
      if (tex != null) {
        nodes.push(<MathTex key={`${keyBase}-${k++}`} tex={tex} display={false} />);
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
  let listType: "bulleted" | "numbered" | null = null;

  const flushList = (key: string) => {
    if (list.length) {
      elements.push(
        <ul key={key} className={`my-1 space-y-0.5 pl-5 ${listType === "numbered" ? "list-decimal" : "list-disc"}`}>
          {list}
        </ul>
      );
      list = [];
      listType = null;
    }
  };

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Blank line
    if (trimmed === "") {
      i++;
      continue;
    }

    // Headings: # through ######
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2].trim();
      elements.push(
        <Fragment key={`h-${i}`}>
          {level === 1 && <hr className="my-4 border-slate-300 dark:border-slate-600" />}
          <h4 key={`h-${i}`} className={`mt-4 mb-2 font-bold text-slate-900 dark:text-slate-100 ${["text-2xl", "text-xl", "text-lg", "text-base", "text-sm", "text-sm"][level - 1]}`}>
            {renderInline(content)}
          </h4>
        </Fragment>
      );
      i++;
      continue;
    }

    // Display math: $$...$$ or \[...\]
    const displayMath = trimmed.match(/^\$\$\s*([\s\S]*?)\$\s*$/) || trimmed.match(/^\\\[\s*([\s\S]*?)\\\]\s*$/);
    if (displayMath) {
      elements.push(<MathTex key={`dm-${i}`} tex={displayMath[1].trim()} display />);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      elements.push(<hr key={`hr-${i}`} className="my-4 border-slate-300 dark:border-slate-600" />);
      i++;
      continue;
    }

    // Bullet list
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (listType !== "bulleted") {
        flushList(`list-${i}`);
        listType = "bulleted";
      }
      const content = trimmed.slice(2);
      list.push(
        <li key={`li-${i}`} className="leading-relaxed text-slate-700 dark:text-slate-300">
          {renderInline(content)}
        </li>
      );
      i++;
      continue;
    }

    // Numbered list: 1. 2. 3. or 1) 2) 3)
    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    if (numberedMatch) {
      if (listType !== "numbered") {
        flushList(`list-${i}`);
        listType = "numbered";
      }
      const content = numberedMatch[2];
      list.push(
        <li key={`li-${i}`} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300" value={parseInt(numberedMatch[1], 10)}>
          {renderInline(content)}
        </li>
      );
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      let quoteContent = trimmed.slice(2);
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith("> ")) {
        quoteContent += "\n" + lines[j].trim().slice(2);
        j++;
      }
      elements.push(
        <blockquote key={`bq-${i}`} className="border-l-4 border-indigo-500 pl-4 my-2 italic text-slate-600 dark:text-slate-400">
          {renderInline(quoteContent)}
        </blockquote>
      );
      i = j;
      continue;
    }

    // Table
    if (trimmed.includes("|") && i + 1 < lines.length) {
      const nextTrimmed = lines[i + 1].trim();
      if (nextTrimmed.includes("|") && nextTrimmed.includes("-")) {
        const tableLines: string[] = [trimmed];
        let j = i + 1;
        while (j < lines.length && lines[j].trim().includes("|")) {
          tableLines.push(lines[j].trim());
          j++;
        }
        const rows = tableLines.map(row =>
          row.split("|").map(c => c.trim()).filter(c => c !== "")
        );
        if (rows.length > 1) {
          elements.push(
            <div key={`tbl-${i}`} className="my-3 overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300 dark:border-slate-600 text-sm">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    {rows[0].map((cell, ci) => (
                      <th key={ci} className="border border-slate-300 dark:border-slate-600 px-2 py-1 font-semibold">{renderInline(cell)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(1).map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? "bg-slate-50 dark:bg-slate-800" : ""}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="border border-slate-300 dark:border-slate-600 px-2 py-1">{renderInline(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        i = j;
        continue;
      }

    // Diagram placeholder
    if (/^\[(Draw|Diagram|Figure)/i.test(trimmed)) {
      elements.push(
        <div
          key={`diag-${i}`}
          className="my-2 flex min-h-[64px] items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-xs italic text-slate-500 dark:border-slate-600 dark:bg-slate-800"
        >
          {trimmed.replace(/^\[|\]$/g, "")}
        </div>
      );
      i++;
      continue;
    }

    // Regular paragraph
    const paragraphContent = trimmed;
    if (paragraphContent) {
      elements.push(
        <p key={`p-${i}`} className="my-2 leading-relaxed text-slate-700 dark:text-slate-300">
          {renderInline(paragraphContent)}
        </p>
      );
    }
    i++;
  }

  return <div className="prose dark:prose-invert max-w-none">{elements}</div>;
}
}