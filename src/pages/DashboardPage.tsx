import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, CalendarCheck2, FileDown, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCalendar, useLessonPlansBySubject, useProgression, useSubjects, useTeacherProfile } from "@/db/hooks";
import { useAppStore } from "@/stores/app-store";
import { TERM_NAMES } from "@/types";
import type { Term } from "@/types";
import { buildBackup, downloadBackup, shouldRemindBackup, snoozeBackupReminder } from "@/services/backup";

export function DashboardPage() {
  const { subjectId, classLevel } = useAppStore();
  const subjects = useSubjects();
  const progression = useProgression(subjectId, classLevel);
  const plans = useLessonPlansBySubject(subjectId);
  const calendar = useCalendar();
  const profile = useTeacherProfile();
  const navigate = useNavigate();

  const termStats = useMemo(() => {
    const rows = progression ?? [];
    const planSet = new Set((plans ?? []).filter((p) => p.subjectId === subjectId && p.classLevel === classLevel).map((p) => p.lessonNumber));
    const byTerm: Record<Term, { total: number; planned: number; completed: number }> = {
      1: { total: 0, planned: 0, completed: 0 },
      2: { total: 0, planned: 0, completed: 0 },
      3: { total: 0, planned: 0, completed: 0 },
    };
    for (const r of rows) {
      byTerm[r.term].total++;
      if (planSet.has(r.lessonNumber)) byTerm[r.term].planned++;
    }
    for (const p of plans ?? []) {
      if (p.subjectId !== subjectId || p.classLevel !== classLevel) continue;
      if (p.status === "completed") {
        const prog = rows.find((r) => r.lessonNumber === p.lessonNumber);
        if (prog) byTerm[prog.term].completed++;
      }
    }
    return byTerm;
  }, [progression, plans, subjectId, classLevel]);

  const nextLesson = useMemo(() => {
    const rows = progression ?? [];
    const planSet = new Set((plans ?? []).filter((p) => p.subjectId === subjectId && p.classLevel === classLevel).map((p) => p.lessonNumber));
    return rows.find((r) => !planSet.has(r.lessonNumber));
  }, [progression, plans, subjectId, classLevel]);

  const currentPlan = useMemo(() => {
    if (!nextLesson) return undefined;
    return (plans ?? []).find((p) => p.lessonNumber === nextLesson.lessonNumber && p.subjectId === subjectId && p.classLevel === classLevel);
  }, [plans, nextLesson, subjectId, classLevel]);

  const completedCount = useMemo(() => (plans ?? []).filter((p) => p.subjectId === subjectId && p.classLevel === classLevel && p.status === "completed").length, [plans, subjectId, classLevel]);
  const totalLessons = progression?.length ?? 0;

  const [backupReminderOpen, setBackupReminderOpen] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const remindBackup = shouldRemindBackup((plans?.length ?? 0) > 0);

  const handleBackupNow = async () => {
    setBackingUp(true);
    try {
      downloadBackup(await buildBackup(false));
      toast.success("Backup downloaded — keep a copy somewhere safe");
      setBackupReminderOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Backup failed");
    } finally {
      setBackingUp(false);
    }
  };

  const completedPerLevel = useMemo(() => {
    const map: Record<string, { done: number; total: number }> = {};
    for (const s of subjects ?? []) for (const cl of s.classLevels) map[`${s.id}:${cl}`] = { done: 0, total: 0 };
    for (const p of plans ?? []) {
      const key = `${p.subjectId}:${p.classLevel}`;
      if (map[key]) {
        map[key].total++;
        if (p.status === "completed") map[key].done++;
      }
    }
    return map;
  }, [plans, subjects]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {profile?.name ? null : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/50">
          <div>
            <p className="font-semibold text-indigo-900 dark:text-indigo-200">Finish setting up your profile</p>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">Add your name and school so exported lesson plans look professional.</p>
          </div>
          <Button size="sm" onClick={() => navigate("/settings")}>Open Settings</Button>
        </div>
      )}

      {backupReminderOpen && remindBackup && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 p-4 dark:bg-amber-950/50">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">Back up your lesson plans</p>
              <p className="text-sm text-amber-800 dark:text-amber-300">Everything lives only on this device. Export a copy so a lost phone does not erase your work.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => void handleBackupNow()} disabled={backingUp}>
              {backingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />} Back up now
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { snoozeBackupReminder(); setBackupReminderOpen(false); }}>Later</Button>
          </div>
        </div>
      )}

      <Card className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-200">{progression?.length ? `${totalLessons} lessons · harmonised progression` : "Harmonised progression"}</p>
            <p className="mt-1 text-2xl font-bold">{progression?.[0] ? `${progression[0].chapter}` : "Lesson Planner"}</p>
            <p className="mt-1 text-sm text-indigo-100">{calendar?.academicYear ?? ""} · {classLevel}</p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Button variant="secondary" className="bg-white/15 text-white hover:bg-white/25" onClick={() => navigate(nextLesson ? `/lesson-plan/${subjectId}/${classLevel}/${nextLesson.lessonNumber}` : "/progression")}>
              {nextLesson ? `Plan L${nextLesson.lessonNumber}` : "View Progression"}
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/15" onClick={() => navigate("/export")}><FileDown className="h-4 w-4" /> Export</Button>
          </div>
        </CardContent>
      </Card>

      {nextLesson && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarCheck2 className="h-4 w-4 text-indigo-600" /> Next Lesson · {TERM_NAMES[nextLesson.term]} · L{nextLesson.lessonNumber}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">{nextLesson.lessonTitle}</p>
              <p className="text-sm text-slate-500">{nextLesson.moduleName} · {nextLesson.chapter}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate(`/lesson-plan/${subjectId}/${classLevel}/${nextLesson.lessonNumber}`)}>{currentPlan ? "Open plan" : "Create plan"} <ArrowRight className="h-4 w-4" /></Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">{completedCount} of {totalLessons} lessons completed</span>
              <span className="font-semibold text-indigo-600">{totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0}%</span>
            </div>
            <Progress value={totalLessons ? (completedCount / totalLessons) * 100 : 0} />
            <div className="space-y-2">
              {([1, 2, 3] as Term[]).map((t) => {
                const s = termStats[t];
                if (!s.total) return null;
                const pct = s.total ? (s.completed / s.total) * 100 : 0;
                const done = s.completed === s.total && s.total > 0;
                return (
                  <div key={t} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{TERM_NAMES[t]} · {s.completed}/{s.total} completed</span>
                      <span className={done ? "font-bold text-green-600" : "text-slate-500"}>{done ? "Complete ✓" : `${Math.round(pct)}%`}</span>
                    </div>
                    <Progress value={pct} />
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(completedPerLevel).filter(([, v]) => v.total > 0).slice(0, 6).map(([key, v]) => {
                const [, cl] = key.split(":");
                return (
                  <div key={key} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                    <p className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">{cl}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{v.done}/{v.total}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Term Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {([1, 2, 3] as Term[]).map((t) => {
              const s = termStats[t];
              if (!s.total) return null;
              const allPlanned = s.planned === s.total;
              return (
                <div key={t} className={`rounded-lg p-3 text-sm ${allPlanned ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200" : "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                  <span className="font-semibold">{TERM_NAMES[t]}:</span> {s.planned}/{s.total} lessons planned{s.completed ? `, ${s.completed} completed` : ""}{allPlanned ? " — all lessons planned" : ""}
                </div>
              );
            })}
            {!totalLessons && <p className="text-sm text-slate-500">No lessons loaded for this class level.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => navigate("/progression")}><CalendarCheck2 className="h-4 w-4" /> View Progression</Button>
          <Button variant="outline" onClick={() => navigate("/syllabus")}><Sparkles className="h-4 w-4" /> Browse Syllabus</Button>
          <Button variant="outline" onClick={() => navigate("/progress")}><CalendarCheck2 className="h-4 w-4" /> Progress Tracker</Button>
        </CardContent>
      </Card>
    </div>
  );
}
