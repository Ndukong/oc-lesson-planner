import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpen, GraduationCap, Rocket, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { saveTeacherProfile } from "@/db/hooks";
import { importSubjectTemplate } from "@/services/sharing/import-template";

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [region, setRegion] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const finish = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      await saveTeacherProfile({
        id: "teacher",
        name: name.trim() || "Teacher",
        school: school.trim(),
        region: region.trim(),
        subjects: ["biology"],
        defaultClassLevels: ["Form 3"],
        onboarded: true
      });
      toast.success("Welcome! Start planning your lessons.");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error saving profile");
    }
  };

  const handleImport = async (file: File) => {
    const res = await importSubjectTemplate(file);
    if (res.ok) toast.success(`Imported "${res.subjectName}"`);
    else toast.error(res.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 px-4 py-10 dark:from-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <GraduationCap className="h-9 w-9" />
          </span>
        </div>

        {step === 0 && (
          <Card>
            <CardContent className="space-y-4 pt-6 text-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Welcome to Lesson Planner
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Plan CBA-aligned lessons offline. Works on your phone, in the
                classroom, with no internet. AI-powered when you're online.
              </p>
              <p className="text-xs text-slate-500">
                Built for Cameroonian secondary school teachers following
                MINESEC syllabi.
              </p>
              <Button onClick={() => setStep(1)} className="w-full">
                <Rocket className="h-4 w-4" /> Get Started
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-center text-lg font-bold text-slate-900 dark:text-slate-100">
                Your Profile
              </h2>
              <form onSubmit={finish} className="space-y-3">
                <div>
                  <Label>Your name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Ndukong Emmanuel Ngeh" autoFocus />
                </div>
                <div>
                  <Label>School</Label>
                  <Input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="e.g., Government High School Dumbu" />
                </div>
                <div>
                  <Label>Region</Label>
                  <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g., North-West" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                    Skip
                  </Button>
                  <Button type="submit" className="flex-1">
                    Continue
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-center text-lg font-bold text-slate-900 dark:text-slate-100">
                Subjects
              </h2>
              <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                The following national syllabuses (Form 1 to Form 5) are already
                loaded: <strong>Biology, Human Biology, Chemistry, Citizenship
                Education, Computer Science, Economics, Geography, Geology,
                History, Literature in English, Mathematics and Physics.</strong>{" "}
                Lower and Upper Sixth classes can be planned freely — open the
                Progression grid and tap any week. Import more subjects from
                colleagues.
              </p>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                <BookOpen className="mr-1 inline h-4 w-4" /> 12 subjects —
                pre-installed and ready to go.
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImport(f);
                  e.target.value = "";
                }}
              />
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" /> Import a Subject Template
              </Button>
              <Button onClick={finish} className="w-full">
                Start Planning
              </Button>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-slate-400">
          All data is stored locally on your device. No account required.
        </p>
      </div>
    </div>
  );
}
