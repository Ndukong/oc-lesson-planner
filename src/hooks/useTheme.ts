import { useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";

export function useTheme() {
  const theme = useUIStore((s) => s.theme);
  const fontScale = useUIStore((s) => s.fontScale);

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (theme === "dark" || (theme === "auto" && systemDark)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.style.fontSize = `${fontScale * 100}%`;
  }, [theme, fontScale]);
}
