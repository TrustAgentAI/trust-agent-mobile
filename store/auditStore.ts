import { create } from 'zustand';

export interface AuditEvent {
  id: string;
  hireId: string;
  action: 'READ' | 'WRITE' | 'API_CALL' | 'TOOL_USE' | 'MESSAGE' | 'ERROR';
  description: string;
  timestamp: number;
}

interface AuditStore {
  events: AuditEvent[];
  addEvent: (event: AuditEvent) => void;
  clearEvents: () => void;
}

export const useAuditStore = create<AuditStore>((set) => ({
  events: [],
  addEvent: (event) => set((s) => ({
    events: [...s.events.slice(-499), event], // keep last 500
  })),
  clearEvents: () => set({ events: [] }),
}));
