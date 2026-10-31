import { Box, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { SettingsSectionContent } from "./SettingsSectionContent"

const meta = {
  title: "Features/Settings/Preferences",
  component: SettingsSectionContent,
  args: {
    section: "profile",
    profileNickname: "テストユーザー",
    saveProfile: fn(async () => undefined),
    usageContent: <Text>利用状況の表示領域</Text>,
  },
  decorators: [(Story) => <Box maw={760} p="md"><Story /></Box>],
} satisfies Meta<typeof SettingsSectionContent>
export default meta
type Story = StoryObj<typeof meta>

export const Preferences: Story = {
  name: "Visual · 環境設定",
  tags: ["visual"],
  args: { section: "preferences" },
}
