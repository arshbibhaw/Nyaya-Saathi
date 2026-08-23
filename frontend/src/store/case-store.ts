import { create } from "zustand";
import type { Case } from "@/lib/types";
import { fetchCases, createCase as apiCreateCase, getCase } from "@/lib/api";

interface CaseState {
  cases: Case[];
  activeCase: Case | null;
  isLoading: boolean;
  error: string | null;

  fetchCases: () => Promise<void>;
  createCase: (issue: string, location?: string) => Promise<Case>;
  setActiveCase: (c: Case | null) => void;
  loadCase: (caseId: string) => Promise<void>;
}

export const useCaseStore = create<CaseState>()((set, get) => ({
  cases: [],
  activeCase: null,
  isLoading: false,
  error: null,

  fetchCases: async () => {
    set({ isLoading: true, error: null });
    try {
      const cases = await fetchCases();
      set({ cases, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch cases",
      });
    }
  },

  createCase: async (issue: string, location?: string) => {
    set({ isLoading: true, error: null });
    try {
      const newCase = await apiCreateCase(issue, location);
      set((state) => ({
        cases: [newCase, ...state.cases],
        activeCase: newCase,
        isLoading: false,
      }));
      return newCase;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to create case",
      });
      throw err;
    }
  },

  setActiveCase: (c) => set({ activeCase: c }),

  loadCase: async (caseId: string) => {
    // Check if we already have it
    const existing = get().cases.find((c) => c.id === caseId);
    if (existing) {
      set({ activeCase: existing });
      return;
    }
    set({ isLoading: true });
    try {
      const c = await getCase(caseId);
      set({ activeCase: c, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load case",
      });
    }
  },
}));
