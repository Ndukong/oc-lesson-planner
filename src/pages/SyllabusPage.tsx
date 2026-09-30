import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronDown, ChevronRight, GraduationCap, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProgressionByTerm, useSubject } from "@/db/hooks";
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
          <p className="text-xs text-slate-500">{TERM_NAMES[entry.term]} · Seq {entry.sequence}</p>
          <Link to={`/lesson-plan/${subjectId}/${classLevel}/${entry.lessonNumber}`} className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">Plan this lesson (L{entry.lessonNumber}) →</Link>
        </div>
      )}
    </div>
  );
}

export function SyllabusPage() {
  const { subjectId, classLevel, setClassLevel } = useAppStore();
  const subject = useSubject(subjectId);
  const termGroups = useProgressionByTerm(subjectId, classLevel);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    if (!termGroups) return [];
    const q = query.trim().toLowerCase();
    const flat = termGroups.flatMap((g) => g.lessons);
    const filtered = !q ? flat : flat.filter((r) => r.lessonTitle.toLowerCase().includes(q) || r.chapter.toLowerCase().includes(q) || r.moduleName.toLowerCase().includes(q));
    const byChapter = new Map<string, ProgressionEntry[]>();
    for (const r of filtered) {
      const key = r.chapter || r.moduleName || "(General)";
      if (!byChapter.has(key)) byChapter.set(key, []);
      byChapter.get(key)!.push(r);
    }
    return [...byChapter.entries()].map(([chapter, lessons]) => ({ chapter, lessons }));
  }, [termGroups, query]);

  const totalLessons = termGroups?.reduce((a, g) => a + g.lessons.length, 0) ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Syllabus Browser</h1>
        <p className="text-sm text-slate-500">{subject?.name} · {classLevel} · {totalLessons} lessons · from harmonised sheets · week set by you</p>
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

      {!termGroups ? (
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
          ) : termGroups.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-sm text-slate-500">No lessons for this class level.</CardContent></Card>
          ) : (
            groups.map(({ chapter, lessons }) => (
              <Card key={chapter}><CardContent className="pt-4">
                <div className="mb-3 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">{lessons.length}</span><div><h2 className="font-semibold text-slate-900 dark:text-slate-100">{chapter}</h2><p className="text-xs text-slate-500">{lessons.length} lesson{lessons.length > 1 ? "s" : ""} · {TERM_NAMES[lessons[0].term]}</p></div></div>
                <div className="space-y-2">{lessons.map((e) => <LessonRow key={e.id} entry={e} subjectId={subjectId} classLevel={classLevel} />)}</div>
              </CardContent></Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
