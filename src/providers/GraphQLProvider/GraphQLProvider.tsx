"use client"
import { createGraphQL } from "@/lib/graphql/clinet"
import { CreateGraphQLOption } from "@/lib/graphql/type"
import { ApolloProvider } from "@apollo/client"
import React from "react"

export interface GraphQLProviderProps {
  children: React.ReactNode
  option: CreateGraphQLOption
}

export const GraphQLProvider = (props: GraphQLProviderProps) => {
  const { children, option } = props
  const client = createGraphQL(option)
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
