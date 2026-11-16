"use client"

import {
  ApolloClient,
  ApolloLink,
  ApolloProvider as ReactApolloProvider,
  HttpLink,
} from "@apollo/client"
import { useState, type ReactNode } from "react"
import { createApolloCache } from "@/infrastructure/graphql/createApolloCache"
import { createSettingsCacheReadProtectionLink } from "@/infrastructure/graphql/settingsCacheReadProtection"

export const ApolloProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(() => {
    const cache = createApolloCache()
    return new ApolloClient({
      link: ApolloLink.from([
        createSettingsCacheReadProtectionLink(cache),
        new HttpLink({ uri: "/api/graphql", credentials: "same-origin" }),
      ]),
      cache,
      defaultOptions: { watchQuery: { fetchPolicy: "cache-and-network" } },
    })
  })
  return <ReactApolloProvider client={client}>{children}</ReactApolloProvider>
}
