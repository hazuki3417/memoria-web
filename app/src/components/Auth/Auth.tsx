import { useAuth } from "@/providers/AuthProvider";
import React from "react";

export interface AuthProps {
  children: React.ReactNode;
}

export const Auth = (props: AuthProps) => {
  const { children } = props;
  return <>{children}</>;
};

Auth.Loading = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  return auth.isLoading ? <>{children}</> : null;
};

Auth.SignedIn = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  auth.user;
  return auth.user ? <>{children}</> : null;
};

Auth.SignedOut = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  return !auth.user ? <>{children}</> : null;
};
