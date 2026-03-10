import { ApolloClient } from "@apollo/client"
import { createUploadLink } from "apollo-upload-client"
import "client-only"
import { cache } from "./cache"
import { CreateGraphQLOption } from "./type"

/**
 * client side fetch
 * NOTE: next.js をプロキシサーバーとして扱い、/api/graphqlへリクエストすると転送されるようにしている
 * NOTE: 上記の理由からuriはハードコーディングで問題ない
 */
export const createGraphQL = (option: CreateGraphQLOption) => {
  const headers: Record<string, string> = {}
  if (option.token) {
    headers["Authorization"] = `Bearer ${option.token}`
  }

  return new ApolloClient({
    link: createUploadLink({
      uri: "/api/graphql",
      headers,
    }),
    cache: cache,
    ssrMode: false,
  })
}
