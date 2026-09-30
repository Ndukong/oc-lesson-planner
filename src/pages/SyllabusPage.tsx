import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CalendarRange, ChevronDown, ChevronRight, Clock3, GraduationCap, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProgressionByPeriod, useSubject } from "@/db/hooks";
import { useAppStore } from "@/stores/app-store";
import type { ProgressionEntry } from "@/types";
import { cn } from "@/utils/cn";
import { TERM_NAMES } from "@/types";

function LessonRow({ entry, subjectId, classLevel }: { entry: ProgressionEntry; subjectId: string; classLevel: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700">
      <button onClick={() => setOpen((o) => !o)} className="flex min-h-[48px] w-full items-center justify-between gap-2 px-3 py-2 text-left">
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded bg-indigo-600 px-1.5 text-[11px] font-bold text-white">#{entry.lessonNumber}</span>
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
              <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400"><Clock3 className="h-3 w-3" /> Week / Period</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{entry.weekPeriod} · lesson {entry.lessonIndexInPeriod}/{entry.periodLessonCount} in this period</p>
            </>
          )}
          <p className="text-xs text-slate-500">Lesson {entry.lessonNumber} · Period {entry.periodIndex} · {TERM_NAMES[entry.term]} · Seq {entry.sequence}</p>
          <Link to={`/lesson-plan/${subjectId}/${classLevel}/${entry.lessonNumber}`} className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">Plan this lesson (L{entry.lessonNumber}) →</Link>
        </div>
      )}
    </div>
  );
}

export function SyllabusPage() {
  const { subjectId, classLevel, setClassLevel } = useAppStore();
  const subject = useSubject(subjectId);
  const periods = useProgressionByPeriod(subjectId, classLevel);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    if (!periods) return [];
    const q = query.trim().toLowerCase();
    const flat = periods.flatMap((g) => g.lessons);
    const filtered = !q ? flat : flat.filter((r) => r.lessonTitle.toLowerCase().includes(q) || r.chapter.toLowerCase().includes(q) || r.moduleName.toLowerCase().includes(q) || r.weekPeriod.toLowerCase().includes(q));
    const byChapter = new Map<string, ProgressionEntry[]>();
    for (const r of filtered) {
      const key = r.chapter || r.moduleName || "(General)";
      if (!byChapter.has(key)) byChapter.set(key, []);
      byChapter.get(key)!.push(r);
    }
    return [...byChapter.entries()].map(([chapter, lessons]) => ({ chapter, lessons }));
  }, [periods, query]);

  const totalLessons = periods?.reduce((a, g) => a + g.lessons.length, 0) ?? 0;
  const totalPeriods = periods?.length ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Syllabus Browser</h1>
        <p className="text-sm text-slate-500">{subject?.name} · {classLevel} · {totalLessons} lessons in {totalPeriods} periods · from harmonised progression sheets</p>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {subject?.classLevels.map((cl) => (
          <button key={cl} onClick={() => setClassLevel(cl)} className={cn("min-h-[44px] shrink-0 rounded-full border px-4 py-2 text-sm font-medium", cl === classLevel ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300")}>{cl}</button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Lesson title, Chapter or Week / Period..." className="pl-9" />
      </div>

      {!periods ? (
        <div className="flex h-40 items-center justify-center text-slate-400"><GraduationCap className="mr-2 h-5 w-5" /> Loading syllabus…</div>
      ) : (
        <div className="space-y-4">
          {query ? (
            <>
              {groups.map(({ chapter, lessons }) => (
                <Card key={chapter}><CardContent className="pt-4">
                  <div className="mb-3 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">{lessons.length}</span><div><h2 className="font-semibold text-slate-900 dark:text-slate-100">{chapter}</h2><p className="text-xs text-slate-500">{lessons.length} matching lesson{lessons.length > 1 ? "s" : ""}</p></div></div>
                  <div className="space-y-2">{lessons.map((e) => <LessonRow key={e.id} entry={e} subjectId={subjectId} classLevel={classLevel} />)}</div>
                </CardContent></Card>
              ))}
              {groups.length === 0 && <div className="flex flex-col items-center gap-2 py-10 text-slate-400"><BookOpen className="h-8 w-8" /><p className="text-sm">No lessons match "{query}".</p></div>}
            </>
          ) : (
            periods.map((group) => (
              <Card key={group.periodIndex} className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white"><CalendarRange className="h-3.5 w-3.5" /> Period {group.periodIndex}</span>
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300"><Clock3 className="h-3.5 w-3.5" />{group.weekPeriod}</span>
                    <span className="text-xs text-slate-500">{TERM_NAMES[group.term]} · Seq {group.sequence}</span>
                  </div>
                  <span className="text-xs text-slate-400">L{group.lessons[0].lessonNumber}–L{group.lessons[group.lessons.length - 1].lessonNumber} · {group.lessons.length} lesson{group.lessons.length > 1 ? "s" : ""}</span>
                </div>
                <CardContent className="space-y-2 pt-3">
                  {group.lessons.map((entry) => <LessonRow key={entry.id} entry={entry} subjectId={subjectId} classLevel={classLevel} />)}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
