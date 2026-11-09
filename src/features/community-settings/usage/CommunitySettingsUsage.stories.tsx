import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, within } from "storybook/test"
import { Usage as UsageComponent } from "@/features/usage"
import { sampleUsage, zeroUsage } from "@/features/usage/usageStoryFixtures"
import { CommunitySettingsView } from "../CommunitySettingsView"
import { CommunitySettingsStoryNavigation } from "../storybook/CommunitySettingsStoryNavigation"

const meta = {
  title: "Features/Community Settings/Usage",
  component: CommunitySettingsView,
  render: (args) => <CommunitySettingsStoryNavigation {...args} />,
  args: {
    onSectionChange: () => undefined,
    invitationMode: "preview",
    communityId: "photo-club",
    communityName: "家族のアルバム",
    role: "admin",
    section: "usage",
    members: [
      { id: "user-1", name: "テストユーザー", role: "admin", isSelf: true },
      { id: "user-2", name: "家族メンバー", role: "member" },
    ],
    usageContent: <UsageComponent scope="community" usage={sampleUsage} />,
  },
  decorators: [
    (Story) => (
      <Box h={600}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof CommunitySettingsView>
export default meta
type Story = StoryObj<typeof meta>

export const Usage: Story = {
  name: "Visual · 利用状況",
  tags: ["visual"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("table")).toBeVisible()
    await expect(
      canvas.getByText(
        "このCommunityが管理する登録済みオリジナルファイルの使用状況を確認します。",
      ),
    ).toBeVisible()
  },
}

export const Empty: Story = {
  name: "Visual · 登録0件",
  tags: ["visual"],
  args: { usageContent: <UsageComponent scope="community" usage={zeroUsage} /> },
}

export const ErrorState: Story = {
  name: "Visual · 取得失敗",
  tags: ["visual"],
  args: {
    usageContent: (
      <UsageComponent scope="community" usage={sampleUsage} status="error" />
    ),
  },
}

export const LoadingState: Story = {
  name: "Visual · 読み込み中",
  tags: ["visual"],
  args: {
    usageContent: (
      <UsageComponent scope="community" usage={sampleUsage} status="loading" />
    ),
  },
}
