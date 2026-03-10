import { serverEnv } from "@/env/server"
import { ApolloClient } from "@apollo/client"
import { createUploadLink } from "apollo-upload-client"
import "server-only"
import { cache } from "./cache"
import { CreateGraphQLOption } from "./type"

/**
 * server side fetch
 */
export const createGraphQL = (option: CreateGraphQLOption) => {
  const headers: Record<string, string> = {}
  if (option.token) {
    headers["Authorization"] = `Bearer ${option.token}`
  }

  return new ApolloClient({
    link: createUploadLink({
      uri: serverEnv.API_URI,
      headers,
    }),
    cache: cache,
    ssrMode: true,
  })
}
