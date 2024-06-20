import { FC } from "react";
import Presentation from "../_component/Presentation";
import fetchData from "../_component/hooks/server";

const Server: FC = async () => {
	const result = await fetchData({
		variables: { id: "666fdc1f5229ae224fe83c96" },
	});

	return <Presentation title="server component" {...result} />;
};
export default Server;
