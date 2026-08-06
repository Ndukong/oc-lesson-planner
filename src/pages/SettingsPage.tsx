import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, Loader2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import {
  clearAllData,
  saveAISettings,
  saveTeacherProfile,
  useAISettings,
  useCalendar,
  useTeacherProfile
} from "@/db/hooks";
import { db } from "@/db/database";
import { testAIProvider } from "@/services/ai";
import { useUIStore } from "@/stores/ui-store";
import { GEMINI_DEFAULT_MODEL } from "@/services/ai/gemini";
import { GROQ_DEFAULT_MODEL } from "@/services/ai/groq";
import { toDateInputValue, downloadText } from "@/utils/format";
import { APP_VERSION } from "@/types";
import type { AISettings, TeacherProfile } from "@/types";
import { cn } from "@/utils/cn";

const MODEL_OPTIONS = [
  { provider: "gemini", value: GEMINI_DEFAULT_MODEL, label: "Gemini 2.0 Flash (free tier)" },
  { provider: "gemini", value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { provider: "groq", value: GROQ_DEFAULT_MODEL, label: "Llama 3.3 70B Versatile (free tier)" },
  { provider: "groq", value: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant" }
];

export function SettingsPage() {
  const profile = useTeacherProfile();
  const settings = useAISettings();
  const calendar = useCalendar();
  const { theme, fontScale, setTheme, setFontScale } = useUIStore();

  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [region, setRegion] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [provider, setProvider] = useState<AISettings["preferredProvider"]>("gemini");
  const [model, setModel] = useState(GEMINI_DEFAULT_MODEL);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setSchool(profile.school ?? "");
      setRegion(profile.region ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (settings) {
      setGeminiKey(settings.geminiApiKey ?? "");
      setGroqKey(settings.groqApiKey ?? "");
      setProvider(settings.preferredProvider ?? "gemini");
      setModel(settings.modelPreference ?? GEMINI_DEFAULT_MODEL);
      setAutoGenerate(settings.autoGenerate ?? false);
    }
  }, [settings]);

  useEffect(() => {
    if (calendar) setStartDate(toDateInputValue(calendar.startDate));
  }, [calendar]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.style.fontSize = `${fontScale * 100}%`;
  }, [theme, fontScale]);

  const saveProfile = async () => {
    const p: TeacherProfile = {
      id: profile?.id ?? "teacher",
      name,
      school,
      region,
      subjects: profile?.subjects ?? ["physics"],
      defaultClassLevels: profile?.defaultClassLevels ?? ["Form 3"],
      onboarded: true
    };
    await saveTeacherProfile(p);
    toast.success("Profile saved");
  };

  const saveAi = async () => {
    if (!settings) return;
    await saveAISettings({
      ...settings,
      geminiApiKey: geminiKey || undefined,
      groqApiKey: groqKey || undefined,
      preferredProvider: provider,
      modelPreference: model,
      autoGenerate
    });
    toast.success("AI settings saved");
  };

  const runTest = async () => {
    if (!settings) return;
    setTesting(true);
    setTestResult(null);
    const res = await testAIProvider({ ...settings, geminiApiKey: geminiKey, groqApiKey: groqKey, preferredProvider: provider, modelPreference: model });
    setTestResult(res);
    setTesting(false);
  };

  const saveCalendarDate = async () => {
    if (!calendar) return;
    const newDate = startDate ? new Date(startDate + "T00:00:00") : calendar.startDate;
    await db.schoolCalendars.update(calendar.id, { startDate: newDate });
    toast.success("Academic year start date updated");
  };

  const exportBackup = async () => {
    const backup = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      subjects: await db.subjects.toArray(),
      syllabusModules: await db.syllabusModules.toArray(),
      progressionEntries: await db.progressionEntries.toArray(),
      schoolCalendars: await db.schoolCalendars.toArray(),
      lessonPlans: await db.lessonPlans.toArray(),
      aiSettings: await db.aiSettings.toArray(),
      teacherProfile: await db.teacherProfile.toArray()
    };
    downloadText(JSON.stringify(backup, null, 2), `lesson-planner-backup-${new Date().toISOString().slice(0, 10)}.json`);
    toast.success("Backup downloaded");
  };

  const importBackup = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.subjects)) throw new Error("Not a backup file");
      await Promise.all([
        db.subjects.bulkPut(data.subjects),
        db.syllabusModules.bulkPut(data.syllabusModules ?? []),
        db.progressionEntries.bulkPut(data.progressionEntries ?? []),
        db.schoolCalendars.bulkPut(data.schoolCalendars ?? []),
        db.lessonPlans.bulkPut(data.lessonPlans ?? []),
        db.aiSettings.bulkPut(data.aiSettings ?? []),
        db.teacherProfile.bulkPut(data.teacherProfile ?? [])
      ]);
      toast.success("Backup restored — restart the app");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    }
  };

  const handleClearAll = async () => {
    await clearAllData();
    toast.success("All data cleared — restart the app to reseed");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Teacher name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Mrs. Ngo Buma" /></div>
          <div><Label>School</Label><Input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="e.g., GHS Buea" /></div>
          <div><Label>Region</Label><Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g., South West" /></div>
          <Button onClick={saveProfile}>Save Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>AI Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-500">
            Your API keys are stored only on this device (IndexedDB) and are
            sent only to the AI provider when you generate. Get free keys from{" "}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-indigo-600">Google AI Studio</a>{" "}
            or{" "}
            <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-indigo-600">Groq</a>.
          </p>
          <div><Label>Gemini API key</Label><Input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="AIza..." /></div>
          <div><Label>Groq API key</Label><Input type="password" value={groqKey} onChange={(e) => setGroqKey(e.target.value)} placeholder="gsk_..." /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Preferred provider</Label>
              <Select value={provider} onChange={(e) => { setProvider(e.target.value as never); setModel(e.target.value === "gemini" ? GEMINI_DEFAULT_MODEL : GROQ_DEFAULT_MODEL); }}>
                <option value="gemini">Gemini</option>
                <option value="groq">Groq</option>
              </Select>
            </div>
            <div>
              <Label>Model</Label>
              <Select value={model} onChange={(e) => setModel(e.target.value)}>
                {MODEL_OPTIONS.filter((m) => m.provider === provider).map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={autoGenerate} onChange={(e) => setAutoGenerate(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
            Auto-generate full lessons when creating a plan
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={saveAi}>Save AI Settings</Button>
            <Button variant="outline" onClick={runTest} disabled={testing}>
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Test Connection
            </Button>
          </div>
          {testResult && (
            <p className={cn("rounded-lg p-3 text-sm", testResult.ok ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200" : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300")}>
              {testResult.ok ? <CheckCircle2 className="mr-1 inline h-4 w-4" /> : <AlertTriangle className="mr-1 inline h-4 w-4" />}
              {testResult.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Calendar</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-500">Adjust the academic year start date. Week, term and sequence boundaries follow the national structure.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Academic year</Label><Input value={calendar?.academicYear ?? ""} readOnly /></div>
            <div><Label>Start date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
          </div>
          <Button variant="outline" onClick={saveCalendarDate}>Save Calendar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Display</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Theme</Label>
            <div className="flex gap-2">
              {(["light", "dark", "auto"] as const).map((t) => (
                <button key={t} onClick={() => setTheme(t)} className={cn("min-h-[40px] flex-1 rounded-lg border px-3 text-sm font-medium", theme === t ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300")}>
                  {t === "light" ? <Sun className="mr-1 inline h-4 w-4" /> : t === "dark" ? <Moon className="mr-1 inline h-4 w-4" /> : "Auto"}
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Font size: {fontScale.toFixed(2)}×</Label>
            <input type="range" min={0.85} max={1.3} step={0.05} value={fontScale} onChange={(e) => setFontScale(Number(e.target.value))} className="w-full accent-indigo-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Data</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportBackup}>Export All Data (Backup)</Button>
            <Button variant="outline" onClick={() => document.getElementById("backup-file")?.click()}>Import Backup</Button>
            <input id="backup-file" type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importBackup(f); e.target.value = ""; }} />
          </div>
          <Button variant="destructive" onClick={handleClearAll}>
            <AlertTriangle className="h-4 w-4" /> Clear All Data
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>About</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <p>Lesson Planner v{APP_VERSION}</p>
          <p>Offline-first PWA for Cameroonian secondary school teachers.</p>
          <p>Follows the MINESEC Competence-Based Approach (CBA).</p>
        </CardContent>
      </Card>
    </div>
  );
}
