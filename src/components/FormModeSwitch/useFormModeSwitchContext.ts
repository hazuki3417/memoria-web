"use client"
import "client-only"
import { useContext } from "react"
import { FormModeSwitchContext } from "./FormModeSwitchContext"

export const useFormModeSwitchContext = () => {
  const context = useContext(FormModeSwitchContext)
  if (context === undefined) {
    throw new Error(
      "useFormModeSwitchContext must be used within a FormModeSwitchContextProvider",
    )
  }
  return context
}
