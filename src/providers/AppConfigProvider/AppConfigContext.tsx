"use client"
import { AppConfig } from "@/types/app-config"
import { createContext } from "react"

export type AppConfigContext = AppConfig

export const AppConfigContext = createContext<AppConfigContext | undefined>(
  undefined,
)
