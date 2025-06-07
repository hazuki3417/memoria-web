"use client";
import NewApolloClient, { type ApolloClientResult } from "@/graphql";
import { ApolloProvider as OriginProvider } from "@apollo/client";
import type { FC } from "react";
import { type ReactNode, memo, useMemo } from "react";

type Props = {
  children: ReactNode;
};

const ApolloProvider: FC<Props> = (props) => {
  const { children } = props;
  const client = useMemo(() => {
    // 再レンダリングでclientを生成しないようにする
    return NewApolloClient();
  }, []);

  return <OriginProvider client={client}>{children}</OriginProvider>;
};

export default memo(ApolloProvider);
// export type { ApolloClientResult };
