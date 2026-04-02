"use client"
import { FormModeSwitchContext } from "./FormModeSwitchContext"

export interface FormModeSwitchProviderProps {
  value: FormModeSwitchContext
  children: React.ReactNode
}

export const FormModeSwitchProvider = (props: FormModeSwitchProviderProps) => {
  const { value, children } = props

  return (
    <FormModeSwitchContext.Provider value={value}>
      {children}
    </FormModeSwitchContext.Provider>
  )
}
