"use client"
import "client-only"
import { useContext } from "react"
import { AppConfigContext } from "./AppConfigContext"

export const useAppConfigContext = () => {
  const context = useContext(AppConfigContext)
  if (context === undefined) {
    throw new Error(
      "useAppConfigContext must be used within a AppConfigContextProvider",
    )
  }
  return context
}
