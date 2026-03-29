import { create } from 'zustand';
import type { UserProfile } from '../lib/auth';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userId: string, user: UserProfile) => void;
  setSession: (token: string, refreshToken: string, user: UserProfile) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  userId: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (token, userId, user) =>
    set({ token, userId, user, isAuthenticated: true, isLoading: false }),
  setSession: (token, refreshToken, user) =>
    set({ token, refreshToken, userId: user.userId, user, isAuthenticated: true, isLoading: false }),
  logout: () =>
    set({ token: null, refreshToken: null, userId: null, user: null, isAuthenticated: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
