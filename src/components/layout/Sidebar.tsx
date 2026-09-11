import { useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  CalendarRange,
  FileDown,
  GraduationCap,
  Home,
  Settings,
  Share2,
  TrendingUp,
  X
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAppStore } from "@/stores/app-store";
import { useUIStore } from "@/stores/ui-store";
import { useSubjects } from "@/db/hooks";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: Home, end: true },
  { to: "/progression", label: "Progression", icon: CalendarRange },
  { to: "/syllabus", label: "Syllabus", icon: BookOpen },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/export", label: "Export", icon: FileDown },
  { to: "/sharing", label: "Sharing", icon: Share2 },
  { to: "/settings", label: "Settings", icon: Settings }
];

function SubjectClassControls() {
  const subjects = useSubjects();
  const { subjectId, classLevel, setSubject, setClassLevel } = useAppStore();

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Subject</label>
        <select
          value={subjectId}
          onChange={(e) => {
            const next = e.target.value;
            setSubject(next);
            const levels = (subjects ?? []).find((s) => s.id === next)?.classLevels;
            if (levels && !levels.includes(classLevel)) setClassLevel(levels[0]);
          }}
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          aria-label="Subject"
        >
          {(subjects ?? []).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Class Level</label>
        <select
          value={classLevel}
          onChange={(e) => setClassLevel(e.target.value as never)}
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          aria-label="Class Level"
        >
          {(subjects ?? [])
            .find((s) => s.id === subjectId)
            ?.classLevels.map((cl) => (
              <option key={cl} value={cl}>{cl}</option>
            ))}
        </select>
      </div>
    </div>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <GraduationCap className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Lesson Planner</p>
            <p className="text-xs text-slate-500">MINESEC · CBA</p>
          </div>
        </Link>
        {onNavigate && (
          <button
            onClick={onNavigate}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <SubjectClassControls />
      </div>
    </>
  );
}

function MobileSidebar() {
  const open = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const location = useLocation();

  // Close the drawer whenever the route changes (not when `open` changes —
  // that would immediately re-close the drawer as soon as it is toggled open).
  const pathname = location.pathname;
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setSidebarOpen]);

  return (
    <div
      className={cn("fixed inset-0 z-50 md:hidden", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "absolute inset-0 bg-slate-900/50 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        role="dialog"
        aria-label="Menu"
        className={cn(
          "absolute inset-y-0 left-0 flex w-[300px] max-w-[85vw] flex-col bg-white shadow-xl transition-transform duration-200 dark:bg-slate-900",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarBody onNavigate={() => setSidebarOpen(false)} />
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex dark:border-slate-800 dark:bg-slate-900">
        <SidebarBody />
      </aside>
      <MobileSidebar />
    </>
  );
}
