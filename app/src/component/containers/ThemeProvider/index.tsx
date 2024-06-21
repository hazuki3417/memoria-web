"use client";
import { ConfigProvider } from "antd";
import { ReactNode, FC, useEffect } from "react";
import { theme } from "antd";
import Cookers from "universal-cookie";

const { defaultAlgorithm, darkAlgorithm, compactAlgorithm } = theme;

type ThemeType = "light" | "dark";

type Props = {
	children: ReactNode;
	theme: ThemeType | undefined;
};

const ThemeProvider: FC<Props> = (props) => {
	const { children, theme } = props;
	const cookieName = "themeToken";

	const algorithm = [compactAlgorithm];
	if (theme === "dark") {
		algorithm.push(darkAlgorithm);
	} else {
		algorithm.push(defaultAlgorithm);
	}

	const config = { algorithm: algorithm };

	useEffect(() => {
		const cookies = new Cookers();

		// テーマの初期化。ページアクセス時にテーマトークンをcookieにセットする
		if (cookies.get(cookieName) === undefined) {
			const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";

			cookies.set(cookieName, theme, {
				secure: true,
				sameSite: "strict",
				path: "/",
			});
		}
	}, []);

	return <ConfigProvider theme={config}>{children}</ConfigProvider>;
};

export default ThemeProvider;
