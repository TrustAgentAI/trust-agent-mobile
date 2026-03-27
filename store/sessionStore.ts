import { create } from 'zustand';

interface SessionStore {
  activeHireId: string | null;
  setActiveRole: (hireId: string | null) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  activeHireId: null,
  setActiveRole: (hireId) => set({ activeHireId: hireId }),
}));
