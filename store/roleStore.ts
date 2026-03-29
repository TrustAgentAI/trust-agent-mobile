import { create } from 'zustand';
import { prefGet, prefSet } from '../lib/storage';
import { secureGet } from '../lib/storage';
import { apiFetch } from '../lib/api';

export interface HiredRole {
  hireId: string;
  roleName: string;
  roleCategory: 'C-Suite' | 'Management' | 'Specialist';
  trustScore: number;
  trustBadge: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BASIC';
  isTrial?: boolean;
  trialEndsAt?: string;
}

interface RoleStore {
  roles: HiredRole[];
  isLoaded: boolean;
  isRefreshing: boolean;
  loadRoles: () => Promise<void>;
  setRoles: (roles: HiredRole[]) => void;
}

export const useRoleStore = create<RoleStore>((set) => ({
  roles: [],
  isLoaded: false,
  isRefreshing: false,
  loadRoles: async () => {
    // Show cached roles immediately while fetching from API
    const cached = await prefGet<HiredRole[]>('hired_roles');
    if (cached && cached.length > 0) {
      set({ roles: cached, isLoaded: true });
    }

    // Fetch real roles from the API
    const token = await secureGet('auth_token');
    if (!token) {
      // No auth token - use cache only (user not logged in yet)
      set({ roles: cached ?? [], isLoaded: true });
      return;
    }

    set({ isRefreshing: true });
    try {
      const res = await apiFetch<{ data?: HiredRole[]; roles?: HiredRole[] }>(
        '/roles/hired',
        { method: 'GET' },
        token,
      );
      const roles = res.data ?? res.roles ?? (Array.isArray(res) ? res as unknown as HiredRole[] : []);
      set({ roles, isLoaded: true, isRefreshing: false });
      prefSet('hired_roles', roles);
    } catch (err) {
      console.warn('Failed to fetch hired roles from API, using cache:', err);
      // Fall back to cached data on network error
      set({ roles: cached ?? [], isLoaded: true, isRefreshing: false });
    }
  },
  setRoles: (roles) => {
    set({ roles });
    prefSet('hired_roles', roles);
  },
}));
