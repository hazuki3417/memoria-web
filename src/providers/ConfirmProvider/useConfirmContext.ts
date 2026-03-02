"use client"
import "client-only"
import { useContext } from "react"
import { ConfirmContext, ConfirmContextValue } from "./ConfirmContext"

export const useConfirmContext = (): ConfirmContextValue => {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error("useConfirmContext must be used within ConfirmContext")
  }
  return ctx
}
