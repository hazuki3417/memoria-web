"use client"

import {
  ApolloClient,
  ApolloProvider as ReactApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client"
import { useState, type ReactNode } from "react"

export function ApolloProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new ApolloClient({
        link: new HttpLink({ uri: "/api/graphql", credentials: "same-origin" }),
        cache: new InMemoryCache(),
        defaultOptions: { watchQuery: { fetchPolicy: "cache-and-network" } },
      }),
  )
  return <ReactApolloProvider client={client}>{children}</ReactApolloProvider>
}
