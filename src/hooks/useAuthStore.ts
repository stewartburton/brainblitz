// ============================================================
// Frenchie Trivia — Auth Store (Zustand)
// Handles anonymous device auth + Firebase upgrade path
// ============================================================

import { create } from 'zustand';
import { User, AuthProvider } from '@/types';
import { generateDisplayName } from '@/utils/generateUsername';
import { FRENCHIE_AVATARS } from '@/utils/constants';

// Note: In production, use expo-secure-store for token storage
// and expo-constants for device ID. These are stubbed for now.

function generateDeviceId(): string {
  return 'dev_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initAuth: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  updateAvatar: (avatarId: string) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initAuth: async () => {
    set({ isLoading: true });
    try {
      // TODO: Check SecureStore for existing token
      // For now, auto-login as guest on first launch
      const state = get();
      if (!state.user) {
        await state.loginAsGuest();
      }
    } catch (err) {
      set({ error: 'Failed to initialize auth' });
    } finally {
      set({ isLoading: false });
    }
  },

  loginAsGuest: async () => {
    set({ isLoading: true, error: null });
    try {
      const deviceId = generateDeviceId();
      const displayName = generateDisplayName();
      const avatarId = FRENCHIE_AVATARS[Math.floor(Math.random() * FRENCHIE_AVATARS.length)].id;

      // TODO: Call POST /auth/guest on the Workers API
      // For now, create a local guest user
      const guestUser: User = {
        id: `user_${Math.random().toString(36).substr(2, 12)}`,
        deviceId,
        displayName,
        avatarId,
        authProvider: 'anonymous',
        level: 1,
        totalXp: 0,
        totalGames: 0,
        totalCorrect: 0,
        totalScore: 0,
        bestGameScore: 0,
        bestStreak: 0,
        isPremium: false,
        createdAt: new Date().toISOString(),
      };

      // TODO: Store token in SecureStore
      const mockToken = `guest_${deviceId}_${Date.now()}`;

      set({
        user: guestUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ error: 'Failed to create guest account', isLoading: false });
    }
  },

  loginWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Firebase signInWithEmailAndPassword
      // Then call POST /auth/firebase with the Firebase ID token
      // For now, stub
      set({ error: 'Email login not yet implemented', isLoading: false });
    } catch (err) {
      set({ error: 'Login failed', isLoading: false });
    }
  },

  register: async (email: string, password: string, displayName?: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Firebase createUserWithEmailAndPassword
      // Then upgrade the guest account on the backend
      set({ error: 'Registration not yet implemented', isLoading: false });
    } catch (err) {
      set({ error: 'Registration failed', isLoading: false });
    }
  },

  updateDisplayName: async (name: string) => {
    const state = get();
    if (!state.user) return;
    // TODO: Call PATCH /profile on Workers API
    set({ user: { ...state.user, displayName: name } });
  },

  updateAvatar: (avatarId: string) => {
    const state = get();
    if (!state.user) return;
    set({ user: { ...state.user, avatarId } });
  },

  logout: () => {
    // TODO: Clear SecureStore, Firebase signOut
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
