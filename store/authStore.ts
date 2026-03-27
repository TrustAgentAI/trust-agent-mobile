import { create } from 'zustand';

interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userId: string) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  login: (token, userId) => set({ token, userId, isAuthenticated: true, isLoading: false }),
  logout: () => set({ token: null, userId: null, isAuthenticated: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
