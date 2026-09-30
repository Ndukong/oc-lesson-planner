import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronDown, ChevronRight, Clock3, GraduationCap, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useOverflowLessons, useProgressionAll, useSubject } from "@/db/hooks";
import { useAppStore } from "@/stores/app-store";
import type { ProgressionEntry } from "@/types";
import { cn } from "@/utils/cn";

function LessonRow({ entry, subjectId, classLevel }: { entry: ProgressionEntry; subjectId: string; classLevel: string }) {
  const [open, setOpen] = useState(false);
  const isOverflow = entry.weekNumber > 36;
  return (
    <div className={cn("rounded-lg border", isOverflow ? "border-amber-200 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-950/30" : "border-slate-200 dark:border-slate-700")}>
      <button onClick={() => setOpen((o) => !o)} className="flex min-h-[48px] w-full items-center justify-between gap-2 px-3 py-2 text-left">
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className={cn("flex h-6 min-w-6 shrink-0 items-center justify-center rounded px-1.5 text-[11px] font-bold", isOverflow ? "bg-amber-600 text-white" : "bg-indigo-600 text-white")}>
            {entry.lessonNumber ?? entry.weekNumber}
          </span>
          <span className="min-w-0 truncate text-sm font-medium text-slate-800 dark:text-slate-200">{entry.lessonTitle}</span>
        </span>
        {open ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />}
      </button>
      {open && (
        <div className="space-y-2 border-t border-slate-100 p-3 dark:border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">Chapter</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{entry.chapter || "—"}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">Module</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{entry.moduleName || "—"}</p>
          {entry.weekPeriod && (
            <>
              <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400"><Clock3 className="h-3 w-3" /> Week / Period (from harmonised sheet)</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{entry.weekPeriod}</p>
            </>
          )}
          <p className="text-xs text-slate-500">Week {entry.weekNumber}{isOverflow ? " · Overflow (beyond 36-week calendar)" : ""} · {entry.isHoliday ? "Holiday" : entry.isEvaluation ? "Evaluation" : `Term ${entry.term} · Sequence ${entry.sequence}`}</p>
          {!isOverflow ? (
            <Link to={`/lesson-plan/${subjectId}/${classLevel}/${entry.weekNumber}`} className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">Plan this lesson (Week {entry.weekNumber}) →</Link>
          ) : (
            <span className="text-xs italic text-amber-700 dark:text-amber-300">Overflow lessons are listed for completeness — plan them as extra sessions or next-year carry-over.</span>
          )}
        </div>
      )}
    </div>
  );
}

export function SyllabusPage() {
  const { subjectId, classLevel, setClassLevel } = useAppStore();
  const subject = useSubject(subjectId);
  const all = useProgressionAll(subjectId, classLevel);
  const overflow = useOverflowLessons(subjectId, classLevel);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    if (!all) return [];
    const q = query.trim().toLowerCase();
    const rows = all.filter((r) => !r.isHoliday && !r.isEvaluation && r.lessonTitle && r.weekNumber <= 36);
    const filtered = !q ? rows : rows.filter((r) => r.lessonTitle.toLowerCase().includes(q) || r.chapter.toLowerCase().includes(q) || r.moduleName.toLowerCase().includes(q));
    const byChapter = new Map<string, ProgressionEntry[]>();
    for (const r of filtered) {
      const key = r.chapter || r.moduleName || "(General)";
      if (!byChapter.has(key)) byChapter.set(key, []);
      byChapter.get(key)!.push(r);
    }
    return [...byChapter.entries()].map(([chapter, lessons]) => ({ chapter, lessons }));
  }, [all, query]);

  const totalLessons = all?.filter((r) => !r.isHoliday && !r.isEvaluation && r.weekNumber <= 36).length ?? 0;
  const overflowCount = overflow?.length ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Syllabus Browser</h1>
        <p className="text-sm text-slate-500">{subject?.name} · {classLevel} · lessons from the harmonised progression sheets · {totalLessons} lessons{overflowCount ? ` + ${overflowCount} overflow` : ""}</p>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {subject?.classLevels.map((cl) => (
          <button key={cl} onClick={() => setClassLevel(cl)} className={cn("min-h-[44px] shrink-0 rounded-full border px-4 py-2 text-sm font-medium", cl === classLevel ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300")}>{cl}</button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Lesson title or Chapter..." className="pl-9" />
      </div>

      {!all ? (
        <div className="flex h-40 items-center justify-center text-slate-400"><GraduationCap className="mr-2 h-5 w-5" /> Loading syllabus…</div>
      ) : (
        <div className="space-y-4">
          {groups.map(({ chapter, lessons }) => (
            <Card key={chapter}>
              <CardContent className="pt-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">{lessons.length}</span>
                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100">{chapter}</h2>
                    <p className="text-xs text-slate-500">{lessons.length} lesson{lessons.length > 1 ? "s" : ""} · teachable units from the progression sheet</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {lessons.map((entry) => (
                    <LessonRow key={entry.id} entry={entry} subjectId={subjectId} classLevel={classLevel} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {query && groups.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-slate-400"><BookOpen className="h-8 w-8" /><p className="text-sm">No lessons match "{query}".</p></div>
          )}
          {!query && overflowCount > 0 && overflow && overflow.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-950/30">
              <CardContent className="pt-4">
                <h2 className="font-semibold text-amber-900 dark:text-amber-100">Overflow lessons — beyond the 36-week calendar ({overflowCount})</h2>
                <p className="mb-3 text-xs text-amber-700 dark:text-amber-300">These lessons exist in the official harmonised progression but do not fit inside the 36-week grid. They are kept here so no content is lost.</p>
                <div className="space-y-2">
                  {overflow.map((e) => (
                    <LessonRow key={e.id} entry={e} subjectId={subjectId} classLevel={classLevel} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
