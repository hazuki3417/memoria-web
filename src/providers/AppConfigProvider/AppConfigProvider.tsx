"use client"
import { AppConfigContext } from "./AppConfigContext"

export interface AppConfigProviderProps {
  value: AppConfigContext
  children: React.ReactNode
}

export const AppConfigProvider = (props: AppConfigProviderProps) => {
  const { value, children } = props
  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  )
}
