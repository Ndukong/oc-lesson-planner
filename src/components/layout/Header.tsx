import { Menu, Wifi, WifiOff } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { useUIStore } from "@/stores/ui-store";
import { useCurrentWeek } from "@/hooks/useCurrentWeek";
import { TERM_NAMES } from "@/types";

export function Header() {
  const { online } = useAppStore();
  const { toggleSidebar } = useUIStore();
  const { week, sequence, term } = useCurrentWeek();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6 dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="hidden text-sm font-semibold text-slate-700 sm:inline dark:text-slate-200">
          Week {week} · Sequence {sequence} · {TERM_NAMES[term]}
        </span>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 sm:hidden dark:bg-indigo-950 dark:text-indigo-300">
          Wk {week}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          title={online ? "Online" : "Offline — AI features disabled"}
        >
          {online ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-green-600" />
              <span className="text-green-700">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-red-500" />
              <span className="text-red-600">Offline</span>
            </>
          )}
        </span>
      </div>
    </header>
  );
}
