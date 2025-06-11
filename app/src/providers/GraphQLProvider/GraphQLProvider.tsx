import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/graphql/clinet";
import React from "react";

export interface GraphQLProviderProps {
  children: React.ReactNode;
}

export const GraphQLProvider = (props: GraphQLProviderProps) => {
  const { children } = props;
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
