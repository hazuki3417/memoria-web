"use client"

import {
  ApolloClient,
  ApolloProvider as ReactApolloProvider,
  HttpLink,
} from "@apollo/client"
import { useState, type ReactNode } from "react"
import { createApolloCache } from "@/infrastructure/graphql/createApolloCache"

export function ApolloProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new ApolloClient({
        link: new HttpLink({ uri: "/api/graphql", credentials: "same-origin" }),
        cache: createApolloCache(),
        defaultOptions: { watchQuery: { fetchPolicy: "cache-and-network" } },
      }),
  )
  return <ReactApolloProvider client={client}>{children}</ReactApolloProvider>
}
