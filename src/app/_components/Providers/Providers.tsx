"use client"
import { CreateGraphQLOption } from "@/lib/graphql/type"
import {
  ConfirmProvider,
  GraphQLProvider,
  ImageDetailModalProvider,
  LangProvider,
  ThemeProvider,
  ThemeProviderProps,
  UserContext,
  UserProvider,
} from "@/providers"
import { AppConfigContext } from "@/providers/AppConfigProvider"
import { FeedbackProvider } from "@/providers/FeedbackProvider"
import type React from "react"
import { memo } from "react"

export interface ProvidersProps {
  theme: ThemeProviderProps
  config: AppConfigContext
  user: UserContext
  option: {
    graphql: CreateGraphQLOption
  }
  children: React.ReactNode
}

const MemoGraphQLProvider = memo(GraphQLProvider)

export const Providers = (props: ProvidersProps) => {
  const { theme, config, user, option, children } = props
  return (
    <ThemeProvider {...theme}>
      <AppConfigContext value={config}>
        <LangProvider>
          <UserProvider value={user}>
            <MemoGraphQLProvider option={option.graphql}>
              <FeedbackProvider>
                <ConfirmProvider>
                  <ImageDetailModalProvider>{children}</ImageDetailModalProvider>
                </ConfirmProvider>
              </FeedbackProvider>
            </MemoGraphQLProvider>
          </UserProvider>
        </LangProvider>
      </AppConfigContext>
    </ThemeProvider>
  )
}
