"use client";
import { ApolloProvider as OriginProvider } from "@apollo/client";
import { FC } from "react";
import { ReactNode, memo, useMemo } from "react";
import NewApolloClient, { type ApolloClientResult } from "@/graphql";

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
export { type ApolloClientResult };
