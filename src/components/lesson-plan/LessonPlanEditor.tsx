import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  FileDown,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { StatusSelector } from "@/components/lesson-plan/StatusSelector";
import { LessonNotesField } from "@/components/lesson-plan/LessonNotesField";
import { AIGenerateButton } from "@/components/lesson-plan/AIGenerateButton";
import { AIPanel } from "@/components/ai/AIPanel";
import {
  getOrCreateLessonPlan,
  saveLessonPlan,
  useAISettings,
  useCalendar,
  useSubject,
  useSyllabusModules,
  useTeacherProfile
} from "@/db/hooks";
import { generateLessonContent } from "@/services/ai";
import type { GenerationContext } from "@/services/ai/prompts";
import { exportLessonPlanPDF } from "@/services/export/pdf";
import { exportLessonPlanDocx } from "@/services/export/docx";
import { useAutoSave } from "@/hooks/useAutoSave";
import {
  ACTIVITY_TYPES,
  CROSS_CUTTING_COMPETENCIES
} from "@/types";
import type { Activity, LessonField, LessonPlan } from "@/types";
import { uid } from "@/utils/format";
import { cn } from "@/utils/cn";

const STRING_LIST_FIELDS: LessonField[] = ["objectives", "materials", "evaluationCriteria"];

function StringListEditor({
  value,
  onChange,
  placeholder
}: {
  value: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => {
              const next = [...value];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...value, ""])}
      >
        <Plus className="h-4 w-4" /> Add item
      </Button>
    </div>
  );
}

