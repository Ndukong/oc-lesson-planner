import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Search
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSyllabusModules, useSubject } from "@/db/hooks";
import { useAppStore } from "@/stores/app-store";
import type { SyllabusModule, SyllabusTopic } from "@/types";
import { cn } from "@/utils/cn";

function TopicCard({
  topic,
  subjectId,
  classLevel
}: {
  topic: SyllabusTopic;
  subjectId: string;
  classLevel: string;
}) {
  const [open, setOpen] = useState(false);
  const rows = [
    { label: "Core Knowledge", value: topic.coreKnowledge },
    { label: "Competencies", value: topic.competencies },
    { label: "Aptitudes", value: topic.aptitudes },
    { label: "Attitudes", value: topic.attitudes },
    { label: "Other Resources", value: topic.otherResources }
  ];
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[48px] w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {topic.name}
        </span>
        {open ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="space-y-3 border-t border-slate-100 p-3 dark:border-slate-800">
          {rows.map((r) => (
            <div key={r.label}>
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                {r.label}
              </p>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                {r.value}
              </p>
            </div>
          ))}
          <Link
            to={`/lesson-plan/${subjectId}/${classLevel}/1`}
            className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View in Progression →
          </Link>
        </div>
      )}
    </div>
  );
}

export function SyllabusPage() {
  const { subjectId, classLevel, setClassLevel } = useAppStore();
  const subject = useSubject(subjectId);
  const modules = useSyllabusModules(subjectId, classLevel);
  const [query, setQuery] = useState("");

  const filteredModules = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!modules) return [];
    if (!q) return modules;
    const result: SyllabusModule[] = [];
    for (const m of modules) {
      const matchingTopics = m.topics.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.coreKnowledge.toLowerCase().includes(q) ||
          t.competencies.toLowerCase().includes(q)
      );
      if (matchingTopics.length) {
        result.push({ ...m, topics: matchingTopics });
      }
    }
    return result;
  }, [modules, query]);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Syllabus Browser
        </h1>
        <p className="text-sm text-slate-500">
          {subject?.name} syllabus · {classLevel} · official MINESEC competency matrix
        </p>
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics, competencies or knowledge..."
          className="pl-9"
        />
      </div>

      {!modules ? (
        <div className="flex h-40 items-center justify-center text-slate-400">
          <GraduationCap className="mr-2 h-5 w-5" /> Loading syllabus…
        </div>
      ) : (
        <div className="space-y-4">
          {filteredModules.map((module) => (
            <Card key={module.id}>
              <CardContent className="pt-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                    {module.moduleNumber}
                  </span>
                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                      {module.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {module.duration} · {module.topics.length} topics
                    </p>
                  </div>
                </div>
                <p className="mb-3 text-xs italic text-slate-500">
                  {module.familiesOfSituations}
                </p>
                <div className="space-y-2">
                  {module.topics.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      subjectId={subjectId}
                      classLevel={classLevel}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {query && filteredModules.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
              <BookOpen className="h-8 w-8" />
              <p className="text-sm">No topics match "{query}".</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
