import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, within } from "storybook/test"
import { SettingsUsage } from "@/features/usage/SettingsUsage"
import { sampleUsage, zeroUsage } from "@/features/usage/usageStoryFixtures"
import { SettingsSectionContent } from "./SettingsSectionContent"

const meta = {
  title: "Features/Settings/Usage",
  component: SettingsSectionContent,
  args: {
    section: "usage",
    usageContent: <SettingsUsage scope="personal" usage={sampleUsage} />,
  },
  decorators: [(Story) => <Box maw={760} p="md"><Story /></Box>],
} satisfies Meta<typeof SettingsSectionContent>
export default meta
type Story = StoryObj<typeof meta>

export const Usage: Story = {
  name: "Visual · 利用状況",
  tags: ["visual"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("table")).toBeVisible()
    await expect(canvas.getByText("Personal Mediaの登録済みオリジナルファイルの使用状況を確認します。")).toBeVisible()
  },
}

export const Empty: Story = {
  name: "Visual · 登録0件",
  tags: ["visual"],
  args: { usageContent: <SettingsUsage scope="personal" usage={zeroUsage} /> },
}

export const ErrorState: Story = {
  name: "Visual · 取得失敗",
  tags: ["visual"],
  args: {
    usageContent: <SettingsUsage scope="personal" usage={sampleUsage} status="error" />,
  },
}

export const LoadingState: Story = {
  name: "Visual · 読み込み中",
  tags: ["visual"],
  args: {
    usageContent: <SettingsUsage scope="personal" usage={sampleUsage} status="loading" />,
  },
}
