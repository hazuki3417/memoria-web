import { Skeleton } from "antd";
import type { ComponentProps, FC } from "react";
import type { Content, DataResult } from "./hooks/type";

type Props = ComponentProps<"div"> &
  DataResult<Content> & {
    title: string;
  };

const Presentation: FC<Props> = (props) => {
  const { className, title, loading, error, data } = props;

  if (error) {
    return (
      <div className={className}>
        <div>{title}</div>
        <p className={className}>{JSON.stringify(error)}</p>
      </div>
    );
  }

  return (
    <>
      <Skeleton active={true} loading={loading}>
        <br />
        <div>{title}</div>
        <br />
        <p className={className}>{data?.content.id}</p>
        <p className={className}>{data?.content.workspaceId}</p>
        <p className={className}>{data?.content.tags}</p>
        <p className={className}>{data?.content.createdAt}</p>
        <p className={className}>{data?.content.updatedAt}</p>
      </Skeleton>
    </>
  );
};
export default Presentation;
export type PresentationProps = ComponentProps<typeof Presentation>;
