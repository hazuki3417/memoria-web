import { Box, Stack, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { ApplicationContentScroll } from "./ApplicationContentScroll"

const meta = {
  title: "Components/Application Shell/Content Scroll",
  component: ApplicationContentScroll,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <Box h={320}>
        <Story />
      </Box>
    ),
  ],
  args: {
    children: (
      <Stack gap="md">
        {Array.from({ length: 12 }, (_, index) => (
          <Text key={index}>コンテンツ {index + 1}</Text>
        ))}
      </Stack>
    ),
  },
} satisfies Meta<typeof ApplicationContentScroll>

export default meta
type Story = StoryObj<typeof meta>

export const Scrollable: Story = {
  name: "Visual · Scrollable",
  tags: ["visual"],
}
