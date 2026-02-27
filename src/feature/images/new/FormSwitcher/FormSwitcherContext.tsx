import { UseFormSwitcher } from "./useFormSwitcher"
import React, { createContext, useContext } from "react"

const FormSwitcherContext = createContext<UseFormSwitcher | null>(null)

export interface FormSwitcherProviderProps {
  value: UseFormSwitcher
  children: React.ReactNode
}

export const FormSwitcherProvider = (props: FormSwitcherProviderProps) => {
  const { value, children } = props

  return (
    <FormSwitcherContext.Provider value={value}>
      {children}
    </FormSwitcherContext.Provider>
  )
}

export const useFormSwitcherContext = (): UseFormSwitcher => {
  const ctx = useContext(FormSwitcherContext)
  if (!ctx) {
    throw new Error(
      "useFormSwitcherContext must be used within FormSwitcherContext",
    )
  }
  return ctx
}
