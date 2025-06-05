import "@mantine/core/styles.css";
import { FC } from "react";
import { ReactNode } from "react";
import type { Metadata } from "next";
import Head from "./Head";
import Providers from "./Providers";

const metadata: Metadata = {
	title: "Memoria",
	description: "Memoria",
};

type RootLayoutProps = {
	children: ReactNode;
};

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
	return (
		<html data-mantine-color-scheme="dark">
			{/* FIX: data-mantine-color-scheme="dark"の記述がない場合、ハイドレーションの差分が発生してエラーになる */}
			<Head />
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
};

export default RootLayout;
export { metadata };
