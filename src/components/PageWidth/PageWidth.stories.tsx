import type { Meta, StoryObj } from "@storybook/react"
import { Box, Text } from "@mantine/core"
import { PageWidth } from "./PageWidth"
const meta = {
  title: "Components/PageWidth",
  component: PageWidth,
  args: {
    children: (
      <Box bg="gray.1" p="lg">
        <Text>ページコンテンツ</Text>
      </Box>
    ),
  },
} satisfies Meta<typeof PageWidth>
export default meta
type Story = StoryObj<typeof meta>
export const Fluid: Story = { tags: ["visual"] }
export const Contained: Story = {
  args: { variant: "contained" },
  tags: ["visual"],
}
