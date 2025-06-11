import { ApolloClient, InMemoryCache } from "@apollo/client";

/**
 * server side fetch
 */
export const server = new ApolloClient({
  uri: "http://localhost:8080/graphql",
  cache: new InMemoryCache(),
  ssrMode: true,
});
