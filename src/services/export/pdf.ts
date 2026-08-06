import { jsPDF } from "jspdf";
import { buildExportSections, type ExportMeta } from "@/services/export/templates";
import type { LessonPlan } from "@/types";

function wrapText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = text.split("\n");
  let yy = y;
  for (const line of lines) {
    const words = line.split(" ");
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (doc.getTextWidth(test) > maxWidth && current) {
        doc.text(current, x, yy);
        yy += lineHeight;
        current = word;
      } else {
        current = test;
      }
    }
    if (current) {
      doc.text(current, x, yy);
      yy += lineHeight;
    }
  }
  return yy;
}

export function renderLessonPages(
  doc: jsPDF,
  plan: LessonPlan,
  meta: ExportMeta,
  startPage = true
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 14;

  const { header, sections } = buildExportSections(plan, meta);

  const checkPage = (y: number, needed: number): number => {
    if (y + needed > pageHeight - 50) {
      doc.addPage();
      return 50;
    }
    return y;
  };

  if (startPage && doc.getNumberOfPages() > 1) {
    doc.addPage();
  }

  let y = 55;
  doc.setFillColor(79, 70, 229);
  doc.rect(margin, y - 14, maxWidth, 26, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`LESSON PLAN — ${meta.academicYear}`, margin + 6, y + 2);
  y += 30;

  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  for (const line of header.lines.slice(1)) {
    y = checkPage(y, lineHeight);
    doc.text(line, margin, y);
    y += lineHeight;
  }
  y += 10;

  for (const section of sections) {
    const estHeight = section.lines.length * lineHeight + 40;
    y = checkPage(y, estHeight);

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y - 12, maxWidth, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(section.title, margin + 4, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    for (const line of section.lines) {
      y = checkPage(y, lineHeight);
      y = wrapText(doc, line || " ", margin, y, maxWidth, lineHeight);
    }
    y += 12;
  }
}

export async function exportLessonPlanPDF(
  plan: LessonPlan,
  meta: ExportMeta
): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  renderLessonPages(doc, plan, meta, false);
  doc.save(`${plan.classLevel}-week${plan.weekNumber}-lesson-plan.pdf`);
}

export async function exportLessonsBatchPDF(
  plans: LessonPlan[],
  meta: ExportMeta
): Promise<void> {
  if (!plans.length) return;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  plans.forEach((plan, i) => {
    renderLessonPages(doc, plan, meta, i > 0);
  });
  const level = plans[0].classLevel;
  doc.save(`${level}-lesson-plans-${plans[0].term}.pdf`);
}
