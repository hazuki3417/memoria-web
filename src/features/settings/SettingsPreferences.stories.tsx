import { Box, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
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

export const PreferenceSections: Story = {
  name: "Interaction · 設定項目の表示",
  tags: ["interaction"],
  args: { section: "preferences" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const label of ["表示テーマ", "Personal Accent Color", "日付形式", "ファイルサイズの単位", "Mediaサムネイルサイズ"]) {
      await expect(canvas.getByLabelText(label)).toBeVisible()
    }
    await expect(canvas.getByText("Media Detailの前後Navigation循環")).toBeVisible()
    await expect(canvas.getByText("詳細情報の初期表示（Wide）")).toBeVisible()
    await expect(canvas.getByText("詳細情報の初期表示（Medium）")).toBeVisible()
  },
}

export const PreviewToggle: Story = {
  name: "Interaction · Media Detail循環設定",
  tags: ["interaction"],
  args: { section: "preferences" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const row = canvas.getByText("Media Detailの前後Navigation循環").closest("div")
    await expect(row).not.toBeNull()
    const input = canvas.getAllByRole("switch")[0]
    const previous = (input as HTMLInputElement).checked
    await userEvent.click(input)
    await expect(input).toHaveProperty("checked", !previous)
  },
}
