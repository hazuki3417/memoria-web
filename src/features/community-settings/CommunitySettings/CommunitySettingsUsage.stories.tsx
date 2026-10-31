import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, within } from "storybook/test"
import { SettingsUsage } from "@/features/usage/SettingsUsage"
import { sampleUsage, zeroUsage } from "@/features/usage/usageStoryFixtures"
import { CommunitySettings } from "./CommunitySettings"

const meta = {
  title: "Features/Community Settings/Usage",
  component: CommunitySettings,
  args: {
    communityId: "photo-club",
    communityName: "家族のアルバム",
    role: "admin",
    section: "usage",
    members: [
      { id: "user-1", name: "テストユーザー", role: "admin", isSelf: true },
      { id: "user-2", name: "家族メンバー", role: "member" },
    ],
    usageContent: <SettingsUsage scope="community" usage={sampleUsage} />,
  },
  decorators: [(Story) => <Box h={600}><Story /></Box>],
} satisfies Meta<typeof CommunitySettings>
export default meta
type Story = StoryObj<typeof meta>

export const Usage: Story = {
  name: "Visual · 利用状況",
  tags: ["visual"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("table")).toBeVisible()
    await expect(canvas.getByText("このCommunityが管理する登録済みオリジナルファイルの使用状況を確認します。")).toBeVisible()
  },
}

export const Empty: Story = {
  name: "Visual · 登録0件",
  tags: ["visual"],
  args: { usageContent: <SettingsUsage scope="community" usage={zeroUsage} /> },
}

export const ErrorState: Story = {
  name: "Visual · 取得失敗",
  tags: ["visual"],
  args: {
    usageContent: <SettingsUsage scope="community" usage={sampleUsage} status="error" />,
  },
}

export const LoadingState: Story = {
  name: "Visual · 読み込み中",
  tags: ["visual"],
  args: {
    usageContent: <SettingsUsage scope="community" usage={sampleUsage} status="loading" />,
  },
}
