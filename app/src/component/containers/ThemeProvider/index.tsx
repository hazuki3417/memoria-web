"use client";
import { ConfigProvider } from "antd";
import { ReactNode, FC } from "react";
import { theme } from "antd";

const { defaultAlgorithm, darkAlgorithm, compactAlgorithm } = theme;

const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
	// TODO: テーマはcookieから取得するように回収する
	const theme = { algorithm: [darkAlgorithm, compactAlgorithm] };

	return <ConfigProvider theme={theme}>{children}</ConfigProvider>;
};

export default ThemeProvider;
