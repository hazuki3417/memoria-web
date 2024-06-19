import {FC, ComponentProps} from "react";
import { DataResult, Content } from "./hooks/type";

type Props = ComponentProps<"div"> & DataResult<Content> & {
		title: string;
	};

const Presentation: FC<Props> = (props) => {
	const { className, title, loading, error, data } = props;

	if (loading) {
		return (
			<div className={className}>
				<div>{title}</div>
				<p className={className}>loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className={className}>
				<div>{title}</div>
				<p className={className}>{JSON.stringify(error)}</p>
			</div>
		);
	}

	return (
		<div className={className}>
			<br/>
			<div>{title}</div>
			<br/>
			<p className={className}>{data?.content.id}</p>
			<p className={className}>{data?.content.workspaceId}</p>
			<p className={className}>{data?.content.tags}</p>
			<p className={className}>{data?.content.createdAt}</p>
			<p className={className}>{data?.content.updatedAt}</p>
		</div>
	);
};
export default Presentation;
export type PresentationProps = ComponentProps<typeof Presentation>;
