import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProgressionPage } from "@/pages/ProgressionPage";
import { initializeDatabase } from "@/db/seed";
import { db } from "@/db/database";
import { useTheme } from "@/hooks/useTheme";
import type { TeacherProfile } from "@/types";

const LessonPlanEditor = lazy(() =>
  import("@/components/lesson-plan/LessonPlanEditor").then((m) => ({ default: m.LessonPlanEditor }))
);
const SyllabusPage = lazy(() =>
  import("@/pages/SyllabusPage").then((m) => ({ default: m.SyllabusPage }))
);
const ProgressPage = lazy(() =>
  import("@/pages/ProgressPage").then((m) => ({ default: m.ProgressPage }))
);
const ExportPage = lazy(() =>
  import("@/pages/ExportPage").then((m) => ({ default: m.ExportPage }))
);
const SharingPage = lazy(() =>
  import("@/pages/SharingPage").then((m) => ({ default: m.SharingPage }))
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);
const OnboardingPage = lazy(() =>
  import("@/pages/OnboardingPage").then((m) => ({ default: m.OnboardingPage }))
);

function PageSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
    </div>
  );
}

const dbReady: Promise<{ ok: boolean; error?: unknown }> = initializeDatabase().then(
  () => ({ ok: true }),
  (err) => {
    console.error("[LessonPlanner] Database init failed:", err);
    return { ok: false, error: err };
  }
);

function DbErrorScreen({ error }: { error: unknown }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900 dark:bg-amber-950">
        <h1 className="text-lg font-bold text-amber-900 dark:text-amber-200">
          Could not start the app
        </h1>
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
          The local lesson database failed to open. Try reloading; if the
          problem persists, the browser storage may be full or blocked.
        </p>
        <pre className="mt-3 max-h-28 overflow-auto rounded-lg bg-white/70 p-2 text-left text-xs text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
          {error instanceof Error ? error.message : String(error)}
        </pre>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 min-h-[44px] rounded-lg bg-amber-600 px-5 text-sm font-medium text-white hover:bg-amber-700"
        >
          Reload app
        </button>
      </div>
    </div>
  );
}

function RequireProfile({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<TeacherProfile | null | undefined>(
    undefined
  );
  const [initError, setInitError] = useState<unknown | null>(null);

  useEffect(() => {
    let cancelled = false;
    dbReady.then(async (result) => {
      if (cancelled) return;
      if (!result.ok) {
        setInitError(result.error);
        return;
      }
      const p = await db.teacherProfile.limit(1).first();
      if (!cancelled) setProfile(p ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (initError) return <DbErrorScreen error={initError} />;

  if (profile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!profile || !profile.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  useTheme();
  // Keep the router in sync with Vite's base URL ("/" on Netlify, or a
  // sub-path when VITE_BASE_PATH is set for other hosts).
  const basename = import.meta.env.BASE_URL.replace(/\/+$/, "") || "/";
  return (
    <ErrorBoundary>
      <BrowserRouter basename={basename}>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            <Route
              path="/onboarding"
              element={<OnboardingPage />}
            />
            <Route
              path="/"
              element={
                <RequireProfile>
                  <AppShell />
                </RequireProfile>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="progression" element={<ProgressionPage />} />
              <Route path="syllabus" element={<SyllabusPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="export" element={<ExportPage />} />
              <Route path="sharing" element={<SharingPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="lesson-plan/:subjectId/:classLevel/:weekNumber" element={<LessonPlanEditor />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster
          position="bottom-center"
          toastOptions={{
            className: "text-sm max-w-[85vw]"
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
