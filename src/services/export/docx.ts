import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TextRun
} from "docx";
import { buildExportSections, type ExportMeta } from "@/services/export/templates";
import type { LessonPlan } from "@/types";
import { mdToDocxElements } from "@/services/export/markdown";
import { downloadBlob } from "@/utils/format";

const NUMBERING = [
  {
    reference: "lp-bullet",
    levels: [
      { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT },
      { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT },
      { level: 2, format: LevelFormat.BULLET, text: "▪", alignment: AlignmentType.LEFT },
      { level: 3, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT }
    ]
  },
  {
    reference: "lp-number",
    levels: [
      { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, start: 1 },
      { level: 1, format: LevelFormat.LOWER_LETTER, text: "%2)", alignment: AlignmentType.LEFT, start: 1 },
      { level: 2, format: LevelFormat.DECIMAL, text: "%3.", alignment: AlignmentType.LEFT, start: 1 },
      { level: 3, format: LevelFormat.LOWER_LETTER, text: "%4)", alignment: AlignmentType.LEFT, start: 1 }
    ]
  }
] as const;

const PAGE_MARGIN = { top: 720, bottom: 720, left: 720, right: 720 };

function pageFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Lesson Planner  •  Page ", size: 16, color: "6B7280" }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "6B7280" })
        ]
      })
    ]
  });
}

function buildPlanChildren(plan: LessonPlan, meta: ExportMeta): (Paragraph | Table)[] {
  const { header, sections } = buildExportSections(plan, meta);
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "4F46E5" }
      },
      children: [
        new TextRun({
          text: "LESSON PLAN",
          bold: true,
          size: 28,
          color: "4F46E5"
        })
      ]
    })
  );

  for (const line of header.lines) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: line, size: 22 })]
      })
    );
  }

  children.push(new Paragraph({ spacing: { after: 120 } }));

  for (const section of sections) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: section.title, bold: true })]
      })
    );
    children.push(...mdToDocxElements(section.lines.join("\n")));
  }

  return children;
}

export async function exportLessonPlanDocx(
  plan: LessonPlan,
  meta: ExportMeta
): Promise<void> {
  const doc = new Document({
    numbering: { config: NUMBERING },
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 }
        }
      }
    },
    sections: [
      {
        properties: { page: { margin: PAGE_MARGIN } },
        footers: { default: pageFooter() },
        children: buildPlanChildren(plan, meta)
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${plan.classLevel}-week${plan.weekNumber}-lesson-plan.docx`);
}

/**
 * Batch export: ONE Word document with a section per lesson plan (each starts
 * on its own page, page numbers run continuously).
 */
export async function exportLessonPlansBatchDocx(
  plans: LessonPlan[],
  meta: ExportMeta
): Promise<void> {
  if (!plans.length) return;
  const doc = new Document({
    creator: "Lesson Planner",
    title: `${plans[0].classLevel} lesson plans - Term ${plans[0].term}`,
    numbering: { config: NUMBERING },
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 }
        }
      }
    },
    sections: plans.map((plan) => ({
      properties: { page: { margin: PAGE_MARGIN } },
      footers: { default: pageFooter() },
      children: buildPlanChildren(plan, meta)
    }))
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(
    blob,
    `${plans[0].classLevel}-lesson-plans-term${plans[0].term}.docx`
  );
}