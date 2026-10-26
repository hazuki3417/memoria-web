"use client"

import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from "@apollo/client"
import { ApolloProvider as ReactApolloProvider } from "@apollo/client/react"
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
