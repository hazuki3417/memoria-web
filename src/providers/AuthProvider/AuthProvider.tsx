"use client";
import { createContext } from "react";

export type AuthUser = {
  id: string;
};

export type AuthContext = {
  isSignIn: boolean;
  user: AuthUser | undefined;
};

export const AuthContext = createContext<AuthContext>({
  isSignIn: false,
  user: undefined,
});

export interface AuthProviderProps {
  value: AuthContext;
  children: React.ReactNode;
}

export const AuthProvider = (props: AuthProviderProps) => {
  const { value, children } = props;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
