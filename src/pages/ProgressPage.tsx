import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SEQUENCE_BARS, STATUS_LABELS, TERM_NAMES } from "@/types";
import type { LessonStatus, Term } from "@/types";
import { useLessonPlans, useProgression, useSubject } from "@/db/hooks";
import { useAppStore } from "@/stores/app-store";
import { downloadText } from "@/utils/format";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";

const HEAT_COLORS: Record<LessonStatus, string> = {
  planned: "bg-slate-300 dark:bg-slate-600",
  "in-progress": "bg-amber-400",
  completed: "bg-green-500",
  skipped: "bg-red-400",
  partial: "bg-orange-400",
};

export function ProgressPage() {
  const { subjectId, classLevel, setClassLevel } = useAppStore();
  const subject = useSubject(subjectId);
  const progression = useProgression(subjectId, classLevel);
  const plans = useLessonPlans(subjectId, classLevel);
  const navigate = useNavigate();

  const statusByLesson = useMemo(() => {
    const map: Record<number, LessonStatus> = {};
    for (const p of plans ?? []) map[(p as unknown as { lessonNumber: number }).lessonNumber ?? p.weekNumber] = p.status;
    return map;
  }, [plans]);

  const teaching = progression ?? [];
  const completed = teaching.filter((e) => statusByLesson[e.lessonNumber] === "completed").length;
  const total = teaching.length;

  const termStats = useMemo(() => {
    return ([1, 2, 3] as Term[]).map((term) => {
      const lessons = teaching.filter((e) => e.term === term);
      const done = lessons.filter((e) => statusByLesson[e.lessonNumber] === "completed").length;
      return { term, total: lessons.length, done };
    }).filter((s) => s.total > 0);
  }, [teaching, statusByLesson]);

  const exportReport = () => {
    const lines = [`Progress Report — ${subject?.name} ${classLevel}`, `Generated: ${new Date().toLocaleString()}`, "", `Completed: ${completed}/${total} (${total ? Math.round((completed / total) * 100) : 0}%)`, ""];
    for (const s of termStats) lines.push(`  ${TERM_NAMES[s.term]}: ${s.done}/${s.total} completed`);
    lines.push("", "Lesson-by-lesson:");
    for (const e of progression ?? []) {
      const st = statusByLesson[e.lessonNumber] ?? "unplanned";
      lines.push(`  L${e.lessonNumber} [${TERM_NAMES[e.term]}] ${e.lessonTitle} — ${st}`);
    }
    downloadText(lines.join("\n"), `${subject?.name}-${classLevel}-progress.txt`, "text/plain");
    toast.success("Report downloaded");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Progress</h1>
          <p className="text-sm text-slate-500">{subject?.name} · {classLevel} · {total} lessons</p>
        </div>
        <Button variant="outline" onClick={exportReport}><FileDown className="h-4 w-4" /> Export Report</Button>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {subject?.classLevels.map((cl) => (
          <button key={cl} onClick={() => setClassLevel(cl)} className={cn("min-h-[44px] shrink-0 rounded-full border px-4 py-2 text-sm font-medium", cl === classLevel ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300")}>{cl}</button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Overall</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">{completed} of {total} lessons completed</span>
            <span className="font-bold text-indigo-600">{total ? Math.round((completed / total) * 100) : 0}%</span>
          </div>
          <Progress value={total ? (completed / total) * 100 : 0} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>By Term</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {termStats.map((s) => (
            <div key={s.term} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{TERM_NAMES[s.term]} {s.done === s.total && s.total > 0 && <CheckCircle2 className="h-4 w-4 text-green-600" />}</span>
                <span className="text-xs text-slate-500">{s.done}/{s.total}</span>
              </div>
              <Progress value={s.total ? (s.done / s.total) * 100 : 0} className={SEQUENCE_BARS[s.term - 1]} />
              {s.done === s.total && s.total > 0 && <p className="mt-1 text-xs font-medium text-green-600">Term complete — ready for end-of-term evaluation</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Lessons</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12">
            {(progression ?? []).map((e) => {
              const st = statusByLesson[e.lessonNumber];
              const isEval = e.isEvaluation;
              return (
                <button key={e.id} title={`L${e.lessonNumber} — ${e.lessonTitle}${st ? ` — ${STATUS_LABELS[st]}` : ""}`} onClick={() => navigate(`/lesson-plan/${subjectId}/${classLevel}/${e.lessonNumber}`)} className={cn("flex h-9 items-center justify-center rounded-md border border-slate-200 text-[10px] font-semibold dark:border-slate-700", st ? HEAT_COLORS[st] : isEval ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-slate-100 text-slate-400 dark:bg-slate-800")}>
                  {e.lessonNumber}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {(Object.keys(HEAT_COLORS) as LessonStatus[]).map((st) => (
              <span key={st} className="flex items-center gap-1"><span className={cn("h-3 w-3 rounded", HEAT_COLORS[st])} />{STATUS_LABELS[st]}</span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
