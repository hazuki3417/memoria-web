"use client";
import { User } from "@auth0/nextjs-auth0/types";
import { createContext } from "react";

export const AuthContext = createContext<User | undefined>(undefined);

export interface AuthProviderProps {
  value: User | undefined;
  children: React.ReactNode;
}

export const AuthProvider = (props: AuthProviderProps) => {
  const { value, children } = props;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
