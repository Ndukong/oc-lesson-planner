import { describe, expect, it } from "vitest";
import { mdToHtml, parseMarkdown } from "@/services/export/markdown";

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

describe("parseMarkdown — headings", () => {
  it("parses headings with a space after the hashes", () => {
    const blocks = parseMarkdown("# Title\n## Section\n### Sub");
    expect(blocks.map((b) => b.type)).toEqual(["heading", "heading", "heading"]);
    expect(blocks[0]).toMatchObject({ level: 1 });
    expect(blocks[1]).toMatchObject({ level: 2 });
    expect(blocks[2]).toMatchObject({ level: 3 });
  });

  it("parses headings without a space after the hashes", () => {
    const blocks = parseMarkdown("##Lesson Notes\nSome text.");
    expect(blocks[0]).toMatchObject({ type: "heading", level: 2 });
    if (blocks[0].type === "heading") {
      expect(blocks[0].children[0]).toEqual({ type: "text", text: "Lesson Notes" });
    }
  });
});

describe("parseMarkdown — inline formatting", () => {
  it("detects bold", () => {
    const blocks = parseMarkdown("**Force** is a push or pull.");
    expect(blocks[0].type).toBe("paragraph");
    if (blocks[0].type === "paragraph") {
      expect(blocks[0].children.some((n) => n.type === "bold")).toBe(true);
    }
  });

  it("detects italic", () => {
    const blocks = parseMarkdown("_Warm-up:_ ask learners.");
    expect(blocks[0].type).toBe("paragraph");
    if (blocks[0].type === "paragraph") {
      expect(blocks[0].children.some((n) => n.type === "italic")).toBe(true);
    }
  });

  it("leaves escaped characters as literals", () => {
    const html = mdToHtml("Use \\# for numbers and 3 \\* 4 = 12.");
    expect(html).toContain("# for numbers");
    expect(html).toContain("3 * 4");
  });
});

describe("parseMarkdown — lists", () => {
  it("groups bullet lines into a bulleted list", () => {
    const blocks = parseMarkdown("- torch\n- ruler\n- string");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ type: "bulletedList" });
    if (blocks[0].type === "bulletedList") {
      expect(blocks[0].items).toHaveLength(3);
    }
  });

  it("groups numbered lines into a numbered list and strips the literal prefix", () => {
    const blocks = parseMarkdown("1. Define force\n2. State the law");
    expect(blocks[0]).toMatchObject({ type: "numberedList" });
    if (blocks[0].type === "numberedList") {
      expect(blocks[0].items).toHaveLength(2);
      const first = blocks[0].items[0].blocks[0];
      if (first.type === "paragraph") {
        expect(first.children[0]).toEqual({ type: "text", text: "Define force" });
      }
    }
  });
});

describe("parseMarkdown — tables", () => {
  it("parses a markdown table with header and data rows", () => {
    const md = [
      "| Source Type | Emits Light? | Example |",
      "|-------------|--------------|---------|",
      "| Luminous    | Yes          | Sun     |",
      "| Non-luminous| No           | Candle  |"
    ].join("\n");
    const blocks = parseMarkdown(md);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ type: "table" });
    if (blocks[0].type === "table") {
      expect(blocks[0].rows).toHaveLength(3);
    }
  });
});

describe("parseMarkdown — math", () => {
  it("converts $...$ math into a math node", () => {
    const blocks = parseMarkdown("Acceleration is $a = \\frac{v - u}{t}$.");
    expect(blocks[0].type).toBe("paragraph");
    if (blocks[0].type === "paragraph") {
      expect(blocks[0].children.some((n) => n.type === "math")).toBe(true);
    }
  });

  it("converts bare LaTeX fractions without $ delimiters", () => {
    const blocks = parseMarkdown("F = \\frac{GMm}{d^{2}}");
    expect(blocks[0].type).toBe("paragraph");
    if (blocks[0].type === "paragraph") {
      expect(blocks[0].children.some((n) => n.type === "math")).toBe(true);
    }
  });

  it("converts bare superscripts attached to a base", () => {
    const blocks = parseMarkdown("Energy E = mc^{2} and v^{2}.");
    if (blocks[0].type === "paragraph") {
      expect(blocks[0].children.some((n) => n.type === "math")).toBe(true);
    }
  });
});

describe("mdToHtml — export fidelity", () => {
  const SAMPLE = [
    "## 1. What is Light?",
    "Light is a form of energy.",
    "",
    "- **Angle of Incidence (i)**: angle between ray and normal",
    "- **Angle of Reflection (r)**: equal to i",
    "",
    "### Law of Reflection",
    "1. State the law",
    "2. Draw the diagram",
    "",
    "| Quantity | Symbol |",
    "| --- | --- |",
    "| Force | $F = ma$ |"
  ].join("\n");

  it("renders real headings, bold, lists and tables", () => {
    const html = mdToHtml(SAMPLE);
    expect(html).toContain("<h2>1. What is Light?</h2>");
    expect(html).toContain("<strong>Angle of Incidence (i)</strong>");
    expect(html).toContain("<li>");
    expect(html).toContain("<ol>");
    expect(html).toContain("<table>");
  });

  it("leaves no markdown artifacts in the rendered output", () => {
    const plain = stripTags(mdToHtml(SAMPLE));
    expect(plain).not.toContain("##");
    expect(plain).not.toContain("**");
    expect(plain).not.toContain("| ---");
    expect(plain).not.toContain("\\frac");
  });

  it("renders math as styled equation spans", () => {
    const html = mdToHtml("Energy $E = mc^{2}$ and $\\sqrt{2gh}$.");
    expect(html).toContain('class="mq"');
    expect(html).toContain("<sup>2</sup>");
  });

  it("escapes HTML-sensitive characters in content", () => {
    const html = mdToHtml("Compare a < b and mark & roll.");
    expect(html).toContain("&lt; b");
    expect(html).toContain("&amp; roll");
  });
});