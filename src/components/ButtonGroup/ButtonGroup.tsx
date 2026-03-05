import { Flex, FlexProps } from "@mantine/core"

export interface ButtonGroupProps extends FlexProps {}

export const ButtonGroup = (props: ButtonGroupProps) => {
  const { style, ...rest } = props
  return (
    <Flex
      style={{
        ...style,
        gap: "calc(.625rem * 0.5)",
      }}
      {...rest}
    />
  )
}
