import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Clock3, GraduationCap, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLessonPlans, useProgressionByTerm, useSubject } from "@/db/hooks";
import { useAppStore } from "@/stores/app-store";
import { STATUS_COLORS, STATUS_LABELS, TERM_NAMES } from "@/types";
import type { ClassLevel, LessonStatus, Term } from "@/types";
import { cn } from "@/utils/cn";

const TERMS: Term[] = [1, 2, 3];

export function ProgressionPage() {
  const { subjectId, classLevel, setClassLevel } = useAppStore();
  const subject = useSubject(subjectId);
  const termGroups = useProgressionByTerm(subjectId, classLevel);
  const plans = useLessonPlans(subjectId, classLevel);
  const navigate = useNavigate();
  const [termFilter, setTermFilter] = useState<Term | "all">("all");

  const statusByLesson = useMemo(() => {
    const map: Record<number, LessonStatus> = {};
    for (const p of plans ?? []) map[(p as unknown as { lessonNumber: number }).lessonNumber ?? p.weekNumber] = p.status;
    return map;
  }, [plans]);

  const filtered = useMemo(() => {
    if (!termGroups) return [];
    if (termFilter === "all") return termGroups;
    return termGroups.filter((g) => g.term === termFilter);
  }, [termGroups, termFilter]);

  const firstUnplanned = useMemo(() => {
    if (!termGroups) return undefined;
    for (const g of termGroups) for (const e of g.lessons) if (!statusByLesson[e.lessonNumber]) return e;
    return undefined;
  }, [termGroups, statusByLesson]);

  const totalLessons = termGroups?.reduce((a, g) => a + g.lessons.length, 0) ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Progression — Lessons by Term</h1>
          <p className="text-sm text-slate-500">{subject?.name} · {classLevel} · {totalLessons} lessons · from harmonised sheets · week set by you</p>
        </div>
        <Button onClick={() => firstUnplanned && navigate(`/lesson-plan/${subjectId}/${classLevel}/${firstUnplanned.lessonNumber}`)} disabled={!firstUnplanned}>
          <Layers className="h-4 w-4" /> Plan Next {firstUnplanned ? `(L${firstUnplanned.lessonNumber})` : ""}
        </Button>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {subject?.classLevels.map((cl: ClassLevel) => (
          <button key={cl} onClick={() => setClassLevel(cl)} className={cn("min-h-[44px] shrink-0 rounded-full border px-4 py-2 text-sm font-medium", cl === classLevel ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300")}>{cl}</button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTermFilter("all")} className={cn("min-h-[40px] rounded-lg px-4 text-sm font-medium", termFilter === "all" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>All</button>
        {TERMS.map((t) => (
          <button key={t} onClick={() => setTermFilter(t)} className={cn("min-h-[40px] rounded-lg px-4 text-sm font-medium", termFilter === t ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>{TERM_NAMES[t]}</button>
        ))}
      </div>

      {!termGroups ? (
        <div className="flex h-40 items-center justify-center text-slate-400"><GraduationCap className="mr-2 h-5 w-5" /> Loading progression…</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-slate-500">No lessons for this term.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((group) => (
            <Card key={group.term} className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">{TERM_NAMES[group.term]}</span>
                  <span className="text-xs text-slate-500">{group.lessons.length} lessons</span>
                </div>
                <span className="text-xs text-slate-400">L{group.lessons[0].lessonNumber}–L{group.lessons[group.lessons.length - 1].lessonNumber}</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="grid grid-cols-[52px_1fr_80px] gap-2 bg-slate-50/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/40 sm:grid-cols-[56px_1fr_1fr_72px]">
                  <span>Lsn #</span><span>Lesson title</span><span className="hidden sm:block">Chapter</span><span className="text-right">Status</span>
                </div>
                {group.lessons.map((entry) => {
                  const status = statusByLesson[entry.lessonNumber];
                  return (
                    <button key={entry.id} onClick={() => navigate(`/lesson-plan/${subjectId}/${classLevel}/${entry.lessonNumber}`)} title={entry.chapter} className="grid w-full grid-cols-[52px_1fr_80px] items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-indigo-50/60 sm:grid-cols-[56px_1fr_1fr_72px] dark:hover:bg-slate-800/60">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">#{entry.lessonNumber}</span>
                      <span className="min-w-0 truncate text-sm text-slate-700 dark:text-slate-200">{entry.lessonTitle}{entry.isIntegration ? " · Integration" : ""}{entry.isRemediation ? " · Remediation" : ""}{entry.isCatchUp ? " · Catch-up" : ""}{entry.isEvaluation ? " · Evaluation" : ""}</span>
                      <span className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">{entry.chapter}</span>
                      <span className="flex justify-end">{status ? <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge> : <Badge variant="outline">—</Badge>}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> Term from the harmonised sheet — set the week/date yourself when planning</span>
        <span className="flex items-center gap-1"><ChevronRight className="h-3.5 w-3.5" /> Click a lesson to plan it</span>
      </div>
    </div>
  );
}
