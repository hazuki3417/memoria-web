"use client";
import { useUser } from "@auth0/nextjs-auth0";
import { createContext, useContext } from "react";

const AuthContext = createContext<ReturnType<typeof useUser> | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = (props: AuthProviderProps) => {
  const { children } = props;
  const auth = useUser();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
