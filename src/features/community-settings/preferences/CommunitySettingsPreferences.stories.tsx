import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { CommunitySettingsStoryNavigation } from "../storybook/CommunitySettingsStoryNavigation"

const meta = {
  title: "Features/Community Settings/Preferences",
  component: CommunitySettingsStoryNavigation,
  render: (args) => <CommunitySettingsStoryNavigation {...args} />,
  args: {
    onSectionChange: () => undefined,
    invitationMode: "preview",
    communityId: "photo-club",
    communityName: "家族のアルバム",
    role: "admin",
    section: "general",
    members: [
      { id: "user-1", name: "テストユーザー", role: "admin", isSelf: true },
      { id: "user-2", name: "家族メンバー", role: "member" },
    ],
  },
  decorators: [
    (Story) => (
      <Box h={600}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof CommunitySettingsStoryNavigation>
export default meta
type Story = StoryObj<typeof meta>

export const Preferences: Story = {
  name: "Visual · 環境設定",
  tags: ["visual"],
  args: { section: "preferences" },
}
