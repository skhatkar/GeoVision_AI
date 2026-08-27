"use client";

import { create } from "zustand";
import { login as apiLogin, getMe, type AuthUser } from "@/api/authApi";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  initAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<AuthUser>;
  loginAsRole: (role: "admin" | "analyst" | "officer") => Promise<AuthUser>;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initAuth: async () => {
    if (typeof window === "undefined") {
      set({ isLoading: false });
      return;
    }

    const token = localStorage.getItem("access_token");
    const cachedUser = localStorage.getItem("auth_user");

    if (cachedUser) {
      try {
        set({ user: JSON.parse(cachedUser), token, isAuthenticated: !!token });
      } catch {
        // ignore
      }
    }

    if (token) {
      try {
        const user = await getMe(token);
        localStorage.setItem("auth_user", JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false });
      } catch (err) {
        console.warn("Session expired or invalid token:", err);
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_user");
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const res = await apiLogin({ username, password });
      const token = res.access_token;
      localStorage.setItem("access_token", token);

      const user = await getMe(token);
      localStorage.setItem("auth_user", JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  loginAsRole: async (role) => {
    let credentials = { username: "admin", password: "admin123" };
    if (role === "analyst") {
      credentials = { username: "analyst", password: "analyst123" };
    } else if (role === "officer") {
      credentials = { username: "forest_officer", password: "forest123" };
    }

    return get().login(credentials.username, credentials.password);
  },

  setUser: (user) => {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("auth_user", JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth_user");
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
}));
