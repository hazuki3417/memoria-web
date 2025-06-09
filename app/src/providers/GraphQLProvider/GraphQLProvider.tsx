import NewApolloClient from "@/graphql";
import { ApolloProvider } from "@apollo/client";
import React, { useMemo } from "react";

export interface GraphQLProviderProps {
  children: React.ReactNode;
}

export const GraphQLProvider = (props: GraphQLProviderProps) => {
  const { children } = props;
  const client = useMemo(() => {
    // 再レンダリングでclientを生成しないようにする
    return NewApolloClient();
  }, []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
