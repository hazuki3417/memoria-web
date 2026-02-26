import "client-only";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { CreateGraphQLOption } from "./type";
import { createUploadLink } from "apollo-upload-client";

/**
 * client side fetch
 * NOTE: next.js をプロキシサーバーとして扱い、/api/graphqlへリクエストすると転送されるようにしている
 * NOTE: 上記の理由からuriはハードコーディングで問題ない
 */
export const createGraphQL = (option: CreateGraphQLOption) => {
  const headers: Record<string, string> = {};
  if (option.token) {
    headers["Authorization"] = `Bearer ${option.token}`;
  }

  return new ApolloClient({
    link: createUploadLink({
      uri: "/api/graphql",
      headers,
    }),
    cache: new InMemoryCache(),
    ssrMode: false,
  });
};
