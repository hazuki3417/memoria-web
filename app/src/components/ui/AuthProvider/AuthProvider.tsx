import React from "react";

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = (props: AuthProviderProps) => {
  const { children, ...rest } = props;
  return <>{children}</>;
};
