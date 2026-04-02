"use client"
import "client-only"
import { useContext } from "react"
import { FormModeSwitchContext } from "./FormModeSwitchContext"

export const useFormModeSwitch = () => {
  const context = useContext(FormModeSwitchContext)
  if (context === undefined) {
    throw new Error(
      "useFormModeSwitchContext must be used within a FormModeSwitchContextProvider",
    )
  }
  return context
}
