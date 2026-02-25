import "server-only"
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { CreateGraphQLOption } from "./type";
import { createUploadLink } from "apollo-upload-client";
import { serverEnv } from "@/env/server";

/**
 * server side fetch
 */
export const createGraphQL = (option: CreateGraphQLOption) => {
  const headers: Record<string, string> = {};
  if (option.token) {
    headers["Authorization"] = `Bearer ${option.token}`;
  }

  return new ApolloClient({
    link: createUploadLink({
      uri: serverEnv.API_URI,
      headers,
    }),
    cache: new InMemoryCache(),
    ssrMode: true,
  });
};
