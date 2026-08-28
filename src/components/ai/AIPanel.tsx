import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Check, Loader2, Sparkles, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { generateLessonContent } from "@/services/ai";
import type { GenerationContext } from "@/services/ai/prompts";
import { ALL_LESSON_FIELDS, LESSON_FIELD_GROUPS } from "@/services/ai/prompts";
import { isAbortError } from "@/services/ai/retry";
import type { AISettings, LessonField } from "@/types";
import { FIELD_LABELS } from "@/types";
import { MarkdownPreview } from "@/components/lesson-plan/MarkdownPreview";

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

const STEP_LABELS = ["lesson structure", "lesson notes"];

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
  const [stepLabel, setStepLabel] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Closing the panel cancels any in-flight generation.
  useEffect(() => {
    if (!open) controllerRef.current?.abort();
  }, [open]);

  const runFields = async (
    fields: LessonField[],
    stepIndex: number
  ): Promise<boolean> => {
    if (!settings) return false;
    const controller = new AbortController();
    controllerRef.current = controller;
    setStepLabel(`Step ${stepIndex + 1} of ${LESSON_FIELD_GROUPS.length} — ${STEP_LABELS[stepIndex] ?? "content"}…`);
    setGenerating(true);
    try {
      const res = await generateLessonContent(
        settings,
        context,
        fields,
        controller.signal
      );
      setResult((prev) => ({ ...(prev ?? {}), ...res }));
      setError(null);
      return true;
    } catch (err) {
      if (!isAbortError(err)) {
        const msg = err instanceof Error ? err.message : "Generation failed.";
        setError(msg);
        toast.error(msg);
      }
      return false;
    } finally {
      setGenerating(false);
      setStepLabel(null);
      controllerRef.current = null;
    }
  };

  const runGroups = async (groups: LessonField[][]) => {
    let succeeded = 0;
    for (let gi = 0; gi < groups.length; gi++) {
      const fields = groups[gi];
      if (fields.length === 0) {
        succeeded++;
        continue;
      }
      const ok = await runFields(fields, gi);
      if (!ok) break;
      succeeded++;
    }
    if (succeeded === groups.length) {
      toast.success("Content generated — review and accept");
    } else if (succeeded > 0) {
      toast.success("Partially generated — retry the missing parts");
    }
  };

  const generateFull = async () => {
    if (!settings) {
      setError("No AI settings found. Configure an API key in Settings first.");
      return;
    }
    setError(null);
    setResult(null);
    await runGroups(LESSON_FIELD_GROUPS);
  };

  const retryMissing = async () => {
    if (!settings) return;
    const missing = new Set(
      ALL_LESSON_FIELDS.filter((f) => result?.[f] === undefined)
    );
    const groups = LESSON_FIELD_GROUPS.map((group) =>
      group.filter((f) => missing.has(f))
    );
    setError(null);
    await runGroups(groups);
  };

  const cancel = () => controllerRef.current?.abort();

  const accept = () => {
    if (!result) return;
    onAccept(result);
    toast.success("Content added to lesson plan");
    onClose();
    setResult(null);
  };

  const missingCount = result
    ? ALL_LESSON_FIELDS.filter((f) => result[f] === undefined).length
    : 0;

  return (
    <Dialog open={open} onClose={onClose} title="AI Lesson Assistant">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Generate the full lesson plan from the syllabus context for{" "}
          <strong>{context.topic}</strong> ({context.classLevel}).
        </p>

        {!result && (
          <div className="flex gap-2">
            <Button onClick={generateFull} disabled={generating} className="flex-1">
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {generating ? "Generating…" : "Generate Full Lesson"}
            </Button>
            {generating && (
              <Button variant="outline" onClick={cancel}>
                <X className="h-4 w-4" /> Cancel
              </Button>
            )}
          </div>
        )}

        {generating && stepLabel && (
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {stepLabel}
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {result && (
          <>
            <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              {ALL_LESSON_FIELDS.filter((f) => result[f] !== undefined && result[f] !== "").map((f) => (
                <PreviewBlock
                  key={f}
                  label={FIELD_LABELS[f]}
                  content={result[f]}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {!generating && missingCount > 0 && (
                <Button variant="outline" className="flex-1" onClick={retryMissing}>
                  <Sparkles className="h-4 w-4" /> Retry missing ({missingCount})
                </Button>
              )}
              {!generating && (
                <Button variant="outline" className="flex-1" onClick={generateFull}>
                  <Sparkles className="h-4 w-4" /> Regenerate
                </Button>
              )}
              {!generating && (
                <Button onClick={accept} className="flex-1">
                  <Check className="h-4 w-4" /> Accept All
                </Button>
              )}
              {generating && (
                <Button variant="outline" onClick={cancel}>
                  <X className="h-4 w-4" /> Cancel
                </Button>
              )}
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