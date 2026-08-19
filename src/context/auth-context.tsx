"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { signOut as nextAuthSignOut } from "next-auth/react";
import { toast } from "sonner";
import { AuthModal } from "@/components/auth/auth-modal";

interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  image?: string | null;
  role: "ADMIN" | "MODERATOR" | "USER";
  vehicles?: any[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  openLoginModal: () => void;
  openRegisterModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.success && data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = (userData: AuthUser) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // 1. Terminate NextAuth session
      try {
        await nextAuthSignOut({ redirect: false });
      } catch (e) {
        console.error("NextAuth signOut error", e);
      }

      // 2. Clear all server-side session cookies
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      // 3. Clear local state immediately
      setUser(null);
      toast.success("Has cerrado sesión exitosamente");

      // 4. Force session verification
      await refreshUser();
    } catch (err) {
      console.error("Logout error", err);
      toast.error("Error al cerrar sesión");
    }
  };

  const openLoginModal = () => {
    setAuthModalTab("login");
    setAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalTab("register");
    setAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        openLoginModal,
        openRegisterModal,
      }}
    >
      {children}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
        onAuthSuccess={(u) => {
          setUser(u);
          refreshUser();
        }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
