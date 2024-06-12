"use client";
import { theme } from "antd";
const { defaultAlgorithm, darkAlgorithm, compactAlgorithm, getDesignToken } =
	theme;

type Props = Pick<React.ComponentProps<"body">, "className" | "children">;

const Body: React.FC<Props> = ({ className, children }) => {
	const config = {
		algorithm: [darkAlgorithm, compactAlgorithm],
		// algorithm: [defaultAlgorithm, compactAlgorithm],
	};
	const token = getDesignToken(config);

  const style = {
    color: token.colorTextBase,
    backgroundColor: token.colorBgBase
  };

	console.debug("component render: ", "client");
	return <body className={className} style={style}>{children}</body>;
};

export default Body;
