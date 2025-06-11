import { ApolloClient, InMemoryCache } from "@apollo/client";

/**
 * client side fetch
 * NOTE: next.js をプロキシサーバーとして扱い、/api/graphqlへリクエストすると転送されるようにしている
 */
export const client = new ApolloClient({
  uri: "/api/mock",
  // uri: "/api/graphql",
  cache: new InMemoryCache(),
  ssrMode: false,
});
