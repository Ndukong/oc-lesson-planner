import { cn } from "@/utils/cn";

export function Progress({
  value,
  className
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700",
        className
      )}
      role="progressbar"
      aria-valuenow={pct}
    >
      <div
        className="h-full rounded-full bg-indigo-600 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
