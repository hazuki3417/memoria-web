"use client"
import { CreateGraphQLOption } from "@/lib/graphql/type"
import {
  AuthContext,
  AuthProvider,
  ConfirmProvider,
  GraphQLProvider,
  ImageDetailModalProvider,
  LangProvider,
  ThemeProvider,
  ThemeProviderProps,
} from "@/providers"
import { FeedbackProvider } from "@/providers/FeedbackProvider"
import type React from "react"
import { memo } from "react"

export interface ProvidersProps {
  theme: ThemeProviderProps
  auth: AuthContext
  option: {
    graphql: CreateGraphQLOption
  }
  children: React.ReactNode
}

const MemoGraphQLProvider = memo(GraphQLProvider)

export const Providers = (props: ProvidersProps) => {
  const { theme, auth, option, children } = props
  return (
    <ThemeProvider {...theme}>
      <LangProvider>
        <AuthProvider value={auth}>
          <MemoGraphQLProvider option={option.graphql}>
            <FeedbackProvider>
              <ConfirmProvider>
                <ImageDetailModalProvider>{children}</ImageDetailModalProvider>
              </ConfirmProvider>
            </FeedbackProvider>
          </MemoGraphQLProvider>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  )
}
