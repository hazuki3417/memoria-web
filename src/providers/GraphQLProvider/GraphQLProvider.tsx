import { ApolloProvider } from "@apollo/client"
import { createGraphQL } from "@/lib/graphql/clinet"
import React from "react"
import { CreateGraphQLOption } from "@/lib/graphql/type"

export interface GraphQLProviderProps {
  children: React.ReactNode
  option: CreateGraphQLOption
}

export const GraphQLProvider = (props: GraphQLProviderProps) => {
  const { children, option } = props
  const client = createGraphQL(option)
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
