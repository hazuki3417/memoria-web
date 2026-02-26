import { auth } from "@/lib/auth";
import React from "react";

export interface AuthProps {
  children: React.ReactNode;
}

export const Auth = async (props: AuthProps) => {
  const { children } = props;
  return <>{children}</>;
};

Auth.SignedIn = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.getSession();
  return session?.user ? <>{children}</> : null;
};

Auth.SignedOut = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.getSession();
  return !session?.user ? <>{children}</> : null;
};
