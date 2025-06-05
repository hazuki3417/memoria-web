"use client";
import { ApolloProvider, ThemeProvider } from "@/components";
import { theme } from "@/lib/theme";
import React, { ReactNode } from "react";

export type ProvidersProps = {
	children: ReactNode;
};

const Providers: React.FC<ProvidersProps> = (props) => {
	const { children } = props;
	return (
		<ThemeProvider defaultColorScheme="auto" theme={theme}>
			<ApolloProvider>{children}</ApolloProvider>
		</ThemeProvider>
	);
};
export default Providers;
