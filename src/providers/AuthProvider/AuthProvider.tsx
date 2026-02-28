"use client"
import "client-only"
import { AuthContext } from "./AuthContext"

export interface AuthProviderProps {
  value: AuthContext
  children: React.ReactNode
}

export const AuthProvider = (props: AuthProviderProps) => {
  const { value, children } = props
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
