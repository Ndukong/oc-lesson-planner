import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SEQUENCE_BARS, STATUS_LABELS } from "@/types";
import type { LessonStatus } from "@/types";
import {
  useLessonPlans,
  useProgression,
  useSubject
} from "@/db/hooks";
import { useAppStore } from "@/stores/app-store";
import { useCurrentWeek } from "@/hooks/useCurrentWeek";
import { downloadText } from "@/utils/format";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";

const HEAT_COLORS: Record<LessonStatus, string> = {
  planned: "bg-slate-300 dark:bg-slate-600",
  "in-progress": "bg-amber-400",
  completed: "bg-green-500",
  skipped: "bg-red-400",
  partial: "bg-orange-400"
};

export function ProgressPage() {
  const { subjectId, classLevel, setClassLevel } = useAppStore();
  const subject = useSubject(subjectId);
  const progression = useProgression(subjectId, classLevel);
  const plans = useLessonPlans(subjectId, classLevel);
  const { week } = useCurrentWeek();
  const navigate = useNavigate();

  const statusByWeek = useMemo(() => {
    const map: Record<number, LessonStatus> = {};
    for (const p of plans ?? []) map[p.weekNumber] = p.status;
    return map;
  }, [plans]);

  const teachingWeeks = useMemo(
    () => (progression ?? []).filter((e) => !e.isHoliday),
    [progression]
  );

  const completed = teachingWeeks.filter(
    (e) => statusByWeek[e.weekNumber] === "completed"
  ).length;
  const total = teachingWeeks.length;

  const sequenceStats = useMemo(() => {
    return [1, 2, 3, 4, 5, 6].map((seq) => {
      const weeks = teachingWeeks.filter((e) => e.sequence === seq);
      const done = weeks.filter(
        (e) => statusByWeek[e.weekNumber] === "completed"
      ).length;
      return { seq, total: weeks.length, done };
    });
  }, [teachingWeeks, statusByWeek]);

  const behindWeeks = useMemo(() => {
    const planned = new Set((plans ?? []).map((p) => p.weekNumber));
    return Math.max(0, week - Math.max(...planned, 0));
  }, [plans, week]);

  const exportReport = () => {
    const lines = [
      `Progress Report — ${subject?.name} ${classLevel}`,
      `Generated: ${new Date().toLocaleString()}`,
      "",
      `Completed: ${completed}/${total} (${total ? Math.round((completed / total) * 100) : 0}%)`,
      "",
      "Sequence breakdown:"
    ];
    for (const s of sequenceStats) {
      lines.push(`  Sequence ${s.seq}: ${s.done}/${s.total} lessons completed`);
    }
    lines.push("", "Week-by-week:");
    for (const e of progression ?? []) {
      const st = e.isHoliday ? "holiday" : statusByWeek[e.weekNumber] ?? "unplanned";
      lines.push(`  Week ${e.weekNumber}: ${e.lessonTitle} — ${st}`);
    }
    downloadText(lines.join("\n"), `${subject?.name}-${classLevel}-progress.txt`, "text/plain");
    toast.success("Report downloaded");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Progress Tracker
          </h1>
          <p className="text-sm text-slate-500">{subject?.name} · {classLevel}</p>
        </div>
        <Button variant="outline" onClick={exportReport}>
          <FileDown className="h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {subject?.classLevels.map((cl) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">
              {completed} of {total} lessons completed
            </span>
            <span className="font-bold text-indigo-600">
              {total ? Math.round((completed / total) * 100) : 0}%
            </span>
          </div>
          <Progress value={total ? (completed / total) * 100 : 0} />
          {behindWeeks > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                You're {behindWeeks} week{behindWeeks > 1 ? "s" : ""} behind in{" "}
                {classLevel}.
                <button
                  onClick={() => navigate("/progression")}
                  className="ml-1 font-medium underline"
                >
                  Catch up
                </button>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sequence Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sequenceStats.map((s) => (
            <div
              key={s.seq}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Sequence {s.seq}
                </span>
                <span className="text-xs text-slate-500">
                  {s.done}/{s.total}
                </span>
              </div>
              <Progress
                value={s.total ? (s.done / s.total) * 100 : 0}
                className={SEQUENCE_BARS[s.seq - 1]}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calendar Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-9 gap-1.5 sm:grid-cols-12">
            {Array.from({ length: 36 }, (_, i) => i + 1).map((w) => {
              const isHoliday = (progression ?? []).find(
                (e) => e.weekNumber === w
              )?.isHoliday;
              const isEval = (progression ?? []).find(
                (e) => e.weekNumber === w
              )?.isEvaluation;
              const st = statusByWeek[w];
              return (
                <button
                  key={w}
                  title={`Week ${w}${st ? ` — ${STATUS_LABELS[st]}` : ""}${isHoliday ? " (holiday)" : ""}`}
                  onClick={() =>
                    !isHoliday &&
                    navigate(`/lesson-plan/${subjectId}/${classLevel}/${w}`)
                  }
                  className={cn(
                    "flex h-9 items-center justify-center rounded-md border border-slate-200 text-[10px] font-semibold dark:border-slate-700",
                    isHoliday
                      ? "border-dashed bg-slate-50 text-slate-300 dark:bg-slate-900"
                      : st
                        ? HEAT_COLORS[st]
                        : isEval
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                  )}
                >
                  {w}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {(Object.keys(HEAT_COLORS) as LessonStatus[]).map((st) => (
              <span key={st} className="flex items-center gap-1">
                <span className={cn("h-3 w-3 rounded", HEAT_COLORS[st])} />
                {STATUS_LABELS[st]}
              </span>
            ))}
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded border border-dashed bg-slate-50 dark:bg-slate-900" />
              Holiday
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
