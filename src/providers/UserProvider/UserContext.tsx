"use client"
import { User } from "@/types/user"
import "client-only"
import { createContext } from "react"

export type UserContext = User

export const UserContext = createContext<UserContext | undefined>(undefined)
