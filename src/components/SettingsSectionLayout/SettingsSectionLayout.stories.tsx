import type { Meta, StoryObj } from "@storybook/react"
import { Box, Paper, Text } from "@mantine/core"
import { SettingsSectionLayout } from "./SettingsSectionLayout"
const meta = {
  title: "Components/SettingsSectionLayout",
  component: SettingsSectionLayout,
  args: {
    compact: false,
    navigation: (
      <Paper p="sm" withBorder>
        <Text>設定ナビゲーション</Text>
      </Paper>
    ),
    children: (
      <Box p="md">
        <Text>設定項目</Text>
      </Box>
    ),
  },
} satisfies Meta<typeof SettingsSectionLayout>
export default meta
type Story = StoryObj<typeof meta>
export const Desktop: Story = { tags: ["visual"] }
export const Compact: Story = { args: { compact: true }, tags: ["visual"] }

const longContent = (
  <Box p="md">
    {Array.from({ length: 30 }, (_, i) => (
      <Text key={i} py="xs">
        設定コンテンツ {i + 1}
      </Text>
    ))}
  </Box>
)
export const ScrollableDesktop: Story = {
  args: { children: longContent },
  decorators: [
    (Story) => (
      <div style={{ height: 360, width: "100%" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["visual"],
}
export const ScrollableCompact: Story = {
  args: { compact: true, children: longContent },
  decorators: [
    (Story) => (
      <div style={{ height: 360, width: 360 }}>
        <Story />
      </div>
    ),
  ],
  tags: ["visual"],
}
