import type { Meta, StoryObj } from "@storybook/react"
import { Stack, Text } from "@mantine/core"
import { StandardPageScroll } from "./StandardPageScroll"

const meta = {
  title: "Components/StandardPageScroll",
  component: StandardPageScroll,
  args: { children: <Stack>{Array.from({ length: 30 }, (_, i) => <Text key={i}>Content row {i + 1}</Text>)}</Stack> },
  decorators: [(Story) => <div style={{ height: 360, width: "100%" }}><Story /></div>],
} satisfies Meta<typeof StandardPageScroll>
export default meta
type Story = StoryObj<typeof meta>
export const Scrollable: Story = { tags: ["visual"] }
