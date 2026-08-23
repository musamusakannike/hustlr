"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { User, authService } from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const storedUser = localStorage.getItem("hustlr_user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [isLoading] = useState(false);

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    try {
      if (newUser) {
        localStorage.setItem("hustlr_user", JSON.stringify(newUser));
      } else {
        localStorage.removeItem("hustlr_user");
        localStorage.removeItem("hustlr_token");
        localStorage.removeItem("hustlr_mock_session");
      }
    } catch {}
  };

  const logout = async () => {
    try {
      await authService.logoutSeller();
    } catch {
      // Continue cleanup
    } finally {
      handleSetUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: handleSetUser,
        logout,
        isLoading,
      }}
    >
      {children}
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
