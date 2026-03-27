import { create } from 'zustand';
import { prefGet, prefSet } from '../lib/storage';

export interface HiredRole {
  hireId: string;
  roleName: string;
  roleCategory: 'C-Suite' | 'Management' | 'Specialist';
  trustScore: number;
  trustBadge: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BASIC';
}

interface RoleStore {
  roles: HiredRole[];
  isLoaded: boolean;
  loadRoles: () => Promise<void>;
  setRoles: (roles: HiredRole[]) => void;
}

// Dev mode seed data - removed once real API is connected
const DEV_ROLES: HiredRole[] = [
  { hireId: 'hire-cmo-001', roleName: 'Chief Marketing Officer', roleCategory: 'C-Suite', trustScore: 94, trustBadge: 'PLATINUM' },
  { hireId: 'hire-dev-001', roleName: 'Full Stack Developer', roleCategory: 'Specialist', trustScore: 87, trustBadge: 'GOLD' },
];

export const useRoleStore = create<RoleStore>((set) => ({
  roles: [],
  isLoaded: false,
  loadRoles: async () => {
    const cached = await prefGet<HiredRole[]>('hired_roles');
    set({ roles: cached ?? (__DEV__ ? DEV_ROLES : []), isLoaded: true });
  },
  setRoles: (roles) => {
    set({ roles });
    prefSet('hired_roles', roles);
  },
}));
