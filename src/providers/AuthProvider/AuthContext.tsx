"use client"
import "client-only"
import { createContext } from "react"

export type AuthUser = {
  id: string
}

export type AuthContext = {
  isSignIn: boolean
  user: AuthUser | undefined
}

export const AuthContext = createContext<AuthContext>({
  isSignIn: false,
  user: undefined,
})
