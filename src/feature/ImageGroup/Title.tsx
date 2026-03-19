import { Title as Base, TitleProps as BaseProps } from "@mantine/core"

export interface TitleProps extends BaseProps {}

export const Title = (props: TitleProps) => {
  const { style, order = 5, ...rest } = props
  return (
    <Base
      style={{
        ...style,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      order={order}
      {...rest}
    />
  )
}
Title.displayName = "ImageGroup.Title"
