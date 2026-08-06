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

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  aiPanelOpen: false,
  aiPanelField: null,
  theme: "light",
  fontScale: 1,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setAIPanel: (aiPanelOpen, aiPanelField = null) =>
    set({ aiPanelOpen, aiPanelField }),
  setTheme: (theme) => set({ theme }),
  setFontScale: (fontScale) => set({ fontScale })
}));
