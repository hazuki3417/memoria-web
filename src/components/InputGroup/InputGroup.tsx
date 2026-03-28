import { Flex, FlexProps } from "@mantine/core"

export interface InputGroupProps extends FlexProps {}

export const InputGroup = (props: InputGroupProps) => {
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
