import { Text, TextProps } from "@mantine/core"

export interface InputCounterProps extends TextProps {
  current: number
  limit: number
}

export const InputCounter = (props: InputCounterProps) => {
  const { current, limit, size = "xs", c = "dimmed", ...rest } = props
  return <Text size={size} c={c} {...rest}>{`${current} / ${limit}`}</Text>
}
