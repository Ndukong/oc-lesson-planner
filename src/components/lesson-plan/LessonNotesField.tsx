import { useRef, useState } from "react";
import { Bold, Eye, Heading2, List, Pencil, SquareDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { MarkdownPreview } from "@/components/lesson-plan/MarkdownPreview";

export function LessonNotesField({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [preview, setPreview] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const insert = (before: string, after = "") => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || "text";
    const next =
      value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    });
  };

  const tools = [
    { label: "Heading", icon: Heading2, fn: () => insert("## ") },
    { label: "Bold", icon: Bold, fn: () => insert("**", "**") },
    { label: "Bullet list", icon: List, fn: () => insert("- ") },
    {
      label: "Diagram placeholder",
      icon: SquareDashed,
      fn: () => insert("[Draw a labelled diagram here]")
    }
  ];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {tools.map(({ label, icon: Icon, fn }) => (
          <button
            key={label}
            type="button"
            onClick={fn}
            title={label}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <div className="flex-1" />
        <Button
          type="button"
          variant={preview ? "secondary" : "outline"}
          size="sm"
          onClick={() => setPreview((p) => !p)}
        >
          {preview ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {preview ? "Edit" : "Preview"}
        </Button>
      </div>
      {preview ? (
        <div className="min-h-[160px] rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <MarkdownPreview text={value} />
        </div>
      ) : (
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write the notes learners will copy into their exercise books. Use ## for headings, ** for bold, - for bullets, and [Draw ...] for diagram instructions."
          className="min-h-[200px] leading-relaxed"
        />
      )}
    </div>
  );
}
