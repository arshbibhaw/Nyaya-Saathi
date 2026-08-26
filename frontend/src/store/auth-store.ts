import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserOut } from "@/lib/types";
import { loginUser, registerUser, fetchProfile, updateProfile } from "@/lib/api";

interface AuthState {
  user: UserOut | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    full_name: string,
  ) => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { username?: string; full_name?: string; state?: string; city?: string; address?: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isHydrated: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await loginUser(email, password);
          localStorage.setItem("token", res.access_token);
          set({
            user: res.user,
            token: res.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Login failed",
          });
          throw err;
        }
      },

      register: async (email, password, username, full_name) => {
        set({ isLoading: true, error: null });
        try {
          const res = await registerUser(email, password, username, full_name);
          localStorage.setItem("token", res.access_token);
          set({
            user: res.user,
            token: res.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({
            isLoading: false,
            error:
              err instanceof Error ? err.message : "Registration failed",
          });
          throw err;
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await fetchProfile();
          set({ user, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Failed to fetch profile",
          });
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const user = await updateProfile(data);
          set({ user, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Failed to update profile",
          });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
      setHasHydrated: (state) => set({ isHydrated: state }),
    }),
    {
      name: "nyaya-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
