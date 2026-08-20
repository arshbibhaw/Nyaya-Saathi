"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

/**
 * Custom hook for auth state + route protection.
 *
 * Usage:
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 * When `requireAuth` is true (default), redirects to /auth/login
 * if the user is not authenticated.
 */
export function useAuth(requireAuth = true) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error, login, register, logout, clearError } =
    useAuthStore();

  useEffect(() => {
    if (requireAuth && !isAuthenticated && !isLoading) {
      router.replace("/auth/login");
    }
  }, [requireAuth, isAuthenticated, isLoading, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
