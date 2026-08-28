import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, GraduationCap, PartyPopper, Swords, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useLessonPlans,
  useProgression,
  useSubject
} from "@/db/hooks";
import { useAppStore } from "@/stores/app-store";
import {
  SEQUENCE_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
  TERM_NAMES
} from "@/types";
import type { ClassLevel, LessonStatus, Term } from "@/types";
import { cn } from "@/utils/cn";

const TERMS: Term[] = [1, 2, 3];

export function ProgressionPage() {
  const { subjectId, classLevel, setClassLevel } = useAppStore();
  const subject = useSubject(subjectId);
  const progression = useProgression(subjectId, classLevel);
  const plans = useLessonPlans(subjectId, classLevel);
  const navigate = useNavigate();

  const [termFilter, setTermFilter] = useState<Term | "all">("all");

  const statusByWeek = useMemo(() => {
    const map: Record<number, LessonStatus> = {};
    for (const p of plans ?? []) {
      map[p.weekNumber] = p.status;
    }
    return map;
  }, [plans]);

  const filtered = useMemo(() => {
    const rows = progression ?? [];
    if (termFilter === "all") return rows;
    return rows.filter((r) => r.term === termFilter);
  }, [progression, termFilter]);

  const firstUnplannedWeek = useMemo(() => {
    const rows = progression ?? [];
    return rows.find((r) => !r.isHoliday && !r.isEvaluation && !statusByWeek[r.weekNumber])?.weekNumber;
  }, [progression, statusByWeek]);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Progression Grid
          </h1>
          <p className="text-sm text-slate-500">
            {subject?.name} · 36-week progression · {classLevel}
          </p>
        </div>
        <Button
          onClick={() => {
            if (firstUnplannedWeek) {
              navigate(`/lesson-plan/${subjectId}/${classLevel}/${firstUnplannedWeek}`);
            }
          }}
          disabled={!firstUnplannedWeek}
        >
          <Zap className="h-4 w-4" /> Plan Next
          {firstUnplannedWeek ? ` (Week ${firstUnplannedWeek})` : ""}
        </Button>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {subject?.classLevels.map((cl: ClassLevel) => (
          <button
            key={cl}
            onClick={() => setClassLevel(cl)}
            className={cn(
              "min-h-[44px] shrink-0 rounded-full border px-4 py-2 text-sm font-medium",
              cl === classLevel
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            )}
          >
            {cl}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTermFilter("all")}
          className={cn(
            "min-h-[40px] rounded-lg px-4 text-sm font-medium",
            termFilter === "all" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          )}
        >
          All
        </button>
        {TERMS.map((t) => (
          <button
            key={t}
            onClick={() => setTermFilter(t)}
            className={cn(
              "min-h-[40px] rounded-lg px-4 text-sm font-medium",
              termFilter === t ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            )}
          >
            {TERM_NAMES[t]}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <div className="grid grid-cols-[48px_44px_1fr] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid-cols-[52px_48px_1fr_1fr_1fr_56px_72px] dark:bg-slate-800/50">
            <span>Week</span>
            <span>Seq</span>
            <span>Module</span>
            <span className="hidden sm:block">Chapter</span>
            <span className="hidden sm:block">Lesson</span>
            <span className="hidden sm:block">Dur</span>
            <span className="text-right">Status</span>
          </div>
          {filtered.map((entry) => {
            const isHoliday = entry.isHoliday;
            const isEval = entry.isEvaluation;
            const color = SEQUENCE_COLORS[entry.sequence - 1];
            const status = statusByWeek[entry.weekNumber];
            return (
              <button
                key={entry.id}
                onClick={() =>
                  navigate(`/lesson-plan/${subjectId}/${classLevel}/${entry.weekNumber}`)
                }
                className={cn(
                  "grid w-full grid-cols-[48px_44px_1fr_auto] items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-indigo-50/60 sm:grid-cols-[52px_48px_1fr_1fr_1fr_56px_72px] dark:hover:bg-slate-800/60",
                  isHoliday && "bg-slate-50 opacity-60 dark:bg-slate-900",
                  isEval && "bg-amber-50/60 dark:bg-amber-950/30"
                )}
              >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {entry.weekNumber}
                </span>
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md border text-xs font-bold",
                    color
                  )}
                >
                  {entry.sequence}
                </span>
                <span className="truncate text-sm text-slate-600 dark:text-slate-300">
                  {isHoliday ? (
                    <span className="italic text-slate-400">
                      <PartyPopper className="mr-1 inline h-3.5 w-3.5" />
                      {entry.lessonTitle}
                    </span>
                  ) : isEval ? (
                    <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300">
                      <Swords className="h-3.5 w-3.5" /> {entry.lessonTitle}
                    </span>
                  ) : (
                    <>
                      <span className="hidden sm:inline">{entry.moduleName}</span>
                      <span className="sm:hidden">{entry.chapter || entry.lessonTitle}</span>
                    </>
                  )}
                </span>
                <span className="hidden sm:block truncate text-sm text-slate-500 dark:text-slate-400">
                  {entry.chapter}
                </span>
                <span className="hidden sm:block truncate text-sm text-slate-500 dark:text-slate-400">
                  {entry.lessonTitle}
                </span>
                <span className="hidden sm:block text-center text-sm text-slate-500 dark:text-slate-400">
                  {entry.duration > 0 ? `${entry.duration}` : "—"}
                </span>
                <span className="flex justify-end">
                  {status ? (
                    <Badge className={STATUS_COLORS[status]}>
                      {STATUS_LABELS[status]}
                    </Badge>
                  ) : (
                    <Badge variant="outline">—</Badge>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {!progression && (
        <div className="flex h-40 items-center justify-center text-slate-400">
          <GraduationCap className="mr-2 h-5 w-5" /> Loading progression…
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <PartyPopper className="h-3.5 w-3.5" /> Holiday week
        </span>
        <span className="flex items-center gap-1">
          <Swords className="h-3.5 w-3.5" /> Evaluation week
        </span>
        <span className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" /> Click a row to plan that week
        </span>
      </div>
    </div>
  );
}
