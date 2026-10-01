import { type ReactNode, Fragment } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { parseMarkdown, type BlockNode, type InlineNode } from "../../services/export/markdown";

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

function renderInline(nodes: InlineNode[], keyBase = 0): ReactNode[] {
  const out: ReactNode[] = [];
  let k = 0;
  for (const node of nodes) {
    const nextKeyBase = keyBase * 1000 + k;
    switch (node.type) {
      case "text":
        out.push(<span key={`${keyBase}-${k++}`}>{node.text}</span>);
        break;
      case "code":
        out.push(
          <code
            key={`${keyBase}-${k++}`}
            className="rounded bg-slate-100 px-1 text-[0.9em] text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-mono"
          >
            {node.text}
          </code>
        );
        break;
      case "bold":
        out.push(
          <strong key={`${keyBase}-${k++}`} className="font-semibold text-slate-900 dark:text-slate-100">
            {renderInline(node.children, nextKeyBase)}
          </strong>
        );
        break;
      case "italic":
        out.push(
          <em key={`${keyBase}-${k++}`} className="italic text-slate-900 dark:text-slate-100">
            {renderInline(node.children, nextKeyBase)}
          </em>
        );
        break;
      case "math":
        out.push(<MathTex key={`${keyBase}-${k++}`} tex={node.tex} display={false} />);
        break;
    }
  }
  return out;
}

function renderBlock(block: BlockNode, index: number): ReactNode {
  switch (block.type) {
    case "heading": {
      const level = Math.min(6, Math.max(1, block.level));
      const sizeClasses = ["text-2xl", "text-xl", "text-lg", "text-base", "text-sm", "text-sm"];
      return (
        <Fragment key={`h-${index}`}>
          {level === 1 && <hr className="my-4 border-slate-300 dark:border-slate-600" />}
          <h4 className={`mt-4 mb-2 font-bold text-slate-900 dark:text-slate-100 ${sizeClasses[level - 1]}`}>
            {renderInline(block.children)}
          </h4>
        </Fragment>
      );
    }
    case "paragraph":
      return (
        <p key={`p-${index}`} className="my-2 leading-relaxed text-slate-700 dark:text-slate-300">
          {renderInline(block.children)}
        </p>
      );
    case "bulletedList":
      return (
        <ul key={`ul-${index}`} className="my-1 space-y-0.5 pl-5 list-disc">
          {block.items.map((item, i) => (
            <li key={`li-${index}-${i}`} className="leading-relaxed text-slate-700 dark:text-slate-300">
              {item.blocks.map((blk, j) => renderBlock(blk, index * 1000 + i * 100 + j))}
            </li>
          ))}
        </ul>
      );
    case "numberedList":
      return (
        <ol key={`ol-${index}`} className="my-1 space-y-0.5 pl-5 list-decimal">
          {block.items.map((item, i) => (
            <li key={`li-${index}-${i}`} className="leading-relaxed text-slate-700 dark:text-slate-300">
              {item.blocks.map((blk, j) => renderBlock(blk, index * 1000 + i * 100 + j))}
            </li>
          ))}
        </ol>
      );
    case "mathblock":
      return <MathTex key={`dm-${index}`} tex={block.tex} display />;
    case "hr":
      return <hr key={`hr-${index}`} className="my-4 border-slate-300 dark:border-slate-600" />;
    case "quote":
      return (
        <blockquote key={`bq-${index}`} className="border-l-4 border-indigo-500 pl-4 my-2 italic text-slate-600 dark:text-slate-400">
          {block.children.map((child, i) => renderBlock(child, index * 1000 + i))}
        </blockquote>
      );
    case "table":
      return (
        <div key={`tbl-${index}`} className="my-3 overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 dark:border-slate-600 text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                {block.rows[0].map((cell, ci) => (
                  <th key={ci} className="border border-slate-300 dark:border-slate-600 px-2 py-1 font-semibold">
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.slice(1).map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-slate-50 dark:bg-slate-800" : ""}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-slate-300 dark:border-slate-600 px-2 py-1">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function MarkdownPreview({ text }: { text: string }) {
  if (!text.trim()) {
    return <p className="text-sm italic text-slate-400">No content yet.</p>;
  }

  const blocks = parseMarkdown(text);
  return (
    <div className="prose dark:prose-invert max-w-none">
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}