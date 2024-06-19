"use client";
import NewApolloClient from "@/graphql/client";
import { ApolloProvider as OriginProvider } from "@apollo/client";
import { ReactNode, memo, useMemo } from "react";

const ApolloProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const client = useMemo(() => {
		// 再レンダリングでclientを生成しないようにする
		return NewApolloClient();
	}, []);

	return <OriginProvider client={client}>{children}</OriginProvider>;
};

export default memo(ApolloProvider);
