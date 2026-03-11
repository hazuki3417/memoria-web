"use client"
import { CreateGraphQLOption } from "@/lib/graphql/type"
import {
  GraphQLProvider,
  ImageDetailModalProvider,
  UserContext,
  UserProvider,
} from "@/providers"
import type React from "react"
import { memo } from "react"

export interface ProvidersProps {
  user: UserContext
  graphql: CreateGraphQLOption
  children: React.ReactNode
}

const MemoGraphQLProvider = memo(GraphQLProvider)

export const Providers = (props: ProvidersProps) => {
  const { user, graphql, children } = props
  return (
    <UserProvider value={user}>
      <MemoGraphQLProvider option={graphql}>
        <ImageDetailModalProvider>{children}</ImageDetailModalProvider>
      </MemoGraphQLProvider>
    </UserProvider>
  )
}
