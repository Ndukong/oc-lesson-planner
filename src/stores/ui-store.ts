import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  aiPanelOpen: boolean;
  aiPanelField: string | null;
  theme: "light" | "dark" | "auto";
  fontScale: number;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setAIPanel: (open: boolean, field?: string | null) => void;
  setTheme: (theme: "light" | "dark" | "auto") => void;
  setFontScale: (scale: number) => void;
}

function loadTheme(): "light" | "dark" | "auto" {
  if (typeof localStorage === "undefined") return "light";
  const saved = localStorage.getItem("ui:theme");
  return saved === "light" || saved === "dark" || saved === "auto" ? saved : "light";
}

function loadFontScale(): number {
  if (typeof localStorage === "undefined") return 1;
  const saved = Number(localStorage.getItem("ui:fontScale"));
  return Number.isFinite(saved) && saved > 0 ? saved : 1;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  aiPanelOpen: false,
  aiPanelField: null,
  theme: loadTheme(),
  fontScale: loadFontScale(),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setAIPanel: (aiPanelOpen, aiPanelField = null) =>
    set({ aiPanelOpen, aiPanelField }),
  setTheme: (theme) => {
    localStorage.setItem("ui:theme", theme);
    set({ theme });
  },
  setFontScale: (fontScale) => {
    localStorage.setItem("ui:fontScale", String(fontScale));
    set({ fontScale });
  }
}));
