import { ColorSwatch, Group, Text } from "@mantine/core"

export interface ColorSwatchTextProps {
  label: string
  color: string
}

export const ColorSwatchText = (props: ColorSwatchTextProps) => {
  const { label, color } = props
  return (
    <Group display="flex" align="center" gap={0}>
      <Text size="xs">・</Text>
      <ColorSwatch color={color} radius="xs" size={11} mr={4} />
      <Text size="xs">{label}</Text>
    </Group>
  )
}
