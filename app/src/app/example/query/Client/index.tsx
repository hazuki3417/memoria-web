"use client";
import { FC } from "react";
import Presentation from "../_component/Presentation";
import useData from "../_component/hooks/client";

const Client: FC = () => {
	const result = useData({
		variables: { id: "666fdc1f5229ae224fe83c96" },
	});

	return <Presentation title="client component" {...result} />;
};
export default Client;
