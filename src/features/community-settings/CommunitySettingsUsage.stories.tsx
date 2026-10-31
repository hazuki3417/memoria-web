import { Box, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { CommunitySettings } from "./CommunitySettings"

const meta = {
  title: "Features/Community Settings/Usage",
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

export const Usage: Story = {
  name: "Visual · 利用状況",
  tags: ["visual"],
  args: {
    section: "usage",
    usageContent: <Text>利用状況の表示領域</Text>,
  },
}

