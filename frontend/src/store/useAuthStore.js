import { create } from 'zustand';
import { api } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,

  clearError: () => set({ error: null }),

  checkAuth: async () => {
    set({ isInitializing: true });
    if (typeof window === 'undefined') {
      set({ isInitializing: false });
      return;
    }

    const token = localStorage.getItem('projectforge_token');
    if (!token) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitializing: false,
      });
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response && response.success && response.data) {
        set({
          user: response.data.user,
          token,
          isAuthenticated: true,
          isInitializing: false,
          error: null,
        });
      } else {
        localStorage.removeItem('projectforge_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitializing: false,
        });
      }
    } catch (err) {
      localStorage.removeItem('projectforge_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },

  register: async ({ name, email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response && response.success && response.data) {
        const { user, token } = response.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('projectforge_token', token);
        }
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.message || 'Registration failed. Please try again.';
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response && response.success && response.data) {
        const { user, token } = response.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('projectforge_token', token);
        }
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.message || 'Invalid email or password.';
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors during logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('projectforge_token');
      }
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
}));
