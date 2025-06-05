"use client";
import { CustomModal } from "@/components/Modal/CustomModal/CustomModal";
import { ImageDetailDialog } from "@/components/Modal/ImageDetailDialog";
import {
	Container,
} from "@mantine/core";

const makeStyle = () => {
	return {
		container: {
			height: "100vh",
			minWidth: "1200px",
		},
	};
};

export default function Home() {
	const style = makeStyle();
	return (
		<Container fluid style={style.container}>
			<main>
				<div>
					<p>Next.js検証用リポジトリ</p>
					<CustomModal opened={true} onClose={() => console.debug("a")}>
						<ImageDetailDialog />
					</CustomModal>
				</div>
			</main>
		</Container>
	);
}
