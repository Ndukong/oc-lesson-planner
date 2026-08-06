import { NavLink } from "react-router-dom";
import { CalendarRange, FileDown, Home, Settings, Share2 } from "lucide-react";
import { cn } from "@/utils/cn";

const TABS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/progression", label: "Progression", icon: CalendarRange },
  { to: "/sharing", label: "Share", icon: Share2 },
  { to: "/export", label: "Export", icon: FileDown },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden dark:border-slate-800 dark:bg-slate-900">
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
              isActive
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-500 dark:text-slate-400"
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
