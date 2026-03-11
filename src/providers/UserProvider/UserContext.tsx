"use client"
import { User } from "@/types/user"
import "client-only"
import { createContext } from "react"

export type UserContext = User | null

// NOTE: undefined: providerなし, null: 未認証, User: 認証済み
export const UserContext = createContext<UserContext | undefined>(undefined)
