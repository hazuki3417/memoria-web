"use client";
import { User as AppUser } from "@/graphql";
import { User as AuthUser } from "@auth0/nextjs-auth0/types";
import { createContext } from "react";

export interface AuthContext {
  auth: {
    user: AuthUser | undefined;
  };
  app: {
    user: AppUser | undefined;
  };
}

export const AuthContext = createContext<AuthContext>({
  auth: { user: undefined },
  app: { user: undefined },
});

export interface AuthProviderProps {
  value: AuthContext;
  children: React.ReactNode;
}

export const AuthProvider = (props: AuthProviderProps) => {
  const { value, children } = props;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
