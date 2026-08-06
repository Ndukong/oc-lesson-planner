import { CheckCircle2, Circle, MinusCircle, PauseCircle, PlayCircle } from "lucide-react";
import { STATUS_LABELS } from "@/types";
import type { LessonStatus } from "@/types";
import { cn } from "@/utils/cn";

const OPTIONS: { value: LessonStatus; icon: typeof Circle; active: string }[] = [
  { value: "planned", icon: Circle, active: "border-slate-400 text-slate-600 bg-slate-100" },
  { value: "in-progress", icon: PlayCircle, active: "border-amber-400 text-amber-700 bg-amber-50" },
  { value: "completed", icon: CheckCircle2, active: "border-green-500 text-green-700 bg-green-50" },
  { value: "partial", icon: PauseCircle, active: "border-orange-400 text-orange-700 bg-orange-50" },
  { value: "skipped", icon: MinusCircle, active: "border-red-400 text-red-600 bg-red-50" }
];

export function StatusSelector({
  value,
  onChange
}: {
  value: LessonStatus;
  onChange: (s: LessonStatus) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map(({ value: v, icon: Icon, active }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
            value === v
              ? active
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
          )}
        >
          <Icon className="h-4 w-4" />
          {STATUS_LABELS[v]}
        </button>
      ))}
    </div>
  );
}
