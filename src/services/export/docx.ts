import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun
} from "docx";
import { buildExportSections, type ExportMeta } from "@/services/export/templates";
import type { LessonPlan } from "@/types";
import { downloadBlob } from "@/utils/format";

export async function exportLessonPlanDocx(
  plan: LessonPlan,
  meta: ExportMeta
): Promise<void> {
  const { header, sections } = buildExportSections(plan, meta);
  const children: Paragraph[] = [];

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
        children: [new TextRun({ text: section.title, bold: true }) ]
      })
    );
    for (const line of section.lines) {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: line, size: 22 })]
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${plan.classLevel}-week${plan.weekNumber}-lesson-plan.docx`);
}
