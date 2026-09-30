import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useCalendar,
  useLessonPlans,
  useProgression,
  useSubject,
  useTeacherProfile
} from "@/db/hooks";
import { useAppStore } from "@/stores/app-store";
import { exportLessonsBatchPDF } from "@/services/export/pdf";
import { exportLessonPlansBatchDocx } from "@/services/export/docx";
import { STATUS_COLORS, STATUS_LABELS, TERM_NAMES } from "@/types";
import type { LessonPlan, Term } from "@/types";
import { cn } from "@/utils/cn";

type RangeMode = "all" | "term";

export function ExportPage() {
  const { subjectId, classLevel, setClassLevel } = useAppStore();
  const subject = useSubject(subjectId);
  const progression = useProgression(subjectId, classLevel);
  const plans = useLessonPlans(subjectId, classLevel);
  const calendar = useCalendar();
  const profile = useTeacherProfile();

  const [rangeMode, setRangeMode] = useState<RangeMode>("all");
  const [term, setTerm] = useState<Term>(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  const lessonNumbers = useMemo(() => {
    const rows = progression ?? [];
    if (rangeMode === "all") return rows.map((e) => e.lessonNumber);
    return rows.filter((e) => e.term === term).map((e) => e.lessonNumber);
  }, [progression, rangeMode, term]);

  const inRange = useMemo(() => {
    const set = new Set(lessonNumbers);
    return (p: LessonPlan) => set.has((p as unknown as { lessonNumber: number }).lessonNumber ?? p.weekNumber);
  }, [lessonNumbers]);

  const availablePlans: LessonPlan[] = useMemo(() => (plans ?? []).filter(inRange), [plans, inRange]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const meta = {
    school: profile?.school ?? "",
    teacher: profile?.name ?? "",
    subjectName: subject?.name ?? "",
    academicYear: calendar?.academicYear ?? ""
  };

  const handleBatchExport = async (kind: "pdf" | "docx") => {
    const chosen =
      selected.size > 0
        ? availablePlans.filter((p) => selected.has(p.id))
        : availablePlans;
    if (!chosen.length) {
      toast.error("No lesson plans in this range to export.");
      return;
    }
    setExporting(true);
    try {
      if (kind === "pdf") await exportLessonsBatchPDF(chosen, meta);
      else await exportLessonPlansBatchDocx(chosen, meta);
      toast.success(`Exported ${chosen.length} lesson plan${chosen.length > 1 ? "s" : ""}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Export Center
        </h1>
        <p className="text-sm text-slate-500">
          Export print-ready PDFs or editable Word documents for your HOD or inspectors.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Subject</Label>
              <Select value={subjectId} disabled>
                <option value={subjectId}>{subject?.name}</option>
              </Select>
            </div>
            <div>
              <Label>Class Level</Label>
              <Select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value as never)}
              >
                {subject?.classLevels.map((cl) => (
                  <option key={cl} value={cl}>{cl}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>Range</Label>
            <div className="flex flex-wrap gap-2">
              {([["all", "All lessons"], ["term", "By term"]] as [RangeMode, string][]).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setRangeMode(mode)}
                  className={cn("min-h-[40px] rounded-lg border px-4 text-sm font-medium", rangeMode === mode ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {rangeMode === "term" && (
            <div>
              <Label>Term</Label>
              <Select value={term} onChange={(e) => setTerm(Number(e.target.value) as Term)}>
                {[1, 2, 3].map((t) => (<option key={t} value={t}>{TERM_NAMES[t as Term]}</option>))}
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Lessons in Range</CardTitle>
          <Badge variant="secondary">{availablePlans.length} planned</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {availablePlans.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No lesson plans exist in this range yet. Open a week from the
              Progression grid to create one.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {availablePlans.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                      className="h-4 w-4 accent-indigo-600"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">L{(p as unknown as { lessonNumber: number }).lessonNumber ?? p.weekNumber}: {p.topic}</p>
                      <p className="truncate text-xs text-slate-500">{p.module} · {(p as unknown as { weekPeriod: string }).weekPeriod ?? ""} · {p.duration} min</p>
                    </div>
                    <Badge className={STATUS_COLORS[p.status]}>
                      {STATUS_LABELS[p.status]}
                    </Badge>
                  </label>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={() => handleBatchExport("pdf")} disabled={exporting}>
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                  Export as PDF
                </Button>
                <Button variant="outline" onClick={() => handleBatchExport("docx")} disabled={exporting}>
                  Export as Word (.docx)
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
