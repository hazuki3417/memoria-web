import "@mantine/core/styles.css";
import { ApolloProvider, ThemeProvider } from "@/component/containers";
import { ColorSchemeScript, Container } from "@mantine/core";
import { FC } from "react";
import { ReactNode } from "react";
import type { Metadata } from "next";
import { theme } from "@/lib/theme";
import { Header } from "@/component/presentations/Header";

const metadata: Metadata = {
	title: "Memoria",
	description: "Memoria",
};

type Props = {
	children: ReactNode;
};

const makeStyle = () => {
	return {
		container: {
			height: "100vh",
			minWidth: "1200px",
		},
	};
};

const RootLayout: FC<Props> = ({ children }) => {
	const style = makeStyle();

	return (
		<html lang="en">
			<head>
				<ColorSchemeScript defaultColorScheme="auto" />
			</head>
			<body>
				<ThemeProvider defaultColorScheme="auto" theme={theme}>
					<ApolloProvider>
						<Header />
						<Container fluid style={style.container}>
							{children}
						</Container>
					</ApolloProvider>
				</ThemeProvider>
			</body>
		</html>
	);
};

export default RootLayout;
export { metadata };
