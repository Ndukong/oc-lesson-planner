import { create } from "zustand";
import type { ClassLevel } from "@/types";

interface AppState {
  subjectId: string;
  classLevel: ClassLevel;
  selectedWeek: number;
  online: boolean;
  setSubject: (subjectId: string) => void;
  setClassLevel: (classLevel: ClassLevel) => void;
  setSelectedWeek: (week: number) => void;
  setOnline: (online: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  subjectId: "biology",
  classLevel: "Form 3",
  selectedWeek: 1,
  online: typeof navigator !== "undefined" ? navigator.onLine : true,
  setSubject: (subjectId) => set({ subjectId }),
  setClassLevel: (classLevel) => set({ classLevel }),
  setSelectedWeek: (selectedWeek) => set({ selectedWeek }),
  setOnline: (online) => set({ online })
}));
