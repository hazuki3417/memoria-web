import { ApolloClient, InMemoryCache } from "@apollo/client";
import { CreateGraphQLOption } from "./type";
import { createUploadLink } from "apollo-upload-client";

/**
 * server side fetch
 * TODO: uriは環境変数から指定できるようにする
 */
export const createGraphQL = (option: CreateGraphQLOption) => {
  const headers: Record<string, string> = {};
  if (option.token) {
    headers["Authorization"] = `Bearer ${option.token}`;
  }

  return new ApolloClient({
    link: createUploadLink({
      uri: "http://localhost:8080/graphql",
      headers,
    }),
    cache: new InMemoryCache(),
    ssrMode: true,
  });
};
