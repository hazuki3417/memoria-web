import { ApolloClient, InMemoryCache } from "@apollo/client";
import { CreateGraphQLOption } from "./type";

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
    //uri: "/api/graphql",
    uri: "/api/mock",
    cache: new InMemoryCache(),
    ssrMode: false,
    headers,
  });
};
