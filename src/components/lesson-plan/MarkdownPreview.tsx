import { type ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*)/g;
  const chunks = text.split(regex);
  chunks.forEach((chunk, i) => {
    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      parts.push(
        <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">
          {chunk.slice(2, -2)}
        </strong>
      );
    } else {
      parts.push(<span key={i}>{chunk}</span>);
    }
  });
  return parts;
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
          {trimmed.slice(3)}
        </h4>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      list.push(
        <li key={i} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {renderInline(trimmed.slice(2))}
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
    } else if (/^\d+\.\s/.test(trimmed)) {
      flushList(`n-${i}`);
      elements.push(
        <p key={i} className="my-0.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {renderInline(trimmed)}
        </p>
      );
    } else {
      flushList(`p-${i}`);
      elements.push(
        <p key={i} className="my-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {renderInline(trimmed)}
        </p>
      );
    }
  });
  flushList("final");

  return <div>{elements}</div>;
}
