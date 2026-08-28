import { buildExportSections, type ExportMeta } from "@/services/export/templates";
import type { LessonPlan } from "@/types";
import { mdToHtml } from "@/services/export/markdown";

const PRINT_CSS = `
@page { size: A4; margin: 15mm 13mm 17mm 13mm; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 10.5pt; color: #1e293b; line-height: 1.45; }
.plan { page-break-after: always; }
.plan:last-child { page-break-after: auto; }
.lp-title { text-align: center; font-size: 17pt; font-weight: 700; color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 4pt; margin: 0 0 8pt; }
.lp-meta { margin: 0; }
.lp-meta p { margin: 0 0 3pt; font-size: 10pt; }
.section { margin: 0 0 11pt; }
.section-title { background: #f1f5f9; border: 1px solid #e2e8f0; font-size: 11pt; font-weight: 700; color: #334155; padding: 4pt 6pt; margin: 0 0 6pt; }
h2, .markdown h2 { font-size: 11pt; margin: 8pt 0 3pt; color: #1e293b; }
h3, .markdown h3 { font-size: 10.5pt; margin: 7pt 0 3pt; color: #1e293b; }
h4, h5, h6 { font-size: 10.5pt; margin: 6pt 0 2pt; color: #1e293b; }
p { margin: 0 0 5pt; }
ul, ol { margin: 0 0 5pt; padding-left: 18pt; }
li { margin-bottom: 1.5pt; }
hr { border: none; border-top: 1px solid #9ca3af; margin: 8pt 0; }
blockquote { margin: 3pt 0 5pt 8pt; padding-left: 8pt; border-left: 3px solid #9ca3af; color: #374151; }
table { width: 100%; border-collapse: collapse; margin: 5pt 0 8pt; }
th, td { border: 1px solid #6b7280; padding: 3pt 5pt; vertical-align: top; text-align: left; font-size: 9.5pt; }
th { background: #eef2ff; font-weight: 600; }
code { font-family: Consolas, 'Courier New', monospace; background: #f1f5f9; border-radius: 2px; padding: 0 2px; font-size: 0.95em; color: #1e293b; }
.mq { font-family: 'Cambria Math', Cambria, 'Times New Roman', serif; font-style: italic; white-space: nowrap; }
.mq .frac { display: inline-block; vertical-align: middle; text-align: center; margin: 0 2px; }
.mq .frac .num { display: block; border-bottom: 1px solid #111827; padding: 0 3px; line-height: 1.1; }
.mq .frac .den { display: block; padding: 0 3px; line-height: 1.1; }
.mq .sqrt .rad { border-top: 1px solid #111827; padding: 0 2px; }
`;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderLessonHtml(plan: LessonPlan, meta: ExportMeta): string {
  const { header, sections } = buildExportSections(plan, meta);

  const metaHtml = header.lines
    .map((l) => `<p>${escapeHtml(l)}</p>`)
    .join("");

  const sectionsHtml = sections
    .map(
      (s) =>
        `<div class="section"><div class="section-title">${escapeHtml(s.title)}</div><div class="markdown">${mdToHtml(s.lines.join("\n"))}</div></div>`
    )
    .join("");

  return `<section class="plan">
  <h1 class="lp-title">LESSON PLAN</h1>
  <div class="lp-meta">${metaHtml}</div>
  ${sectionsHtml}
</section>`;
}

function buildPrintDocument(html: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Lesson Plan - Print</title>
<style>${PRINT_CSS}</style>
</head>
<body>${html}</body>
</html>`;
}

function printHtml(html: string): void {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  if (!win) {
    iframe.remove();
    return;
  }
  const doc = win.document;
  doc.open();
  doc.write(buildPrintDocument(html));
  doc.close();
  win.focus();

  const cleanup = () => iframe.remove();
  setTimeout(() => {
    try {
      win.print();
    } catch {
      // Print dialog may be blocked; nothing more we can do offline.
    }
    setTimeout(cleanup, 1500);
  }, 300);
}

export async function exportLessonPlanPDF(
  plan: LessonPlan,
  meta: ExportMeta
): Promise<void> {
  printHtml(renderLessonHtml(plan, meta));
}

export async function exportLessonsBatchPDF(
  plans: LessonPlan[],
  meta: ExportMeta
): Promise<void> {
  if (!plans.length) return;
  printHtml(plans.map((plan) => renderLessonHtml(plan, meta)).join(""));
}