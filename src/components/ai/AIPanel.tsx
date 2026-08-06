import { useState } from "react";
import toast from "react-hot-toast";
import { Check, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { generateLessonContent } from "@/services/ai";
import type { GenerationContext } from "@/services/ai/prompts";
import type { AISettings, LessonField } from "@/types";
import { FIELD_LABELS } from "@/types";
import { MarkdownPreview } from "@/components/lesson-plan/MarkdownPreview";

const ALL_FIELDS: LessonField[] = [
  "previousKnowledge",
  "objectives",
  "introduction",
  "activities",
  "materials",
  "lessonNotes",
  "conclusion",
  "homework",
  "evaluationCriteria",
  "differentiation"
];

function PreviewBlock({ label, content }: { label: string; content: unknown }) {
  const text = Array.isArray(content)
    ? content
        .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
        .join("\n")
    : String(content ?? "");
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
        {label}
      </p>
      <MarkdownPreview text={text} />
    </div>
  );
}

export function AIPanel({
  open,
  onClose,
  settings,
  context,
  onAccept
}: {
  open: boolean;
  onClose: () => void;
  settings: AISettings | undefined;
  context: GenerationContext;
  onAccept: (result: Record<string, unknown>) => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!settings) {
      setError("No AI settings found. Configure an API key in Settings first.");
      return;
    }
    setGenerating(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateLessonContent(settings, context, ALL_FIELDS);
      setResult(res);
      toast.success("Content generated — review and accept");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const accept = () => {
    if (!result) return;
    onAccept(result);
    toast.success("Content added to lesson plan");
    onClose();
    setResult(null);
  };

  return (
    <Dialog open={open} onClose={onClose} title="AI Lesson Assistant">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Generate the full lesson plan from the syllabus context for{" "}
          <strong>{context.topic}</strong> ({context.classLevel}).
        </p>

        {!result && (
          <Button onClick={generate} disabled={generating} className="w-full">
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {generating ? "Generating full lesson..." : "Generate Full Lesson"}
          </Button>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {result && (
          <>
            <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              {ALL_FIELDS.filter((f) => result[f] !== undefined && result[f] !== "").map((f) => (
                <PreviewBlock
                  key={f}
                  label={FIELD_LABELS[f]}
                  content={result[f]}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={generate} disabled={generating}>
                <Sparkles className="h-4 w-4" /> Regenerate
              </Button>
              <Button onClick={accept} className="flex-1">
                <Check className="h-4 w-4" /> Accept All
              </Button>
            </div>
          </>
        )}

        {!settings && (
          <Badge variant="warning">
            AI is not configured — set an API key in Settings.
          </Badge>
        )}
      </div>
    </Dialog>
  );
}
