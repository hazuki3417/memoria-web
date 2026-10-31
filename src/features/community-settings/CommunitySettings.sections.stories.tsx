import { Box, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { CommunitySettings } from "./CommunitySettings"

const meta = {
  title: "Features/Settings/Community/Sections",
  component: CommunitySettings,
  args: {
    communityId: "photo-club",
    communityName: "家族のアルバム",
    role: "admin",
    section: "general",
    members: [
      { id: "user-1", name: "テストユーザー", role: "admin", isSelf: true },
      { id: "user-2", name: "家族メンバー", role: "member" },
    ],
  },
  decorators: [(Story) => <Box h={600}><Story /></Box>],
} satisfies Meta<typeof CommunitySettings>
export default meta
type Story = StoryObj<typeof meta>

export const General: Story = {
  name: "Visual · 一般",
  tags: ["visual"],
}
export const Members: Story = {
  name: "Visual · メンバー",
  tags: ["visual"],
  args: { section: "members" },
}
export const Preferences: Story = {
  name: "Visual · 環境設定",
  tags: ["visual"],
  args: { section: "preferences" },
}
export const Usage: Story = {
  name: "Visual · 利用状況",
  tags: ["visual"],
  args: {
    section: "usage",
    usageContent: <Text>利用状況の表示領域</Text>,
  },
}
