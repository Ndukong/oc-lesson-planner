import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Download, QrCode, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useCalendar,
  useProgression,
  useSubject,
  useSubjects,
  useSyllabusModules,
  useTeacherProfile
} from "@/db/hooks";
import { useAppStore } from "@/stores/app-store";
import { exportSubjectTemplate } from "@/services/sharing/export-template";
import { importSubjectTemplate } from "@/services/sharing/import-template";
import QRCode from "qrcode";

export function SharingPage() {
  const { subjectId } = useAppStore();
  const subject = useSubject(subjectId);
  const modules = useSyllabusModules(subjectId);
  const progression = useProgression(subjectId);
  const calendar = useCalendar();
  const profile = useTeacherProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  const [importing, setImporting] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [qrData, setQrData] = useState<string>("");

  const allModules = modules ?? [];
  const allProgression = progression ?? [];

  const handleExport = async () => {
    if (!subject) return;
    try {
      await exportSubjectTemplate(
        subject,
        allModules,
        allProgression,
        calendar!,
        profile?.name ?? "Teacher"
      );
      toast.success("Subject template exported");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const res = await importSubjectTemplate(file);
      if (res.ok) {
        toast.success(`Imported "${res.subjectName}"`);
      } else {
        toast.error(res.message);
      }
    } finally {
      setImporting(false);
    }
  };

  const showQR = async () => {
    if (!qrUrl) {
      toast.error("Enter a URL to encode first.");
      return;
    }
    try {
      const dataUrl = await QRCode.toDataURL(qrUrl, { width: 320, margin: 2 });
      setQrData(dataUrl);
      setQrOpen(true);
    } catch {
      toast.error("Could not generate QR code.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Subject Sharing Hub
        </h1>
        <p className="text-sm text-slate-500">
          Share your subject (syllabus + progression + calendar) with colleagues
          via WhatsApp or email.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-4 w-4 text-indigo-600" /> Export Subject
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Package <strong>{subject?.name ?? "…"}</strong> into a single JSON
              file containing the full syllabus, progression and calendar. Your
              colleague imports it and is ready to plan immediately.
            </p>
            <Button onClick={handleExport} disabled={!subject}>
              <Download className="h-4 w-4" /> Export {subject?.name} Template
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-indigo-600" /> Import Subject
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Load a subject template JSON file received from a colleague.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImport(f);
                e.target.value = "";
              }}
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={importing}
            >
              <Upload className="h-4 w-4" />
              {importing ? "Importing…" : "Choose template file"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" /> Template Catalog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(useSubjects() ?? []).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {s.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Pre-loaded · {s.classLevels.join(", ")}
                  </p>
                </div>
                <Badge variant="success">Installed</Badge>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Share this app's template files with colleagues via WhatsApp. They
            open the app, tap Import, and select the file. Add more subjects
            from the template catalog when available.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-indigo-600" /> QR Code for Sharing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Generate a QR code linking to a hosted template download (e.g., a
            link you host, or a shared drive). Colleagues scan it on their
            phone to grab the template.
          </p>
          <div className="flex gap-2">
            <Input
              value={qrUrl}
              onChange={(e) => setQrUrl(e.target.value)}
              placeholder="https://example.com/subject-template.json"
            />
            <Button variant="outline" onClick={showQR}>
              <QrCode className="h-4 w-4" /> Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} title="Scan to download">
        <div className="flex flex-col items-center gap-3">
          {qrData && <img src={qrData} alt="QR code" className="h-64 w-64" />}
          <p className="text-sm text-slate-500">{qrUrl}</p>
        </div>
      </Dialog>
    </div>
  );
}
