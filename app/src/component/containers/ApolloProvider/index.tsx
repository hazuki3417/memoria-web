"use client";
import { ApolloProvider as OriginProvider } from "@apollo/client";
import { FC } from "react";
import { ReactNode, memo, useMemo } from "react";
import NewApolloClient from "@/graphql/client";

const ApolloProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const client = useMemo(() => {
		// 再レンダリングでclientを生成しないようにする
		return NewApolloClient();
	}, []);

	return <OriginProvider client={client}>{children}</OriginProvider>;
};

export default memo(ApolloProvider);
