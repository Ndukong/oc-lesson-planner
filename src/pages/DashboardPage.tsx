import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck2,
  FileDown,
  PlayCircle,
  Sparkles,
  Swords
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  useCalendar,
  useLessonPlansBySubject,
  useProgression,
  useSubjects,
  useTeacherProfile
} from "@/db/hooks";
import { useAppStore } from "@/stores/app-store";
import { useCurrentWeek } from "@/hooks/useCurrentWeek";
import { TERM_NAMES } from "@/types";
import { daysUntilEvaluation, weekInfo } from "@/utils/calendar";

export function DashboardPage() {
  const { subjectId, classLevel } = useAppStore();
  const subjects = useSubjects();
  const progression = useProgression(subjectId, classLevel);
  const plans = useLessonPlansBySubject(subjectId);
  const calendar = useCalendar();
  const profile = useTeacherProfile();
  const { week, sequence, term } = useCurrentWeek();
  const navigate = useNavigate();

  const currentEntry = useMemo(
    () => progression?.find((e) => e.weekNumber === week),
    [progression, week]
  );

  const completedCount = useMemo(
    () => plans?.filter((p) => p.status === "completed").length ?? 0,
    [plans]
  );

  const totalCount = useMemo(
    () => plans?.length ?? 0,
    [plans]
  );

  const currentPlan = useMemo(
    () => plans?.find((p) => p.weekNumber === week),
    [plans, week]
  );

  const behind = useMemo(() => {
    const rows = progression ?? [];
    const plannedWeeks = new Set((plans ?? []).map((p) => p.weekNumber));
    const last = rows.filter((r) => plannedWeeks.has(r.weekNumber)).pop();
    if (!last) return 0;
    const lastProg = rows.find((r) => r.weekNumber === last.weekNumber);
    if (!lastProg || lastProg.isHoliday) return 0;
    return week - last.weekNumber;
  }, [progression, plans, week]);

  const daysEval = calendar ? daysUntilEvaluation(week, calendar) : null;
  const info = calendar ? weekInfo(week, calendar) : null;

  const completedPerLevel = useMemo(() => {
    const map: Record<string, { done: number; total: number }> = {};
    for (const s of subjects ?? []) {
      for (const cl of s.classLevels) {
        map[`${s.id}:${cl}`] = { done: 0, total: 0 };
      }
    }
    for (const p of plans ?? []) {
      const key = `${p.subjectId}:${p.classLevel}`;
      if (map[key]) {
        map[key].total += 1;
        if (p.status === "completed") map[key].done += 1;
      }
    }
    return map;
  }, [plans, subjects]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {profile?.name ? null : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/50">
          <div>
            <p className="font-semibold text-indigo-900 dark:text-indigo-200">
              Finish setting up your profile
            </p>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              Add your name and school so exported lesson plans look professional.
            </p>
          </div>
          <Button size="sm" onClick={() => navigate("/settings")}>
            Open Settings
          </Button>
        </div>
      )}

      <Card className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-200">
              Current academic week
            </p>
            <p className="mt-1 text-3xl font-bold">
              Week {week}
            </p>
            <p className="mt-1 text-sm text-indigo-100">
              Sequence {sequence} · {TERM_NAMES[term]} · {calendar?.academicYear}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Button
              variant="secondary"
              className="bg-white/15 text-white hover:bg-white/25"
              onClick={() =>
                navigate(
                  currentEntry && !currentEntry.isHoliday
                    ? `/lesson-plan/${subjectId}/${classLevel}/${week}`
                    : "/progression"
                )
              }
            >
              <PlayCircle className="h-4 w-4" />
              {currentEntry && !currentEntry.isHoliday
                ? "Plan This Week"
                : "View Progression"}
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/15"
              onClick={() => navigate("/export")}
            >
              <FileDown className="h-4 w-4" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentEntry && !currentEntry.isHoliday && !currentEntry.isEvaluation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck2 className="h-4 w-4 text-indigo-600" />
              This Week's Lesson
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {currentEntry.lessonTitle}
              </p>
              <p className="text-sm text-slate-500">
                {currentEntry.moduleName} · {currentEntry.chapter}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(`/lesson-plan/${subjectId}/${classLevel}/${week}`)
              }
            >
              {currentPlan ? "Open plan" : "Create plan"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">
                {completedCount} of {totalCount} planned lessons completed
              </span>
              <span className="font-semibold text-indigo-600">
                {totalCount ? Math.round((completedCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <Progress
              value={totalCount ? (completedCount / totalCount) * 100 : 0}
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(completedPerLevel)
                .filter(([, v]) => v.total > 0)
                .slice(0, 6)
                .map(([key, v]) => {
                  const [, cl] = key.split(":");
                  return (
                    <div
                      key={key}
                      className="rounded-lg border border-slate-200 p-2 dark:border-slate-700"
                    >
                      <p className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                        {cl}
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {v.done}/{v.total}
                      </p>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {behind > 0 ? (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  You're {behind} week{behind > 1 ? "s" : ""} behind schedule in{" "}
                  {classLevel}. Plan the current week to catch up.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
                <CalendarCheck2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>You're on schedule. Keep planning each week.</span>
              </div>
            )}
            {info?.isEvaluation ? (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <Swords className="mt-0.5 h-4 w-4 shrink-0" />
                <span>This is an evaluation week (Sequence {info.sequence}).</span>
              </div>
            ) : daysEval !== null && daysEval !== undefined ? (
              <div className="flex items-start gap-2 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                <Swords className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Sequence {sequence} evaluation in {daysEval} week
                  {daysEval === 1 ? "" : "s"}. Prepare your learners.
                </span>
              </div>
            ) : null}
            {info?.isHoliday && (
              <div className="flex items-start gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <CalendarCheck2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>This week is a holiday week — no lesson planned.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => navigate("/progression")}>
            <CalendarCheck2 className="h-4 w-4" /> View Progression
          </Button>
          <Button variant="outline" onClick={() => navigate("/syllabus")}>
            <Sparkles className="h-4 w-4" /> Browse Syllabus
          </Button>
          <Button variant="outline" onClick={() => navigate("/progress")}>
            <AlertTriangle className="h-4 w-4" /> Progress Tracker
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