export function LessonPlanEditor() {
  const { subjectId = "physics", classLevel = "Form 3", weekNumber = "1" } = useParams();
  const week = Number(weekNumber);
  const navigate = useNavigate();

  const subject = useSubject(subjectId);
  const modules = useSyllabusModules(subjectId, classLevel as never);
  const profile = useTeacherProfile();
  const calendar = useCalendar();
  const settings = useAISettings();

  const [draft, setDraft] = useState<LessonPlan | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setDraft(null);
    getOrCreateLessonPlan(subjectId, classLevel as never, week).then((plan) => {
      if (!cancelled) {
        setDraft(plan);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [subjectId, classLevel, week]);

  const { saving, savedAt } = useAutoSave(
    draft,
    async (d) => {
      if (d) await saveLessonPlan(d);
    }
  );

  const patch = (partial: Partial<LessonPlan>) =>
    setDraft((d) => (d ? { ...d, ...partial } : d));

  const context: GenerationContext | null = useMemo(() => {
    if (!draft || !subject) return null;
    const module = modules?.find((m) => m.name === draft.module);
    const topic = module?.topics.find((t) => t.name === draft.chapter);
    return {
      subject: subject.name,
      classLevel: draft.classLevel,
      module: draft.module,
      chapter: draft.chapter,
      topic: draft.topic,
      subtopics: draft.subtopics,
      duration: draft.duration,
      periodType: draft.periodType,
      numberOfPeriods: draft.numberOfPeriods,
      coreKnowledge: topic?.coreKnowledge ?? "",
      competencies: topic?.competencies ?? "",
      aptitudes: topic?.aptitudes ?? "",
      attitudes: topic?.attitudes ?? "",
      otherResources: topic?.otherResources ?? "",
      previousLessonTitle: ""
    };
  }, [draft, subject, modules]);

  const applyResult = (res: Record<string, unknown>, field?: LessonField) => {
    const fields: LessonField[] = field ? [field] : (Object.keys(res) as LessonField[]);
    for (const f of fields) {
      const val = res[f];
      if (val === undefined) continue;
      if (f === "activities") {
        const items = (val as unknown[]).map((a) => {
          const act = a as Partial<Activity>;
          return {
            id: uid("act-"),
            title: String(act.title ?? ""),
            description: String(act.description ?? ""),
            duration: Number(act.duration ?? 10),
            type: (ACTIVITY_TYPES.includes(act.type as never)
              ? act.type
              : "group") as Activity["type"],
            teacherRole: String(act.teacherRole ?? "")
          };
        });
        patch({ activities: items });
      } else if (STRING_LIST_FIELDS.includes(f)) {
        patch({ [f]: Array.isArray(val) ? val.map(String) : [String(val)] } as never);
      } else {
        patch({ [f]: String(val) } as never);
      }
    }
  };

  const handleGenerateField = async (field: LessonField) => {
    if (!settings || !context) return;
    try {
      const res = await generateLessonContent(settings, context, [field]);
      applyResult(res, field);
      toast.success("Generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    }
  };

  const handleExport = async (kind: "pdf" | "docx") => {
    if (!draft || !subject) return;
    setExporting(kind);
    try {
      const meta = {
        school: profile?.school ?? "",
        teacher: profile?.name ?? "",
        subjectName: subject.name,
        academicYear: calendar?.academicYear ?? ""
      };
      if (kind === "pdf") await exportLessonPlanPDF(draft, meta);
      else await exportLessonPlanDocx(draft, meta);
      toast.success("Export ready");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(null);
    }
  };

  if (!loaded || !draft) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  const durationPresets = [
    { label: "45 min (single)", value: 45 },
    { label: "90 min (double)", value: 90 }
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl dark:text-slate-100">
            {draft.topic || "Lesson Plan"}
          </h1>
          <p className="text-sm text-slate-500">
            {subject?.name} · {draft.classLevel} · Week {draft.weekNumber} ·{" "}
            {draft.module || "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saving ? (
            <Badge variant="secondary">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </Badge>
          ) : savedAt ? (
            <Badge variant="success">Saved ✓</Badge>
          ) : (
            <Badge variant="outline">Not saved</Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={draft.date ?? ""}
              onChange={(e) => patch({ date: e.target.value || undefined })}
            />
          </div>
          <div>
            <Label>Duration</Label>
            <div className="flex gap-2">
              {durationPresets.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    patch({
                      duration: value,
                      periodType: value === 45 ? "single" : "double"
                    })
                  }
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-2 text-sm font-medium",
                    draft.duration === value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950"
                      : "border-slate-200 text-slate-600 dark:border-slate-700"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Number of periods</Label>
            <Input
              type="number"
              min={1}
              value={draft.numberOfPeriods}
              onChange={(e) => patch({ numberOfPeriods: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Topic</Label>
            <Input
              value={draft.topic}
              onChange={(e) => patch({ topic: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {context && (
        <Card className="bg-gradient-to-r from-fuchsia-50 to-indigo-50 dark:from-fuchsia-950/40 dark:to-indigo-950/40">
          <CardContent className="flex flex-wrap items-center gap-2 pt-4">
            <Button onClick={() => setAiOpen(true)}>
              <Wand2 className="h-4 w-4" /> Generate Full Lesson
            </Button>
            <span className="text-xs text-slate-500">
              Uses syllabus context to draft the whole plan. Requires internet and an API key.
            </span>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Previous Knowledge</CardTitle>
          {context && (
            <AIGenerateButton onGenerate={() => handleGenerateField("previousKnowledge")} />
          )}
        </CardHeader>
        <CardContent>
          <Textarea
            value={draft.previousKnowledge}
            onChange={(e) => patch({ previousKnowledge: e.target.value })}
            placeholder="What students should already know from earlier lessons..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Objectives</CardTitle>
          {context && (
            <AIGenerateButton onGenerate={() => handleGenerateField("objectives")} />
          )}
        </CardHeader>
        <CardContent>
          <StringListEditor
            value={draft.objectives}
            onChange={(objectives) => patch({ objectives })}
            placeholder="By the end of the lesson, the learner should be able to..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Introduction (5 min)</CardTitle>
          {context && (
            <AIGenerateButton onGenerate={() => handleGenerateField("introduction")} />
          )}
        </CardHeader>
        <CardContent>
          <Textarea
            value={draft.introduction}
            onChange={(e) => patch({ introduction: e.target.value })}
            placeholder="A hook, question, demonstration or story connected to daily life in Cameroon..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Activities</CardTitle>
          {context && (
            <AIGenerateButton onGenerate={() => handleGenerateField("activities")} />
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {draft.activities.map((activity, i) => (
            <div
              key={activity.id}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={activity.title}
                  onChange={(e) => {
                    const next = [...draft.activities];
                    next[i] = { ...activity, title: e.target.value };
                    patch({ activities: next });
                  }}
                  placeholder="Activity title"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={activity.duration}
                  onChange={(e) => {
                    const next = [...draft.activities];
                    next[i] = { ...activity, duration: Number(e.target.value) };
                    patch({ activities: next });
                  }}
                  className="w-20"
                  title="Duration (minutes)"
                />
                <button
                  type="button"
                  onClick={() =>
                    patch({ activities: draft.activities.filter((_, j) => j !== i) })
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove activity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Select
                className="mt-2"
                value={activity.type}
                onChange={(e) => {
                  const next = [...draft.activities];
                  next[i] = {
                    ...activity,
                    type: e.target.value as Activity["type"]
                  };
                  patch({ activities: next });
                }}
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
              <Textarea
                className="mt-2"
                value={activity.description}
                onChange={(e) => {
                  const next = [...draft.activities];
                  next[i] = { ...activity, description: e.target.value };
                  patch({ activities: next });
                }}
                placeholder="What learners do..."
              />
              <Input
                className="mt-2"
                value={activity.teacherRole}
                onChange={(e) => {
                  const next = [...draft.activities];
                  next[i] = { ...activity, teacherRole: e.target.value };
                  patch({ activities: next });
                }}
                placeholder="Teacher's role during this activity"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              patch({
                activities: [
                  ...draft.activities,
                  {
                    id: uid("act-"),
                    title: "",
                    description: "",
                    duration: 10,
                    type: "group",
                    teacherRole: ""
                  }
                ]
              })
            }
          >
            <Plus className="h-4 w-4" /> Add activity
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Materials</CardTitle>
          {context && (
            <AIGenerateButton onGenerate={() => handleGenerateField("materials")} />
          )}
        </CardHeader>
        <CardContent>
          <StringListEditor
            value={draft.materials}
            onChange={(materials) => patch({ materials })}
            placeholder="e.g., torch, string, ruler, empty bottles..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Lesson Notes</CardTitle>
          {context && (
            <AIGenerateButton onGenerate={() => handleGenerateField("lessonNotes")} />
          )}
        </CardHeader>
        <CardContent>
          <LessonNotesField
            value={draft.lessonNotes}
            onChange={(lessonNotes) => patch({ lessonNotes })}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Conclusion</CardTitle>
            {context && (
              <AIGenerateButton onGenerate={() => handleGenerateField("conclusion")} />
            )}
          </CardHeader>
          <CardContent>
            <Textarea
              value={draft.conclusion}
              onChange={(e) => patch({ conclusion: e.target.value })}
              placeholder="Key takeaway and link to the next lesson..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Homework</CardTitle>
            {context && (
              <AIGenerateButton onGenerate={() => handleGenerateField("homework")} />
            )}
          </CardHeader>
          <CardContent>
            <Textarea
              value={draft.homework}
              onChange={(e) => patch({ homework: e.target.value })}
              placeholder="Practical assignments doable without internet..."
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Evaluation Criteria</CardTitle>
          {context && (
            <AIGenerateButton
              onGenerate={() => handleGenerateField("evaluationCriteria")}
            />
          )}
        </CardHeader>
        <CardContent>
          <StringListEditor
            value={draft.evaluationCriteria}
            onChange={(evaluationCriteria) => patch({ evaluationCriteria })}
            placeholder="Observable evidence that the objectives were met..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cross-Cutting Competencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CROSS_CUTTING_COMPETENCIES.map((c) => {
              const active = draft.crossCuttingCompetencies.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    patch({
                      crossCuttingCompetencies: active
                        ? draft.crossCuttingCompetencies.filter((x) => x !== c)
                        : [...draft.crossCuttingCompetencies, c]
                    })
                  }
                  className={cn(
                    "min-h-[40px] rounded-full border px-3 py-1.5 text-sm font-medium",
                    active
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950"
                      : "border-slate-200 text-slate-600 dark:border-slate-700"
                  )}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Differentiation</CardTitle>
          {context && (
            <AIGenerateButton onGenerate={() => handleGenerateField("differentiation")} />
          )}
        </CardHeader>
        <CardContent>
          <Textarea
            value={draft.differentiation}
            onChange={(e) => patch({ differentiation: e.target.value })}
            placeholder="Adjustments for slower and faster learners..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusSelector
            value={draft.status}
            onChange={(status) => patch({ status })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teacher's Reflection (post-lesson)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={draft.teacherReflection}
            onChange={(e) => patch({ teacherReflection: e.target.value })}
            placeholder="What went well? What to improve?"
          />
          <Textarea
            value={draft.attendanceNote}
            onChange={(e) => patch({ attendanceNote: e.target.value })}
            placeholder="Attendance / context note (optional)"
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 pb-4">
        <Button variant="outline" onClick={() => handleExport("pdf")} disabled={!!exporting}>
          {exporting === "pdf" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          Export PDF
        </Button>
        <Button variant="outline" onClick={() => handleExport("docx")} disabled={!!exporting}>
          {exporting === "docx" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Export Word
        </Button>
      </div>

      {context && settings && (
        <AIPanel
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          settings={settings}
          context={context}
          onAccept={(res) => applyResult(res)}
        />
      )}
    </div>
  );
}
