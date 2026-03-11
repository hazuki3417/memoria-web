"use client"
import {
  ConfirmProvider,
  LangProvider,
  ThemeProvider,
  ThemeProviderProps,
} from "@/providers"
import { AppConfigContext } from "@/providers/AppConfigProvider"
import { FeedbackProvider } from "@/providers/FeedbackProvider"
import type React from "react"

export interface ProvidersProps {
  theme: ThemeProviderProps
  config: AppConfigContext
  children: React.ReactNode
}

export const Providers = (props: ProvidersProps) => {
  const { theme, config, children } = props
  return (
    <ThemeProvider {...theme}>
      <AppConfigContext value={config}>
        <LangProvider>
          <FeedbackProvider>
            <ConfirmProvider>{children}</ConfirmProvider>
          </FeedbackProvider>
        </LangProvider>
      </AppConfigContext>
    </ThemeProvider>
  )
}
