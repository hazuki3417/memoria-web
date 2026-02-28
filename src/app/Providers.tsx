"use client"
import { CreateGraphQLOption } from "@/lib/graphql/type"
import {
  AuthContext,
  AuthProvider,
  GraphQLProvider,
  ImageDetailModalProvider,
  LangProvider,
  ThemeProvider,
  ThemeProviderProps,
} from "@/providers"
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

const Providers = (props: ProvidersProps) => {
  const { theme, auth, option, children } = props
  return (
    <ThemeProvider {...theme}>
      <LangProvider>
        <ImageDetailModalProvider>
          <AuthProvider value={auth}>
            <MemoGraphQLProvider option={option.graphql}>
              {children}
            </MemoGraphQLProvider>
          </AuthProvider>
        </ImageDetailModalProvider>
      </LangProvider>
    </ThemeProvider>
  )
}
export default Providers
